import { useEventListener } from "@vueuse/core";
import router from "@/router";
import { PageRoute } from "@/utils/route";
import {
  ContainerNameEnum,
  MeasureViewTypeEnum,
  MeasureTypeEnum,
  AnalysisModeEnum
} from "@/enums";
import { COMPONENTNAME_VIEWERTYPE } from "@/utils/constant";
import * as d3 from "d3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import { config } from "../config.yml";
import { MeasureResult, PointType } from "@/views/analysis/store/measureCommon";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { clearMeasureGlobalData } from "./clearAll";
import {
  drawGlobalRulers,
  enterDrawRulerLine,
  selectDrawRulerLine,
  getViewportRulers
} from "./ruler";
import {
  drawGlobalArrows,
  enterDrawArrowLine,
  selectDrawArrowLine,
  getViewportArrows
} from "./arrow";
import { drawGlobalTexts, enterDrawTextArea, getViewportTexts } from "./text";
import { useAngioLayerStoreHook } from "@/views/analysis/posterior/angio/components/store/angioLayer";
import { useMultipleAngioStoreHook } from "@/views/analysis/posterior/angio/multiple/store";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { useAdvancedSegStoreHook } from "@/views/analysis/posterior/advancedSeg/store/advancedSeg";
import { useOCTLayerStoreHook } from "@/views/analysis/structuralProj/components/store/octLayer";
import { useCubeStoreHook } from "@/views/analysis/cube/store";
import { useMosaicStoreHook } from "@/views/analysis/mosaic/store/mosaic";
import { isAnteriorScan } from "@/utils/protocol";
import { handleDownloadBscanImages } from "@/utils/image";

const ANGIO = "Angio";
const ANGIO_RETINA_ENHANCED = "EnhanceAngio";
const STRU_PROJ = "StruProj";
const CUBE = "Cube";
const QUANTIZE = "Quantize";
const MOSAIC = "Mosaic";

const MEASURE_CLASS_NAMES = ["ruler-path", "arrow-path", "text-path"];
/** 根据已存储的测量工具绘制 */
export function drawMeasureData({
  viewportDom,
  viewerType,
  componentName,
  sliceIndex
}: {
  viewportDom: HTMLElement;
  viewerType: MeasureViewTypeEnum;
  componentName: ContainerNameEnum;
  sliceIndex?: number;
}) {
  // 解决组件尚未挂载的情况
  const innerContainer = d3.select(viewportDom).select(".inner-container");
  if (innerContainer.empty()) return;
  if (!innerContainer.attr("data-custom-name")) return;

  // 避免重复绘制
  clearMeasureGlobalData({ viewportDom, isStay: true });

  let captureKey = router.currentRoute.value.query.captureKey as string;
  if (
    [PageRoute.MultipleAngio, PageRoute.MultipleLineScan].includes(
      router.currentRoute.value.path
    )
  ) {
    if (
      [
        ContainerNameEnum.SaveAngioProj,
        ContainerNameEnum.SaveSlowBScanMain,
        ContainerNameEnum.SaveLineScanSLO,
        ContainerNameEnum.SaveLineScanBscan
      ].includes(componentName)
    ) {
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      captureKey = analysisMultipleCommonStore.activeCaptureCard!.captureKey;
    } else {
      captureKey = viewportDom.dataset.captureKey || "";
    }
  }

  const measureCommonStore = useMeasureCommonStore();
  const { measureGlobalData } = measureCommonStore;
  if (!measureGlobalData[captureKey]) return;
  const measureData: MeasureResult[] =
    measureGlobalData[captureKey][viewerType];
  if (!measureData || !measureData.length) {
    window.isSaveImages && handleDownloadBscanImages(componentName);
    return;
  }

  measureData.forEach(async (measure: MeasureResult) => {
    switch (viewerType) {
      case MeasureViewTypeEnum.FastBScan:
      case MeasureViewTypeEnum.SlowBScan:
        Number(measure.index) === sliceIndex &&
          (await drawEveryTypeMeasure({
            viewportDom,
            viewerType,
            componentName,
            measure
          }));
        break;
      case MeasureViewTypeEnum.Enface:
        measure.index === getEnfaceIndexName() &&
          (await drawEveryTypeMeasure({
            viewportDom,
            viewerType,
            componentName,
            measure
          }));
        break;
      case MeasureViewTypeEnum.Quantize:
      case MeasureViewTypeEnum.Oct:
      case MeasureViewTypeEnum.CubeCscan:
      case MeasureViewTypeEnum.Mosaic:
        measure.index === getLayerIndexName(viewerType) &&
          (await drawEveryTypeMeasure({
            viewportDom,
            viewerType,
            componentName,
            measure
          }));
        break;
      default:
        await drawEveryTypeMeasure({
          viewportDom,
          viewerType,
          componentName,
          measure
        });
        break;
    }
  });
  window.isSaveImages && handleDownloadBscanImages(componentName);
}
function drawEveryTypeMeasure({
  viewportDom,
  viewerType,
  componentName,
  measure
}: {
  viewportDom: HTMLElement;
  viewerType: MeasureViewTypeEnum;
  componentName: ContainerNameEnum;
  measure: MeasureResult;
}) {
  for (const key in measure) {
    const data: any = measure[key] || [];
    if (
      data &&
      data.length &&
      componentName !== ContainerNameEnum.SaveSlowBScanAttach
    ) {
      switch (key) {
        case MeasureTypeEnum.Ruler:
          drawGlobalRulers({
            viewportDom,
            viewerType,
            componentName,
            rulers: data
          });
          break;
        case MeasureTypeEnum.Arrow:
          drawGlobalArrows({
            viewportDom,
            viewerType,
            componentName,
            arrows: data
          });
          break;
        case MeasureTypeEnum.Text:
          drawGlobalTexts({
            viewportDom,
            viewerType,
            componentName,
            texts: data
          });
          break;
        default:
          break;
      }
    }
  }
}

