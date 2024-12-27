/* eslint-disable */
// @ts-nocheck
import * as d3 from "d3";

import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import {
  POSTERIOR_SURFACE_LIST,
  PosteriorSurfaceEnum,
  AS_LINE_SURFACE_LIST
} from "@/utils/constant";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import {
  surfaceMat,
  fetchAllSurface,
  drawAllSlowPosteriorSurface,
  defaultStrikeColor,
  selectedStrikeColor,
  referenceStrikeColor,
  matchSurface,
  DrawerType
} from "./manualLayer";
import { fetchAnteriorSurfaceMask } from "@/api/layer";
import { asFastPureDrawFn } from "./asManualSurface";

export type D3Svg = d3.Selection<SVGElement, unknown, null, undefined>;
let svg: D3Svg;
let isAnterior: boolean;

export const segClassName = key => {
  return `segmentation-${key}`;
};

// 创建曲线函数;
export const getCurveFunc = () => {
  if (!svg) return;
  const svgDom: SVGElement | null = svg.node();
  const width = Number(svgDom.getAttribute("width"));
  const height = Number(svgDom.getAttribute("height"));

  return d3
    .line()
    .x(d => d.x * width)
    .y(d => d.y * height)
    .curve(d3.curveBasis);
};

const getRealPosteriorSurfaces = () => {
  const clonedSurfaceList = [...POSTERIOR_SURFACE_LIST];
  const rpemSurfIndex = clonedSurfaceList.findIndex(
    ({ value }) => value === PosteriorSurfaceEnum.RPEBM
  );
  if (rpemSurfIndex !== -1) {
    clonedSurfaceList.splice(rpemSurfIndex, 1);
  }
  return clonedSurfaceList;
};
export const filteredSurfaceList = getRealPosteriorSurfaces();

export const getSurfaceList = isAS => {
  if (isAS !== undefined) {
    isAnterior = isAS;
  }
  return isAnterior ? AS_LINE_SURFACE_LIST : filteredSurfaceList;
};

export const getCommonSettings = () => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const { editSurface, refSurface } = useEditLayersStoreHook();
  const { captureKey, dim_slow, dim_fast, dim_axial, y, x, spacingX_um } =
    analysisCommonStore;
  return {
    captureKey,
    dim_slow,
    dim_fast,
    dim_axial,
    y,
    x,
    spacingX_um,
    editSurface,
    refSurface
  };
};
const getSegmentPointsByIndex = (
  index: number,
  segmentation: Mat,
  cols: number,
  rows: number
): Point[] => {
  if (!segmentation) return [];
  const rowData = segmentation.row(index);
  const points = rowData.data32F.reduce(
    (acc: Point[], cur: number, index: number) => {
      return [
        ...acc,
        {
          x: index / rows,
          y: rowData.data32F[rowData.data32F.length - 1 - index] / cols
        }
      ];
    },
    []
  );
  rowData.delete();
  return points;
};
export interface DrawerParamsType {
  svg?: D3Svg;
  points: Point[];
  selectedKey: string;
}

export const pureDrawFn = ({ points, selectedKey }: DrawerParamsType): void => {
  if (!svg) return;
  const svgDom: SVGElement | null = svg.node();
  if (!svgDom || points?.length === 0) return;
  const className = segClassName(selectedKey);
  const strikeColor = defaultStrikeColor;
  svg.selectAll(`.${className}`).remove();

  // 创建曲线函数;
  const curve = getCurveFunc();
  svg
    .append("path")
    .attr("class", className)
    .attr("d", curve(points))
    .attr("stroke", strikeColor)
    .attr("stroke-width", 10)
    .attr("fill", "none");
};

