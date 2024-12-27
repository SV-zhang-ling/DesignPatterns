import { debounce } from "xe-utils";
import { getCustomTagName } from "@/utils/customElementAttr";
import { ContainerNameEnum } from "@/enums";
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
  downBoundary?: number;
  rows?: number;
}
const targetMap = new WeakMap();
export let isAutoRoomBScan = false;
let downBoundaryValue = 0;
let rowsSum = 0;

export const handleMultipleLineBscanAutoZoom = (
  el: HTMLElement,
  flag: boolean | undefined
) => {
  isAutoRoomBScan = flag || false;
  const { width, height } = el.getBoundingClientRect();
  handleResize({ target: el, width, height });
};
export const handleLineScanBscanAutoZoom = (el: HTMLElement) => {
  isAutoRoomBScan = !isAutoRoomBScan;
  const { width, height } = el.getBoundingClientRect();
  handleResize({ target: el, width, height });
};
export const resetView = (el: HTMLElement) => {
  const { width, height } = el.getBoundingClientRect();
  handleResize({ target: el, width, height });
};
interface AsyncResizeParams {
  target: Element;
  width: number;
  height: number;
  scale?: string;
}
const handleResize = ({
  target,
  width,
  height,
  scale = "1"
}: AsyncResizeParams) => {
  if (!targetMap.get(target)) return;

  const { innerContainerDom, innerWidth, innerHeight } = targetMap.get(target);
  const isManualBscan =
    getCustomTagName(innerContainerDom) === ContainerNameEnum.ManualBscan;
  scale = isManualBscan ? "0.85" : scale;
  const outerRatio: number = width / height; //外部容器宽高比
  const innerRation: number = innerWidth / innerHeight; //内部容器宽高比
  // 根据内外宽高比的大小选择不同的缩放基准和定位策略
  const scaleRatio: number =
    outerRatio > innerRation ? height / innerHeight : width / innerWidth;
  // 重置 手动放大缩小scale为1
  innerContainerDom.style.scale = scale;
  // resizeInnerContainer
  innerContainerDom.style.transform = `scale(${scaleRatio})`;
  innerContainerDom.style.left = (width - innerWidth) / 2 + "px";
  innerContainerDom.style.top = (height - innerHeight) / 2 + "px";

  const isLineScanBscan =
    getCustomTagName(innerContainerDom) === ContainerNameEnum.LineScanBscan;
  // auto-room 处理
  if (isAutoRoomBScan && isLineScanBscan) {
    const { width: currentWidth, height: currentHeight } =
      innerContainerDom.getBoundingClientRect();
    const dx = width - currentWidth;
    const dy = height - currentHeight;
    if (dy > dx) {
      // const autoRoomRatio = height / currentHeight;
      // innerContainerDom.style.scale = String(autoRoomRatio);
    } else {
      const autoRoomRatio = width / currentWidth;
      innerContainerDom.style.scale = String(autoRoomRatio);
      // 以topBoundary为适配点适配下边界
      // const analysisCommonStore = useAnalysisCommonStoreHook();
      // const { downBoundary, dim_axial } = analysisCommonStore;
      // const topBoundaryRenderPixel =
      //   (downBoundary / dim_axial) * currentHeight * autoRoomRatio;
      // console.log(
      //   "topBoundaryRenderPixel",
      //   downBoundary,
      //   dim_axial,
      //   currentHeight,
      //   topBoundaryRenderPixel
      // );
    }
  }
  const componentName = getCustomTagName(
    innerContainerDom
  ) as ContainerNameEnum;
  componentName.toLocaleLowerCase().indexOf("bscan") > -1 &&
    updateBscanZoomRuler(innerContainerDom, componentName);
};
const resize = (entries: Array<ResizeObserverEntry>) => {
  if (window.isCubeFullScreen) {
    window.isCubeFullScreen = false;
    return;
  }

  entries.forEach(entry => {
    const { contentRect, target } = entry;
    const { width, height } = contentRect;
    handleResize({ target, width, height });
  });
};
const debounce_resize = debounce(resize, 16.6);
let resizeObserver: ResizeObserver | null;
export const initResizeObserver = () => {
  resizeObserver = new ResizeObserver(debounce_resize);
};
export const disconnectResizeObserver = () => {
  resizeObserver?.disconnect();
  isAutoRoomBScan = false;
  downBoundaryValue = 0;
  rowsSum = 0;
};
// 自适应逻辑
export const autoResize = (params: resizeParams) => {
  const {
    viewportDom,
    innerContainerDom,
    innerWidth,
    innerHeight,
    downBoundary,
    rows
  } = params;
  downBoundaryValue = downBoundary || 0;
  rowsSum = rows || 0;
  targetMap.set(viewportDom, {
    innerContainerDom,
    innerWidth,
    innerHeight
  });
  // 函数防抖，默认在每段间隔的最后一刻执行，防抖时间设置为16.6ms，默认屏幕刷新率为60hz，和屏幕渲染刷新率保持同步，后期会优化到，监控不同屏幕的刷新率自动设置刷新率
  resizeObserver?.observe(viewportDom);
  return resizeObserver;
};
