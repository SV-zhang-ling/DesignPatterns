import { ContainerNameEnum } from "@/enums";
import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { useAdvancedSegStoreHook } from "@/views/analysis/posterior/advancedSeg/store/advancedSeg";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
// import { useMultipleAngioStoreHook } from "@/views/analysis/posterior/angio/multiple/store";
// import { useMultipleLineScanStoreHook } from "@/views/analysis/lineScan/multiple/store";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { handleResizeAtFullScreen } from "@/utils/autoResize";
import { handleGroupResizeAtFullScreen } from "@/utils/autoResize/groupResize";
import { fullScreenChangeMeasures } from "@/utils/tools/measureTools/index";
import { clearMeasureGlobalData } from "@/utils/tools/measureTools/clearAll";
import { useStructuralProjStoreHook } from "@/views/analysis/structuralProj/store";
import { PageRoute } from "@/utils/route";
import router from "@/router";

let currentComponentName: ContainerNameEnum;
// handle enter full screen
export const enterFullScreen = async (
  viewportDom: HTMLElement,
  componentName: ContainerNameEnum,
  captureKey?: string
) => {
  const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
  if (
    captureKey &&
    captureKey !== analysisMultipleCommonStore.activeCaptureCard?.captureKey
  )
    return;

  clearMeasureGlobalData({ viewportDom, isStay: true });
  const angioStore = useAngioStoreHook();
  const advancedSegStore = useAdvancedSegStoreHook();
  const contextmenuStore = useContextmenuStoreHook();
  const structuralProjStore = useStructuralProjStoreHook();

  contextmenuStore.setTargetName(componentName);
  contextmenuStore.setFullScreenMenuActive(componentName);

  let currStore;
  switch (componentName) {
    case ContainerNameEnum.FastBScan:
    case ContainerNameEnum.SlowBScanMain:
    case ContainerNameEnum.SlowBScanAttach:
      currStore = angioStore;
      break;
    case ContainerNameEnum.AdvancedSegBscan:
      currStore = advancedSegStore;
      break;
    case ContainerNameEnum.OctSlowBscan:
    case ContainerNameEnum.OctFastBscan:
      currStore = structuralProjStore;
      break;
    default:
      break;
  }

  currStore && currStore.setbscanZooming(true);

  viewportDom?.classList.add("full-screen");
  currentComponentName = componentName;
  captureKey && router.currentRoute.value.path === PageRoute.MultipleAngio
    ? handleGroupResizeAtFullScreen(componentName, true, captureKey)
    : handleResizeAtFullScreen(componentName, true);
  currStore && currStore.setZoomTarget(viewportDom);

  addESCListener(viewportDom, componentName);
  await fullScreenChangeMeasures(viewportDom, componentName);
};

// handle exit full screen
export const exitFullScreen = async (
  viewportDom: HTMLElement,
  componentName: ContainerNameEnum,
  captureKey?: string
) => {
  const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
  if (
    captureKey &&
    captureKey !== analysisMultipleCommonStore.activeCaptureCard?.captureKey
  )
    return;
  clearMeasureGlobalData({ viewportDom, isStay: true });
  const contextmenuStore = useContextmenuStoreHook();
  contextmenuStore.setExitFullScreenMenuActive(componentName);
  const angioStore = useAngioStoreHook();
  const advancedSegStore = useAdvancedSegStoreHook();
  const structuralProjStore = useStructuralProjStoreHook();

  viewportDom?.classList.remove("full-screen");
  captureKey && router.currentRoute.value.path === PageRoute.MultipleAngio
    ? handleGroupResizeAtFullScreen(componentName, false, captureKey)
    : handleResizeAtFullScreen(componentName, false);

  angioStore.setbscanZooming(false);
  advancedSegStore.setbscanZooming(false);
  structuralProjStore.setbscanZooming(false);

  await fullScreenChangeMeasures(viewportDom, componentName);
};

// add esc event listener
export const addESCListener = (
  viewportDom: HTMLElement,
  componentName: ContainerNameEnum
) => {
  const contextmenuStore = useContextmenuStoreHook();
  document.addEventListener("keydown", function (event) {
    if (
      (event.key === "Escape" || event.keyCode === 27) &&
      !window.isMeasureStatus
    ) {
      // 处理按下 Esc 键的操作
      exitFullScreen(viewportDom, componentName);
      // set the exit full screen item as active
      contextmenuStore.setExitFullScreenMenuActive(componentName);
    }
  });
};
