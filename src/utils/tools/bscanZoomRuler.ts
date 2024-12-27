import router from "@/router";
import { PageRoute } from "@/utils/route";
import { ContainerNameEnum } from "@/enums";
import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { useAdvancedSegStoreHook } from "@/views/analysis/posterior/advancedSeg/store/advancedSeg";
import { useStructuralProjStoreHook } from "@/views/analysis/structuralProj/store";
import { useCubeStoreHook } from "@/views/analysis/cube/store";
import { useLineScanStore } from "@/views/analysis/lineScan/single/store/index";
import { useMultipleAngioStoreHook } from "@/views/analysis/posterior/angio/multiple/store";
import { useMultipleLineScanStoreHook } from "@/views/analysis/lineScan/multiple/store";
import { useSaveImageStoreHook } from "@/views/analysis/components/saveImage/store";

/** 右键缩放触发 */
export const updateBscanZoomRuler = (
  innerContainerDom: HTMLElement,
  componentName: ContainerNameEnum,
  captureKey?: string
) => {
  const angioStore = useAngioStoreHook();
  const advancedSegStore = useAdvancedSegStoreHook();
  const structuralProjStore = useStructuralProjStoreHook();
  const cubeStore = useCubeStoreHook();
  const lineScanStore = useLineScanStore();
  const multipleAngioStore = useMultipleAngioStoreHook();
  const multipleLineScanStore = useMultipleLineScanStoreHook();
  const saveImageStore = useSaveImageStoreHook();
  const path = router.currentRoute.value.path;
  if (saveImageStore.showAngioBscan || saveImageStore.showSloBscan) {
    saveImageStore.bscanZoomRuler({
      innerContainerDom
    });
    return;
  }
  switch (path) {
    case PageRoute.Angiography:
    case PageRoute.AngioRetinaEnhanced:
      angioStore.bscanZoomRuler({ innerContainerDom, componentName });
      break;
    case PageRoute.AdvancedSeg:
      advancedSegStore.bscanZoomRuler({ innerContainerDom, componentName });
      break;
    case PageRoute.StructuralProjection:
    case PageRoute.AsStructuralProj:
      structuralProjStore.bscanZoomRuler({
        innerContainerDom,
        componentName
      });
      break;
    case PageRoute.Cube:
    case PageRoute.AsCube:
      cubeStore.bscanZoomRuler({ innerContainerDom, componentName });
      break;
    case PageRoute.LineScan:
      lineScanStore.bscanZoomRuler({ innerContainerDom, componentName });
      break;
    case PageRoute.MultipleAngio:
      multipleAngioStore.bscanZoomRuler({
        innerContainerDom,
        componentName,
        captureKey
      });
      break;
    case PageRoute.MultipleLineScan:
      multipleLineScanStore.bscanZoomRuler({
        innerContainerDom,
        componentName
      });
      break;
  }
};

/** 根据当前图片显示尺寸和物理尺寸获取比例尺高度和宽度 */
export const getBscanZoomRuler = ({
  innerContainerDom,
  aspectRatioFactor
}: {
  innerContainerDom: HTMLElement;
  aspectRatioFactor: number;
}) => {
  // 取图片的真实尺寸
  const imageWidth =
    parseFloat(innerContainerDom.style.width) / aspectRatioFactor;
  const imageHeight = parseFloat(innerContainerDom.style.height);
  // 取图片展示的页面尺寸
  const rect = innerContainerDom.getBoundingClientRect();
  const { width: imageClientWidth, height: imageClientHeight } = rect;
  if (!imageClientWidth) return { width: 0, height: 0, value: 0 };
  const { value, width } = getBscanZoomRulerValue(
    imageClientWidth / imageWidth
  ); // 比例值、宽度
  // 根据比例值计算高度
  const height = (imageClientHeight / imageHeight) * value;
  return { width, height, value };
};

export const getBscanZoomRulerValue = (ruler: number) => {
  let value = -1;
  const rulerMaxWidth = 20;
  let scale = 50;
  while (value != scale) {
    if (ruler * scale <= rulerMaxWidth) {
      if (ruler * scale < rulerMaxWidth / 2) {
        scale = scale * 2;
      } else {
        value = scale;
      }
    } else {
      scale = Math.floor(scale / 2);
      if (scale == 0) {
        value = 0;
      }
    }
  }
  return { value, width: ruler * scale };
};
