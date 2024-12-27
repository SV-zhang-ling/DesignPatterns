/* eslint-disable */
// @ts-nocheck
import * as d3 from "d3";
import { AxisDirectionEnum } from "@/enums";
import { AS_SURFACE_LIST } from "../constant";
import { fetchAnteriorSurface } from "@/api/layer";
import { SurfaceMatParamsType, SurfaceMatResType } from "./segmentation";

interface SurfaceParams {
  svgDom: SVGElement;
  surfPointArr: Any;
  width: number;
  cols: number;
  spacingZ_um?: number;
  ceilingShift?: number;
  floorShift?: number;
}

export const freeMemeory = () => {
  [...AS_SURFACE_LIST].forEach((item: { surfType: string }) => {
    const mat = window[item.surfType];
    if (mat && !mat.isDeleted()) {
      mat.delete();
    }
    window[item.surfType] = null;
  });
};

export const fetchSurface = async ({
  captureKey,
  surf,
  surfType,
  col,
  row
}: SurfaceMatParamsType): Promise<SurfaceMatResType> => {
  const buffer = (await fetchAnteriorSurface({
    captureKey,
    surf,
    isDewarp: 1 // 前节surface请示增加参数
  })) as SharedArrayBuffer;
  const data = new Float32Array(buffer);
  const segmentation = cv.matFromArray(col, row, cv.CV_32F, data);
  return { surfType, data: segmentation };
};

export const getAsSegmentPointsByIndex = (
  index: number,
  segmentation: Mat,
  direction?: AxisDirectionEnum
): Point[] => {
  if (!segmentation) return;
  const rowData = segmentation.row(index);
  const pointSegArr = [];
  let pts = [];
  rowData.data32F.forEach((cur: number, idx: number) => {
    if (cur === -1 && pts.length) {
      pointSegArr.push(pts);
      pts = [];
    }
    cur !== -1 &&
      pts.push({
        x:
          direction === AxisDirectionEnum.FAST
            ? rowData.data32F.length - 1 - idx
            : idx,
        y: cur
      });
  });
  rowData.delete();
  !pointSegArr.length && pointSegArr.push(pts);
  return pointSegArr;
};

const pathClassName = "segmentation-path";
export const drawSurface = ({
  svgDom,
  surfPointArr,
  width,
  cols,
  spacingZ_um,
  ceilingShift,
  floorShift
}: SurfaceParams) => {
  const svg = d3.select(svgDom);
  svg.selectAll(`.${pathClassName}`).remove();
  surfPointArr.forEach((surfPoints, idx) => {
    pureDrawFn({
      svg,
      pointSegs: surfPoints,
      width,
      cols,
      spacingZ_um,
      surfaceDirection: idx === 0 ? "ceil" : "floor",
      ceilingShift,
      floorShift
    });
  });
};

// draw surface
export const pureDrawFn = ({
  svg,
  pointSegs,
  width,
  cols,
  spacingZ_um,
  surfaceDirection,
  ceilingShift,
  floorShift
}): void => {
  // 创建曲线函数
  const curve = d3
    .line()
    .x(d => (d.x * width) / cols)
    .y(d => {
      if (ceilingShift === undefined || floorShift === undefined) {
        // for AS B-scan
        return d.y * spacingZ_um;
      }

      return surfaceDirection === "ceil"
        ? d.y * spacingZ_um + ceilingShift
        : d.y * spacingZ_um + floorShift;
    })
    .curve(d3.curveBasis);
  // 创建路径元素并应用曲线函数
  const ele = document.querySelector(".layer-on-bscan-item") as HTMLElement;
  const hideLayerOnBscan = ele && [...ele.classList].includes("rectangle");
  const lineGrp = svg
    .append("g")
    .attr("class", pathClassName)
    .attr("style", `display: ${hideLayerOnBscan ? "none" : "block"}`);

  pointSegs?.length &&
    pointSegs.forEach((points: Point[]) => {
      lineGrp
        .append("path")
        .attr("class", "surface-line")
        .attr("d", curve(points))
        .attr("stroke", "#00FFFF")
        .attr("stroke-width", 15)
        .attr("fill", "none");
    });
};