/** 计算各图测量工具显示宽度 */
export function getStrokeWidth(viewportDom: HTMLElement) {
  const innerContainerDom = d3
    .select(viewportDom)
    .select(".inner-container")
    .node() as HTMLElement;
  const transform = window
    .getComputedStyle(innerContainerDom)
    .getPropertyValue("transform");
  const viewportScale = window
    .getComputedStyle(innerContainerDom)
    .getPropertyValue("scale");
  const componentName = d3
    .select(viewportDom)
    .select(".inner-container")
    .attr("data-custom-name") as ContainerNameEnum;
  const matches = transform.match(/[-+]?[0-9]*\.?[0-9]+/g);
  let scale = matches && matches[0] ? Number(matches[0]) : 0;
  if (
    [MeasureViewTypeEnum.SlowBScan, MeasureViewTypeEnum.FastBScan].includes(
      COMPONENTNAME_VIEWERTYPE[componentName]
    )
  )
    scale = [PageRoute.LineScan, PageRoute.MultipleLineScan].includes(
      router.currentRoute.value.path
    )
      ? scale / 1
      : router.currentRoute.value.path === PageRoute.MultipleAngio
      ? scale / 0.4
      : Number(viewportScale) < 10
      ? ((scale / 0.4) * Number(viewportScale)) / 2
      : scale / 0.4;
  const strokeWidth = scale ? 2 / scale : 40;
  const fontSize = scale ? 24 / scale : 360;
  const dashVal = scale ? 5 / scale : 80;
  const arrowStrokeWidth = scale ? 6 / scale : 120;
  return {
    strokeWidth,
    fontSize,
    dashArray: `${dashVal},${dashVal}`,
    arrowStrokeWidth
  };
}

/** 计算ruler长度 */
export function calcRulerLength({
  x1,
  y1,
  x2,
  y2,
  componentName
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  componentName: ContainerNameEnum;
}) {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const length =
    [MeasureViewTypeEnum.SlowBScan, MeasureViewTypeEnum.FastBScan].includes(
      COMPONENTNAME_VIEWERTYPE[componentName]
    ) && !isAnteriorScan(analysisCommonStore.protocolName)
      ? Math.sqrt(((x2 - x1) * (x2 - x1)) / 0.16 + (y2 - y1) * (y2 - y1))
      : Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  return length;
}

