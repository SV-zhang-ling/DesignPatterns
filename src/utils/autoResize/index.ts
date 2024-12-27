import { debounce } from "xe-utils";
import { ContainerNameEnum } from "@/enums";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { isONHScanProtocol } from "@/utils/protocol";
import router from "@/router";
import { PageRoute } from "../route";
import { updateBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";
interface innerContainerSize {
  innerWidth: number;
  innerHeight: number;
}
interface innerContainer extends innerContainerSize {
  innerContainerDom: HTMLDivElement;
}
interface resizeParams extends innerContainer {
  viewportDom: HTMLDivElement;
  componentName: ContainerNameEnum;
}
const noBscanAutoZoomPages = [PageRoute.AsStructuralProj];
const resizeTargets = new Map();
export let isAutoRoomBScan = true;
let isFullScreenStatus = false;
let angioProjection: resizeParams | null;
export const isBScan = (componentName: ContainerNameEnum) =>
  [
    ContainerNameEnum.SlowBScanMain,
    ContainerNameEnum.SlowBScanAttach,
    ContainerNameEnum.AdvancedSegBscan,
    ContainerNameEnum.FastBScan,
    ContainerNameEnum.OctSlowBscan,
    ContainerNameEnum.OctFastBscan,
    ContainerNameEnum.SaveSlowBScanMain,
    ContainerNameEnum.SaveSlowBScanAttach,
    ContainerNameEnum.SaveFastBScan
  ].includes(componentName);
// image viewer mounted时，先resize一次
export const addResizeTarget = (target: resizeParams) => {
  const { componentName, ...payload } = target;
  if (
    componentName === ContainerNameEnum.FullScope ||
    componentName === ContainerNameEnum.OCTScope
  ) {
    angioProjection = target;
  } else {
    resizeTargets.set(componentName, payload);

    handleResize(target);
  }
};
// image viewer 全屏/退出全屏时，再resize一次
export const handleResizeAtFullScreen = (
  componentName: ContainerNameEnum,
  fullScreen: boolean
) => {
  isFullScreenStatus = fullScreen;
  const target =
    componentName === ContainerNameEnum.FullScope ||
    componentName === ContainerNameEnum.OCTScope
      ? angioProjection
      : resizeTargets.get(componentName);
  handleResize({ ...target, componentName });
};
// image viewer 切换auto-zoom时，再resize一次
export const handleResizeAtAutoZoom = () => {
  isAutoRoomBScan = !isAutoRoomBScan;
  resizeTargets.forEach((value, componentName) => {
    isBScan(componentName) && handleResize({ ...value, componentName });
  });
};
export const handleMultipleAngioBscanAutoZoom = (
  el: HTMLElement,
  flag: boolean | undefined
) => {
  isAutoRoomBScan = flag || false;
  resizeTargets.forEach((value, componentName) => {
    isBScan(componentName) && handleResize({ ...value, componentName });
  });
};
// slo-oct切换时，再resize一次
export const handleResizeAtFullScope = (componentName: ContainerNameEnum) => {
  const target =
    componentName === ContainerNameEnum.FullScope ||
    componentName === ContainerNameEnum.OCTScope
      ? angioProjection
      : resizeTargets.get(componentName);
  handleResize({ ...target, componentName });
};
export const resetViewAtSyncResize = (
  el: HTMLElement,
  isRightZoom?: boolean
) => {
  if (!angioProjection) return;
  const temp = isAutoRoomBScan;
  isRightZoom && (isAutoRoomBScan = false);
  if (angioProjection.viewportDom === el) {
    handleResize(angioProjection);
  } else {
    resizeTargets.forEach((value, componentName) => {
      if (value.viewportDom === el) {
        handleResize({ ...value, componentName });
      }
    });
  }
  isRightZoom && (isAutoRoomBScan = temp);
};
export const resize = () => {
  requestIdleCallback(() => {
    angioProjection && handleResize(angioProjection as resizeParams);
    resizeTargets.forEach((value, componentName) => {
      handleResize({ ...value, componentName });
    });
  });
};

export const handleResize = ({
  viewportDom,
  innerContainerDom,
  innerWidth,
  innerHeight,
  componentName
}: resizeParams) => {
  if (!viewportDom) return;
  const contentRect = viewportDom.getBoundingClientRect();
  const { width, height, top, bottom } = contentRect;
  const outerRatio: number = width / height; //外部容器宽高比
  const innerRation: number = innerWidth / innerHeight; //内部容器宽高比
  // 根据内外宽高比的大小选择不同的缩放基准和定位策略
  const scaleRatio: number =
    outerRatio > innerRation ? height / innerHeight : width / innerWidth;
  innerContainerDom.style.scale = "1";
  // resizeInnerContainer
  innerContainerDom.style.left = (width - innerWidth) / 2 + "px";
  const cachedTop = (height - innerHeight) / 2;
  innerContainerDom.style.top = cachedTop + "px";
  innerContainerDom.style.transform = `scale(${scaleRatio})`;
  if (
    isBScan(componentName) &&
    isAutoRoomBScan &&
    !noBscanAutoZoomPages.includes(router.currentRoute.value.path)
  ) {
    if (angioProjection) {
      const { width: angioProjectionWidth } = (
        angioProjection as resizeParams
      ).innerContainerDom.getBoundingClientRect();
      const { width: currentWidth } = innerContainerDom.getBoundingClientRect();
      const autoRoomRatio = isFullScreenStatus
        ? width / currentWidth
        : angioProjectionWidth / currentWidth;
      !window.isAllSaveImages &&
        (innerContainerDom.style.scale = String(autoRoomRatio));
      /**
       * 计算auto-room下 bscan需要上下适配移动的距离
       * 目前的策略是以整体分层线体数据计算下的 最高上边界分层线为分界线适配bscan有效视野范围
       */
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { downBoundary, dim_axial, protocolName } = analysisCommonStore;
      // 更好的做法是判断最高点和最低点的矩形区域在上方还是下方，如果在上方多则以上为底，如果在下面多则以下为底
      const realBottomBoundary = isONHScanProtocol(protocolName)
        ? downBoundary - 60 // ONH 边界为 BM层 + 140， 尽可能让下边界贴近视窗底部，以保障获得更大的ONH视野范围。等ONH显示比例正常时，还需再调整数值
        : downBoundary; // 血流协议则正常BM层 + 200 为边界
      const { height: roomedAfterHeight, top: roomedAfterTop } =
        innerContainerDom.getBoundingClientRect();
      const downBoundaryRenderPixel =
        roomedAfterHeight * (realBottomBoundary / dim_axial);
      const bottomDx = (roomedAfterHeight - height) / 2;
      const translate = roomedAfterTop + downBoundaryRenderPixel - bottom;
      if (bottomDx < 0) return;
      const lastCachedTop = cachedTop - translate;
      innerContainerDom.style.top = lastCachedTop + "px";
      // // 再次确认translate 后下边有没有黑色空白
      const { bottom: currentBottom, top: currentTop } =
        innerContainerDom.getBoundingClientRect();
      const deltaBottom = currentBottom - bottom;
      const deltaTop = top - currentTop;
      if (deltaTop < 0) {
        innerContainerDom.style.top = lastCachedTop + deltaTop + "px";
      }
      if (deltaBottom < 0) {
        innerContainerDom.style.top = lastCachedTop - deltaBottom + "px";
      }
    }
  }
  componentName.toLocaleLowerCase().indexOf("bscan") > -1 &&
    updateBscanZoomRuler(innerContainerDom, componentName);
};
const debounce_resize = debounce(resize, 16.6);
let resizeObserver: ResizeObserver | null;
export const initResizeObserver = () => {
  resizeObserver = new ResizeObserver(debounce_resize);
};
export const disconnectResizeObserver = () => {
  resizeObserver?.disconnect();
  // 释放map内dom元素引用,避免游离dom
  resizeTargets.forEach(key => {
    resizeTargets.delete(key);
  });
  angioProjection = null;
  // 离开分析界面时，重置 isAutoRoomBScan 为true
  isAutoRoomBScan = true;
  isFullScreenStatus = false;
};
// 自适应逻辑
export const autoResize = (dom: HTMLDivElement) => {
  // 函数防抖，默认在每段间隔的最后一刻执行，防抖时间设置为16.6ms，默认屏幕刷新率为60hz，和屏幕渲染刷新率保持同步，后期会优化到，监控不同屏幕的刷新率自动设置刷新率
  resizeObserver?.observe(dom);
  return resizeObserver;
};