export const drawFastSegmentation = ({ index, selectedKey }: DrawerType) => {
  // 如果高亮的分层是rpem层，则选用BM层的mat数据
  const matchedKey = matchSurface(selectedKey);
  const segmentations = surfaceMat[matchedKey];
  if (!segmentations || !segmentations.length) return;

  const { dim_slow: rows, dim_axial: cols } = getCommonSettings();
  const [slowSeg, fastSeg] = segmentations;
  const segmentation = fastSeg;

  const points = getSegmentPointsByIndex(index, segmentation, cols, rows);
  if (!isAnterior) {
    pureDrawFn({
      points,
      selectedKey
    });
    return;
  }
  mask.as &&
    asFastPureDrawFn({
      svg,
      points,
      maskSeg: mask.as.dim_fast[index],
      selectedKey
    });
};
export const showFastEditLine = () => {
  if (!svg) return;
  const { editSurface, refSurface, showEditLine } = useEditLayersStoreHook();
  svg
    .selectAll(`.${segClassName(refSurface)}`)
    .style("display", showEditLine ? "block" : "none");

  if (!isAnterior && editSurface === PosteriorSurfaceEnum.RPEBM) {
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.RPE)}`)
      .style("display", showEditLine ? "block" : "none");
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.BM)}`)
      .style("display", showEditLine ? "block" : "none");
  } else {
    svg
      .selectAll(`.${segClassName(editSurface)}`)
      .style("display", showEditLine ? "block" : "none");
  }
};
export const setFastShowLines = () => {
  if (!svg) return;

  const { showAllLines } = useEditLayersStoreHook();
  const surfaceList = getSurfaceList();
  surfaceList.forEach(({ value }) => {
    svg
      .selectAll(`.${segClassName(value)}`)
      .style("display", showAllLines ? "block" : "none");
  });
  showFastEditLine();
};

export const setFastRefHighlight = () => {
  if (!svg) return;
  setFastShowLines();
  const { editSurface, refSurface } = useEditLayersStoreHook();
  svg.selectAll("path").attr("stroke", defaultStrikeColor);
  svg
    .selectAll(`.${segClassName(refSurface)}`)
    .attr("stroke", referenceStrikeColor)
    .raise();

  if (!isAnterior && editSurface === PosteriorSurfaceEnum.RPEBM) {
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.RPE)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.BM)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
  } else {
    svg
      .selectAll(`.${segClassName(editSurface)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
  }
};

export const drawAllFastPosteriorSurface = async () => {
  if (!svg) return;
  const paths = svg.selectAll("path");
  paths.remove();
  const editLayersStore = useEditLayersStoreHook();
  const { x, editSurface, refSurface } = editLayersStore;

  const surfaceList = getSurfaceList();
  surfaceList.forEach(({ value }) => {
    drawFastSegmentation({
      selectedKey: value,
      index: x
    });
  });
  svg
    .selectAll(`.${segClassName(refSurface)}`)
    .attr("stroke", referenceStrikeColor)
    .raise();

  if (!isAnterior && editSurface === PosteriorSurfaceEnum.RPEBM) {
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.RPE)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.BM)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
  } else {
    svg
      .selectAll(`.${segClassName(editSurface)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
  }
  // setFastShowLines();
  // showFastEditLine();
};

export let mask = { as: null };

/**
 * 初始化分割功能
 *
 * @param svgDom SVG DOM 元素
 * @returns 无返回值
 */
export const initSegmentation = async (svgDom: SVGElement, isAS?: boolean) => {
  isAnterior = isAS;
  svg = d3.select<SVGElement, unknown>(svgDom);
  const editLayersStore = useEditLayersStoreHook();
  // fast bscan 挂载后
  // 1.请求所有分层数据
  if (isAS) {
    editLayersStore.maskLoading = true;
    const { captureKey } = getCommonSettings();
    const res = await fetchAnteriorSurfaceMask({ captureKey });
    mask.as = res.data;
    editLayersStore.maskLoading = false;
  }
  await fetchAllSurface();
  editLayersStore.setDialogLoading(false);
  // 2.绘制所有fast分层数据
  drawAllFastPosteriorSurface();
  // 绘制所有slow分层数据
  drawAllSlowPosteriorSurface();
};
