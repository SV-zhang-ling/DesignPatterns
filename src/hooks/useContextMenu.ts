import router from "@/router";
import {
  ContainerNameEnum,
  ContextmenuTypeEnum,
  SaveImagesClassNameEnum
} from "@/enums";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
import { enterFullScreen, exitFullScreen } from "@/utils/contextmenu";
import {
  handleSaveBscanImages,
  handleSaveImage,
  handleSaveAllBscanAngio,
  handleSaveAllBscanOct
} from "@/utils/image";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { useAdvancedSegStoreHook } from "@/views/analysis/posterior/advancedSeg/store/advancedSeg";
import { useLineScanStore } from "@/views/analysis/lineScan/single/store/index";
import { useMultipleLineScanStoreHook } from "@/views/analysis/lineScan/multiple/store";
import { useMultipleAngioStoreHook } from "@/views/analysis/posterior/angio/multiple/store";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import { drawRulerLine } from "@/utils/tools/measureTools/ruler";
import { drawArrowLine } from "@/utils/tools/measureTools/arrow";
import { drawTextArea } from "@/utils/tools/measureTools/text";
import { clearMeasureGlobalData } from "@/utils/tools/measureTools/clearAll";
import {
  handleResizeAtAutoZoom,
  handleMultipleAngioBscanAutoZoom,
  resetViewAtSyncResize
} from "@/utils/autoResize";
import {
  handleLineScanBscanAutoZoom,
  handleMultipleLineBscanAutoZoom,
  resetView
} from "@/utils/autoResize/asyncResize";
import { resetGroupResizeView } from "@/utils/autoResize/groupResize";
import { PageRoute } from "@/utils/route";
import { useStructuralProjStoreHook } from "@/views/analysis/structuralProj/store";
import { useMosaicStoreHook } from "@/views/analysis/mosaic/store/mosaic";
import { useCubeStoreHook } from "@/views/analysis/cube/store";

