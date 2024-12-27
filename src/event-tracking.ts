import Analytics, { AnalyticsInstance, DetachListeners } from "analytics";
import { inject } from "vue";
import { saveTrackData } from "./api/analytics";
import { usePatientStoreHook } from "./views/patient/store/patient";
import { PageRoute } from "./utils/route";
import { useCaptureStoreHook } from "./views/patient/store/capture";
import type { Router } from "vue-router";
import type { App } from "vue";
import type { RouteLocationNormalized } from "vue-router";
import type {
  ClickTarget,
  EventTypes,
  AnalyticsHistoryItem
} from "./event-tracking.d";

export enum PageTypeEnum {
  ENTER = "enter",
  LEAVE = "leave"
}
export enum EventTypeEnum {
  PAGE,
  MOUSE
}
export enum ModalEnum {
  ReportPrint = "ReportPrint",
  EditLayer = "EditLayer"
}
enum ListenerEnum {
  PAGE = "page",
  CLICK = "click"
}

const trackerKey = Symbol(
  process.env.NODE_ENV !== "production" ? "eventTracker" : ""
);
type PageName = keyof typeof PageRoute;
const pageMap = Object.keys(PageRoute).reduce(
  (acc: Record<string, PageName>, curr) => {
    acc[PageRoute[curr as PageName]] = curr as PageName;
    return acc;
  },
  {}
);

const useExtraTrackData = () => {
  const patientID = usePatientStoreHook().activePatient.ID;
  const captureID = useCaptureStoreHook().activeCaptureData.ID;
  return {
    patientID: patientID || undefined,
    captureID: captureID || undefined
  };
};
const pageEventHandler = (
  analytics: AnalyticsInstance,
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => {
  const extraData = useExtraTrackData();
  // leave
  analytics.track(ListenerEnum.PAGE, {
    pageName: pageMap[from.path] || from.name,
    path: from.fullPath,
    type: PageTypeEnum.LEAVE,
    ...extraData
  });

  // to
  analytics.page({
    name: pageMap[to.path] || to.name,
    path: to.fullPath,
    type: PageTypeEnum.ENTER
  });
  analytics.track(ListenerEnum.PAGE, {
    pageName: pageMap[to.path] || to.name,
    path: to.fullPath,
    type: PageTypeEnum.ENTER,
    ...extraData
  });
};
const modalEventHandler = (
  analytics: AnalyticsInstance,
  page: RouteLocationNormalized,
  name: ModalEnum,
  open: 0 | 1
) => {
  const extraData = useExtraTrackData();
  const pageName = pageMap[page.path] || page.name;
  // leave
  analytics.track(ListenerEnum.PAGE, {
    pageName: open ? pageName : name,
    path: page.fullPath,
    type: PageTypeEnum.LEAVE,
    ...extraData
  });

  // to
  analytics.track(ListenerEnum.PAGE, {
    pageName: open ? name : pageName,
    path: page.fullPath,
    type: PageTypeEnum.ENTER,
    ...extraData
  });
};
const createEventTracker = (router: Router) => {
  const analytics = Analytics({
    app: "Picasso"
  });

  const trackPageEvents = () => {
    router.afterEach((to, from) => pageEventHandler(analytics, to, from));
  };

  const trackMouseEvents = () => {
    document.addEventListener("click", ev => {
      let dom = ev.target as HTMLElement | null;
      const domList = [];
      const analyticsLabelList = [];
      while (dom) {
        const node: ClickTarget = {
          nodeName: dom.nodeName,
          className: dom.className
        };
        if (dom.dataset.analyticsLabel) {
          node.analyticsLabel = dom.dataset.analyticsLabel;
          analyticsLabelList.unshift(dom.dataset.analyticsLabel);
        }
        domList.unshift(node);
        dom = dom.parentElement;
      }
      if (domList.length) {
        analytics.track(ListenerEnum.CLICK, {
          page: analytics.getState().page.last,
          target: domList.pop(),
          parentList: domList,
          analyticsLabelList: analyticsLabelList.length
            ? analyticsLabelList
            : undefined
        });
      }
    });
  };
  const traceLogMap: Record<string, AnalyticsHistoryItem> = {};

  let removeTrackListener: DetachListeners;
  const startTrack = (eventsArr: EventTypes) => {
    if (removeTrackListener) {
      removeTrackListener();
    }
    removeTrackListener = analytics.on("track", ({ payload }) => {
      traceLogMap[payload.meta.rid] = payload;
      // 等待当前 track 被计入到 history 中
      nextTick(() => {
        const traceHistory = analytics
          .getState("track.history")
          .filter((item: AnalyticsHistoryItem) => {
            if (item.meta.rid in traceLogMap) {
              delete traceLogMap[item.meta.rid]; // 假设后端请求成功
              return true;
            }
          });
        if (traceHistory && traceHistory.length) {
          saveTrackData(
            traceHistory.map((item: AnalyticsHistoryItem) => ({
              ...item.properties,
              event: item.event,
              timestamp: item.meta.ts
            }))
          )
            .then(() => {
              analytics.reset();
            })
            .catch(() => {
              traceHistory.forEach((item: AnalyticsHistoryItem) => {
                traceLogMap[item.meta.rid] = item; // 请求失败，恢复
              });
            });
        }
      });
    });
    if (eventsArr.includes(EventTypeEnum.PAGE)) {
      trackPageEvents();
    }
    if (eventsArr.includes(EventTypeEnum.MOUSE)) {
      trackMouseEvents();
    }
  };

  return {
    install(app: App, { events }: { events: EventTypes }) {
      if (process.env.NODE_ENV === "development") {
        window.analytics = analytics;
      }
      app.config.globalProperties.$analytics = analytics;
      app.provide(trackerKey, analytics);
      startTrack(events);
    }
  };
};
const useEventTracker = () => {
  const analytics = inject(trackerKey) as AnalyticsInstance;
  return {
    analytics,
    triggerPageEvent: (
      ...args: [RouteLocationNormalized, RouteLocationNormalized]
    ) => pageEventHandler(analytics, ...args),
    triggerModalEvent: (
      page: RouteLocationNormalized,
      modalName: ModalEnum,
      open: 0 | 1
    ) => modalEventHandler(analytics, page, modalName, open)
  };
};
export { createEventTracker, useEventTracker };
