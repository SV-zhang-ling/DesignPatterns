import { onBeforeRouteLeave } from "vue-router";
import { disconnectResizeObserver } from "@/utils/autoResize/index";
import { rouerLeaveSaveMeasureDraw } from "@/utils/tools/measureTools/index";
import { PageRoute } from "@/utils/route";
import { releaseServerCache } from "@/api/common";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";

// release backend cache
export const callRelease = (captureKey: string) => {
  const selectedKeys = [captureKey];
  const selectedDataInSession = sessionStorage.getItem("selectedData");
  const selectData = selectedDataInSession && JSON.parse(selectedDataInSession);
  selectData &&
    [...selectData.changeSelectedList, ...selectData.ouSelectedList].forEach(
      item => {
        if (item.captureKey && !selectedKeys.includes(item.captureKey)) {
          selectedKeys.push(item.captureKey);
        }
      }
    );
  selectedKeys.forEach(key => {
    releaseServerCache({ captureKey: key });
  });
};

export function useBeforeRouteLeave(cb?: () => void) {
  const editLayersStore = useEditLayersStoreHook();
  editLayersStore.showEditLayerDig &&
    editLayersStore.setEditLayerDigVisible(false);

  const showContainer = ref<boolean>(true);

  disconnectResizeObserver();
  onBeforeRouteLeave(async (to, from, next) => {
    const { fullPath } = to;
    if (fullPath === PageRoute.Login) {
      next();
      return;
    }

    try {
      await rouerLeaveSaveMeasureDraw();

      showContainer.value = false;
      cb && cb();

      if (fullPath === PageRoute.Patient && from.query.captureKey) {
        // 返回PA页面时调用release方法
        callRelease(from.query.captureKey as string);
      }

      const containerRef = document.getElementsByClassName(
        "analysis-container"
      )[0] as HTMLElement;
      containerRef && (containerRef.style.display = "none");

      next();
    } catch (err) {
      next(false);
    }
  });

  return {
    showContainer
  };
}