/** 计算各图偏移量 */
export function getOffset(viewportDom: HTMLElement, componentName: string) {
  const canvasContainer = viewportDom.querySelectorAll(
    "canvas"
  )[0] as HTMLElement;
  const svgContainer = [
    ContainerNameEnum.LineScanSLO,
    ContainerNameEnum.SaveLineScanSLO
  ].includes(componentName as ContainerNameEnum)
    ? viewportDom.querySelectorAll("svg")[1]
    : null;
  const leftOffset = svgContainer
    ? parseFloat(canvasContainer.style.left) -
      parseFloat(svgContainer.style.left)
    : parseFloat(canvasContainer.style.left);
  const topOffset = svgContainer
    ? parseFloat(canvasContainer.style.top) - parseFloat(svgContainer.style.top)
    : parseFloat(canvasContainer.style.top);
  return {
    leftOffset,
    topOffset
  };
}

/** 双击测量工具进入编辑状态 */
export function dblEnterMeasureDraw({
  viewportDom,
  target,
  x,
  y
}: {
  viewportDom: HTMLElement;
  target: HTMLElement;
  x: number;
  y: number;
}) {
  const className = target?.getAttribute("class");
  switch (className) {
    case MeasureTypeEnum.Ruler:
      enterDrawRulerLine({
        viewportDom,
        target
      });
      break;
    case MeasureTypeEnum.Arrow:
      enterDrawArrowLine({
        viewportDom,
        target
      });
      break;
    case MeasureTypeEnum.Text:
      enterDrawTextArea({
        viewportDom,
        target,
        x,
        y
      });
      break;
    default:
      break;
  }
}

/** 双击选择测量工具 */
export function dblSelectMeasureDraw({
  viewportDom,
  target,
  x,
  y
}: {
  viewportDom: HTMLElement;
  target: HTMLElement;
  x: number;
  y: number;
}) {
  const className = target?.getAttribute("class");
  // 控制当前仅有一个正在编辑状态的测量工具
  selectDrawRulerLine({
    viewportDom,
    target
  });
  selectDrawArrowLine({
    viewportDom,
    target
  });
  className === MeasureTypeEnum.Text &&
    enterDrawTextArea({
      viewportDom,
      target,
      x,
      y
    });
}

/** 双击保存测量工具 */
export function dblSaveMeasureDraw(viewportDom: HTMLElement) {
  const measureCommonStore = useMeasureCommonStore();
  const { clickCount, operViewportDom } = measureCommonStore;
  const domItem =
    viewportDom === operViewportDom ? viewportDom : operViewportDom;
  domItem && clickCount === 2 && saveViewportMeasures({ viewportDom: domItem });
}

/** 右击保存测量工具 */
export function rightClickSaveMeasureDraw(viewportDom: HTMLElement) {
  const measureCommonStore = useMeasureCommonStore();
  const { clickCount, operViewportDom } = measureCommonStore;
  const domItem =
    viewportDom === operViewportDom ? viewportDom : operViewportDom;
  domItem && [0, 1].includes(clickCount) && removeMeasureSingleDraw(domItem);
  domItem && clickCount === 2 && saveViewportMeasures({ viewportDom: domItem });
}

/** BScan更改slice触发 */
export async function changeBscanMeasureDraw({
  viewportDom,
  viewerType,
  newIndex,
  oldIndex
}: {
  viewportDom: HTMLElement;
  viewerType: MeasureViewTypeEnum;
  newIndex: number;
  oldIndex: number;
}) {
  const measureCommonStore = useMeasureCommonStore();
  const { clickCount } = measureCommonStore;
  const componentName = d3
    .select(viewportDom)
    .select(".inner-container")
    .attr("data-custom-name") as ContainerNameEnum;
  [0, 1].includes(clickCount) && (await removeMeasureSingleDraw(viewportDom));
  clickCount === 2 &&
    (await saveViewportMeasures({ viewportDom, sliceIndex: oldIndex }));
  clearMeasureGlobalData({ viewportDom, isStay: true });
  drawMeasureData({
    viewportDom,
    viewerType,
    componentName,
    sliceIndex: newIndex
  });
}