// handle menu clicked in the contextmenu list
export function useContextMenu() {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const contextmenuStore = useContextmenuStoreHook();
  const angioStore = useAngioStoreHook();
  const advancedSegStore = useAdvancedSegStoreHook();
  const lineScanStore = useLineScanStore();
  const multipleLineScanStore = useMultipleLineScanStoreHook();
  const multipleAngioStore = useMultipleAngioStoreHook();
  const editLayersStore = useEditLayersStoreHook();
  const structuralProjStore = useStructuralProjStoreHook();
  const mosaicStore = useMosaicStoreHook();
  const cubeStore = useCubeStoreHook();

  const resetViewByProtocal = ({
    el,
    componentName,
    captureKey,
    isRightZoom
  }: {
    el: HTMLElement;
    componentName: ContainerNameEnum;
    captureKey?: string;
    isRightZoom?: boolean;
  }) => {
    const { path } = analysisCommonStore;
    captureKey && resetGroupResizeView(el, componentName, captureKey);
    if (
      [
        PageRoute.Angiography,
        PageRoute.AdvancedSeg,
        PageRoute.AngioRetinaEnhanced,
        PageRoute.StructuralProjection,
        PageRoute.AsStructuralProj
      ].includes(path)
    ) {
      resetViewAtSyncResize(el, isRightZoom);
      return;
    }

    resetView(el);
  };

  const handleMenuClick = ({
    el,
    targetName,
    captureKey
  }: {
    el: HTMLElement;
    targetName: ContainerNameEnum;
    captureKey: string;
  }) => {
    const { activeMenu } = contextmenuStore;
    const path = router.currentRoute.value.path;
    let currStore;
    switch (path) {
      case PageRoute.Angiography:
      case PageRoute.AngioRetinaEnhanced:
        currStore = angioStore;
        break;
      case PageRoute.AdvancedSeg:
        currStore = advancedSegStore;
        break;
      case PageRoute.StructuralProjection:
      case PageRoute.AsStructuralProj:
        currStore = structuralProjStore;
        break;
      case PageRoute.Cube:
      case PageRoute.AsCube:
        currStore = cubeStore;
        break;
      default:
        break;
    }
    switch (activeMenu?.name) {
      case ContextmenuTypeEnum.FastBScan:
        angioStore.showFastBscan = activeMenu.active as boolean;
        break;
      case ContextmenuTypeEnum.Smooth0:
      case ContextmenuTypeEnum.Smooth1:
      case ContextmenuTypeEnum.Smooth2:
      case ContextmenuTypeEnum.Smooth3:
        targetName === ContainerNameEnum.LineScanBscan &&
          (lineScanStore.bscanSmooth = activeMenu.name);

        if (
          [
            ContainerNameEnum.SlowBScanMain,
            ContainerNameEnum.SlowBScanAttach,
            ContainerNameEnum.FastBScan,
            ContainerNameEnum.OctSlowBscan,
            ContainerNameEnum.OctFastBscan,
            ContainerNameEnum.CubeSlowBscan,
            ContainerNameEnum.CubeFastBscan
          ].includes(targetName)
        ) {
          currStore && (currStore.bscanSmooth = activeMenu.name);

          path === PageRoute.MultipleAngio &&
            multipleAngioStore.setBscanSmooth(activeMenu.name, captureKey);
        }

        targetName === ContainerNameEnum.AdvancedSegBscan &&
          (advancedSegStore.bscanSmooth = activeMenu.name);
        break;
      case ContextmenuTypeEnum.Gray:
      case ContextmenuTypeEnum.Inverse:
      case ContextmenuTypeEnum.Hot:
      case ContextmenuTypeEnum.Rainbow:
      case ContextmenuTypeEnum.Classic:
        // update on bscan
        if (
          [
            ContainerNameEnum.SlowBScanMain,
            ContainerNameEnum.SlowBScanAttach,
            ContainerNameEnum.FastBScan,
            ContainerNameEnum.OctSlowBscan,
            ContainerNameEnum.OctFastBscan,
            ContainerNameEnum.CubeSlowBscan,
            ContainerNameEnum.CubeFastBscan,
            ContainerNameEnum.AdvancedSegBscan
          ].includes(targetName)
        ) {
          currStore && (currStore.bscanProcessorType = activeMenu.name);

          path === PageRoute.MultipleAngio &&
            multipleAngioStore.setBscanProcessorType(
              activeMenu.name,
              captureKey
            );
        }

        // update on angio
        if (targetName === ContainerNameEnum.AngioProj) {
          (path === PageRoute.Angiography ||
            path === PageRoute.AngioRetinaEnhanced) &&
            (angioStore.angioProcessorType = activeMenu.name);
          path === PageRoute.MultipleAngio &&
            multipleAngioStore.setAngioProcessorType(
              activeMenu.name,
              captureKey
            );
        }

        // update on oct
        if (
          [
            ContainerNameEnum.SloOct,
            ContainerNameEnum.AdvancedSegSlo,
            ContainerNameEnum.FullScope,
            ContainerNameEnum.OCTScope,
            ContainerNameEnum.StructuralProjOct
          ].includes(targetName)
        ) {
          currStore && (currStore.octProcessorType = activeMenu.name);
        }
        targetName === ContainerNameEnum.MosaicOctProj &&
          (mosaicStore.octProcessorType = activeMenu.name);

        // update on line scan bscan
        if (targetName === ContainerNameEnum.LineScanBscan) {
          path === PageRoute.LineScan &&
            (lineScanStore.bscanProcessorType = activeMenu.name);
          path === PageRoute.MultipleLineScan &&
            multipleLineScanStore.setBscanProcessorType(
              activeMenu.name,
              captureKey
            );
        }

        targetName === ContainerNameEnum.OCTViewer &&
          (editLayersStore.octProcessorType = activeMenu.name);
        break;
      case ContextmenuTypeEnum.FullScreen:
        enterFullScreen(el, targetName, captureKey);
        break;
      case ContextmenuTypeEnum.ExitFullScreen:
        exitFullScreen(el, targetName, captureKey);
        break;
      case ContextmenuTypeEnum.SaveImage:
        handleSaveImage(targetName, captureKey);
        break;
      case ContextmenuTypeEnum.SaveBscanSLOImage:
        window.isSaveImages = true;
        handleSaveBscanImages({
          el,
          targetName,
          classNameType: SaveImagesClassNameEnum.OCT,
          captureKey
        });
        break;
      case ContextmenuTypeEnum.SaveBscanAngioImage:
        window.isSaveImages = true;
        handleSaveBscanImages({
          el,
          targetName,
          classNameType: SaveImagesClassNameEnum.Angio,
          captureKey
        });
        break;
      case ContextmenuTypeEnum.saveAllBscanAngioImages:
        window.isAllSaveImages = true;
        handleSaveAllBscanAngio(el, targetName);
        break;
      case ContextmenuTypeEnum.saveAllBscanOctImages:
        window.isAllSaveImages = true;
        handleSaveAllBscanOct(el, targetName);
        break;
      case ContextmenuTypeEnum.ResetView:
        resetViewByProtocal({ el, componentName: targetName, captureKey });
        break;
      // Other menu action
      case ContextmenuTypeEnum.AutoZoomBScan:
        path === PageRoute.MultipleLineScan
          ? handleMultipleLineBscanAutoZoom(el, activeMenu.active)
          : targetName === ContainerNameEnum.LineScanBscan
          ? handleLineScanBscanAutoZoom(el)
          : path === PageRoute.MultipleAngio
          ? handleMultipleAngioBscanAutoZoom(el, activeMenu.active)
          : handleResizeAtAutoZoom();
        break;
      case ContextmenuTypeEnum.ShowCorrectedImage:
        lineScanStore.updateCorrectedValue(activeMenu.active);
        break;
      case ContextmenuTypeEnum.EditLayer:
        editLayersStore.setEditLayerDigVisible(true);
        break;
      case ContextmenuTypeEnum.Ruler:
        window.isMeasureStatus = true;
        drawRulerLine(el, captureKey);
        break;
      case ContextmenuTypeEnum.Arrow:
        window.isMeasureStatus = true;
        drawArrowLine(el, captureKey);
        break;
      case ContextmenuTypeEnum.Text:
        window.isMeasureStatus = true;
        drawTextArea(el, captureKey);
        break;
      case ContextmenuTypeEnum.ClearAll:
        clearMeasureGlobalData({ viewportDom: el, captureKey });
        break;
      default:
        throw new Error(
          `[Hook: useContextMenu]: No such menu name:: ${activeMenu?.name}!`
        );
    }
  };

  return {
    handleMenuClick,
    resetViewByProtocal
  };
}