/** slo、oct切换 */
export function changeOctMeasureDraw(viewportDom?: HTMLElement) {
  if (viewportDom) {
    const svg = d3.select(viewportDom).select(".coordinates");
    svg.on("click", null).classed("measure-cursor", false);
    svg.on("mouseover", null);
    resetMeasureParamsVal(viewportDom);
    return;
  } else {
    const measureCommonStore = useMeasureCommonStore();
    const { operMeasureId, operViewportDom } = measureCommonStore;
    operMeasureId &&
      operViewportDom &&
      saveViewportMeasures({ viewportDom: operViewportDom });
  }
}

/** 血流图layer切换 */
export async function changeLayerMeasureDraw({
  viewportDom,
  viewerType,
  componentName,
  index
}: {
  viewportDom: HTMLElement;
  viewerType: MeasureViewTypeEnum;
  componentName: ContainerNameEnum;
  index: string;
}) {
  const measureCommonStore = useMeasureCommonStore();
  const { clickCount } = measureCommonStore;
  [0, 1].includes(clickCount) && (await removeMeasureSingleDraw(viewportDom));
  clickCount === 2 &&
    (await saveViewportMeasures({
      viewportDom,
      enfaceIndex:
        viewerType === MeasureViewTypeEnum.Enface
          ? getEnfaceIndexName(index)
          : getLayerIndexName(viewerType, index)
    }));
  clearMeasureGlobalData({ viewportDom, isStay: true });
  drawMeasureData({
    viewportDom,
    viewerType,
    componentName
  });
}

/** ou、changeq切换 */
export function changeOuChangeMeasureDraw() {
  const measureCommonStore = useMeasureCommonStore();
  const { operViewportDom } = measureCommonStore;
  operViewportDom && resetMeasureParamsVal(operViewportDom);
}

/** 切换路由前先保存 */
export async function rouerLeaveSaveMeasureDraw() {
  const measureCommonStore = useMeasureCommonStore();
  const { operViewportDom } = measureCommonStore;
  await measureCommonStore.saveMeasureData();
  operViewportDom && resetMeasureParamsVal(operViewportDom);
}

/** 监听Backspace或者Delete删除单条测量工具 */
useEventListener("keydown", async event => {
  const measureCommonStore = useMeasureCommonStore();
  const { showTextEditDialog, operMeasureId, operViewportDom } =
    measureCommonStore;
  const svg = d3
    .select(operViewportDom)
    .select(".coordinates")
    .classed("measure-cursor", false);
  if (
    (event.key === "Delete" || event.key === "Backspace") &&
    operMeasureId &&
    operViewportDom &&
    !showTextEditDialog
  ) {
    MEASURE_CLASS_NAMES.forEach(name => {
      const measures = svg.selectAll(`.${name}`);
      [...measures].forEach((item: any) => {
        if (d3.select(item).attr("id") === operMeasureId) {
          d3.select(item).remove();
        }
      });
    });
    saveViewportMeasures({
      viewportDom: operViewportDom
    });
  }
});

/** 退出编辑状态，更新measureGlobalData */
export async function saveViewportMeasures({
  viewportDom,
  sliceIndex,
  enfaceIndex,
  isStay
}: {
  viewportDom: HTMLElement;
  sliceIndex?: number;
  enfaceIndex?: string;
  isStay?: boolean;
}) {
  const measureCommonStore = useMeasureCommonStore();
  const { measureGlobalData } = measureCommonStore;
  let captureKey = router.currentRoute.value.query.captureKey as string;
  if (
    [PageRoute.MultipleAngio, PageRoute.MultipleLineScan].includes(
      router.currentRoute.value.path
    )
  ) {
    captureKey = viewportDom.dataset.captureKey || "";
  }
  const componentName = d3
    .select(viewportDom)
    .select(".inner-container")
    .attr("data-custom-name") as ContainerNameEnum;
  const Rulers = await getViewportRulers({
    viewportDom,
    componentName,
    viewerType: COMPONENTNAME_VIEWERTYPE[componentName],
    sliceIndex,
    isStay
  });
  const Arrows = await getViewportArrows({
    viewportDom,
    componentName,
    viewerType: COMPONENTNAME_VIEWERTYPE[componentName],
    sliceIndex,
    isStay
  });
  const Texts = await getViewportTexts({
    viewportDom,
    componentName,
    viewerType: COMPONENTNAME_VIEWERTYPE[componentName],
    sliceIndex,
    isStay
  });

  const data: any = {
    Angles: [],
    Areas: [],
    Arrows: [...Arrows],
    Rulers: [...Rulers],
    Texts: [...Texts],
    index: getDataSliceIndexName({
      captureKey,
      componentName,
      sliceIndex,
      enfaceIndex
    })
  };
  const list =
    measureGlobalData[captureKey][COMPONENTNAME_VIEWERTYPE[componentName]] ||
    [];
  const item = list.find(x => x.index === data.index);
  if (item) {
    const idx = list.findIndex(x => x.index === data.index);
    list[idx] = data;
  } else {
    list.push(data);
  }
  measureCommonStore.setMeasureDataByViewerType(
    captureKey,
    COMPONENTNAME_VIEWERTYPE[componentName],
    list
  );
  !isStay && resetMeasureParamsVal(viewportDom);
}
function getDataSliceIndexName({
  captureKey,
  componentName,
  sliceIndex,
  enfaceIndex
}: {
  captureKey: string;
  componentName: ContainerNameEnum;
  sliceIndex?: number;
  enfaceIndex?: string;
}) {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
  const { x, y, lineActiveIndex } = analysisCommonStore;
  const { ouCaptureDetailMap, changeCaptureDetailMap } =
    analysisMultipleCommonStore;
  const captureMapList =
    router.currentRoute.value.query.m === AnalysisModeEnum.OU
      ? ouCaptureDetailMap
      : changeCaptureDetailMap;
  let indexName = "";
  const routerPath = router.currentRoute.value.path;
  switch (routerPath) {
    case PageRoute.MultipleLineScan:
      indexName =
        MeasureViewTypeEnum.SlowBScan ===
        COMPONENTNAME_VIEWERTYPE[componentName]
          ? sliceIndex || sliceIndex === 0
            ? sliceIndex + ""
            : captureMapList[captureKey].activeSlice + ""
          : "0";
      break;
    case PageRoute.MultipleAngio:
      indexName =
        MeasureViewTypeEnum.Enface === COMPONENTNAME_VIEWERTYPE[componentName]
          ? enfaceIndex
            ? enfaceIndex
            : getEnfaceIndexName()
          : sliceIndex || sliceIndex === 0
          ? sliceIndex + ""
          : captureMapList[captureKey].y + "";
      break;
    default:
      if (routerPath === PageRoute.LineScan) {
        indexName =
          MeasureViewTypeEnum.SlowBScan ===
          COMPONENTNAME_VIEWERTYPE[componentName]
            ? sliceIndex || sliceIndex === 0
              ? sliceIndex + ""
              : lineActiveIndex + ""
            : "0";
      } else {
        indexName =
          MeasureViewTypeEnum.FastBScan ===
          COMPONENTNAME_VIEWERTYPE[componentName]
            ? sliceIndex || sliceIndex === 0
              ? sliceIndex + ""
              : x + ""
            : MeasureViewTypeEnum.SlowBScan ===
              COMPONENTNAME_VIEWERTYPE[componentName]
            ? sliceIndex || sliceIndex === 0
              ? sliceIndex + ""
              : y + ""
            : enfaceIndex
            ? enfaceIndex
            : MeasureViewTypeEnum.Enface ===
              COMPONENTNAME_VIEWERTYPE[componentName]
            ? getEnfaceIndexName()
            : [
                MeasureViewTypeEnum.Quantize,
                MeasureViewTypeEnum.Oct,
                MeasureViewTypeEnum.CubeCscan,
                MeasureViewTypeEnum.Mosaic
              ].includes(COMPONENTNAME_VIEWERTYPE[componentName])
            ? getLayerIndexName(COMPONENTNAME_VIEWERTYPE[componentName])
            : "0";
      }
      break;
  }
  return indexName;
}
/** 退出编辑时删除孤点 */
export function removeMeasureSingleDraw(viewportDom: HTMLElement) {
  const svg = d3
    .select(viewportDom)
    .select(".coordinates")
    .classed("measure-cursor", false)
    .classed("measure-cursor-text", false);
  const firstCircle = svg.select(".firstCircle");
  const firstLine = svg.select(".firstLine");
  firstCircle && firstCircle.remove();
  firstLine && firstLine.remove();
  svg.on("click", null);
  resetMeasureParamsVal(viewportDom);
}
/** 重置测量工具编辑变量 */
export function resetMeasureParamsVal(viewportDom: HTMLElement) {
  const measureCommonStore = useMeasureCommonStore();
  window.isMeasureStatus = false;
  measureCommonStore.setParamsVal({
    count: 0,
    id: "",
    viewportDom
  });
}

/** 切换全屏/退出全屏时重新加载 */
export async function fullScreenChangeMeasures(
  viewportDom: HTMLElement,
  componentName: ContainerNameEnum
) {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const { x, y } = analysisCommonStore;
  drawMeasureData({
    viewportDom,
    viewerType: COMPONENTNAME_VIEWERTYPE[componentName] as MeasureViewTypeEnum,
    componentName,
    sliceIndex: ![
      MeasureViewTypeEnum.SlowBScan,
      MeasureViewTypeEnum.FastBScan
    ].includes(COMPONENTNAME_VIEWERTYPE[componentName])
      ? 0
      : MeasureViewTypeEnum.FastBScan ===
        COMPONENTNAME_VIEWERTYPE[componentName]
      ? x
      : y
  });
}

/** 获取当前页面Enface的index */
export function getEnfaceIndexName(name?: string) {
  const angioLayerStore = useAngioLayerStoreHook();
  const multipleAngioStore = useMultipleAngioStoreHook();
  const { activeAngioLayerName } = angioLayerStore;
  const { ouActiveLayerName, changeActiveLayerName } = multipleAngioStore;
  const enfaceIndexName = name
    ? name
    : router.currentRoute.value.path === PageRoute.MultipleAngio
    ? router.currentRoute.value.query.m === AnalysisModeEnum.OU
      ? ouActiveLayerName
      : changeActiveLayerName
    : activeAngioLayerName;

  if (
    [PageRoute.Angiography, PageRoute.MultipleAngio].includes(
      router.currentRoute.value.path
    )
  ) {
    return `${ANGIO}${enfaceIndexName}`;
  }

  if (router.currentRoute.value.path === PageRoute.AngioRetinaEnhanced) {
    return `${ANGIO}${enfaceIndexName}${ANGIO_RETINA_ENHANCED}`;
  }
  return "";
}
/** 非后端保存userinput区分层 */
export function getLayerIndexName(
  viewerType: MeasureViewTypeEnum,
  name?: string
) {
  const octLayerStore = useOCTLayerStoreHook();
  const cubeStore = useCubeStoreHook();
  const advancedSegStore = useAdvancedSegStoreHook();
  const mosaicStore = useMosaicStoreHook();
  let indexName = "";
  switch (viewerType) {
    case MeasureViewTypeEnum.Oct:
      name
        ? (indexName = STRU_PROJ + name)
        : (indexName = STRU_PROJ + octLayerStore.activeLayerName);
      break;
    case MeasureViewTypeEnum.CubeCscan:
      name
        ? (indexName = CUBE + name)
        : (indexName = CUBE + cubeStore.layerTypeName);
      break;
    case MeasureViewTypeEnum.Mosaic:
      name
        ? (indexName = MOSAIC + name)
        : (indexName = MOSAIC + mosaicStore.activeLayerTypeName);
      break;
    case MeasureViewTypeEnum.Quantize:
      name
        ? (indexName = QUANTIZE + name)
        : (indexName = QUANTIZE + advancedSegStore.quantizeIndexName);
      break;
  }
  return indexName;
}
