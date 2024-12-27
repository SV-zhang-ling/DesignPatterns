/* eslint-disable */
// @ts-nocheck
import * as d3 from "d3";
import { AS_LINE_SURFACE_LIST } from "@/utils/constant";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import {
  defaultStrikeColor,
  selectedStrikeColor,
  getCurveFunc as getSlowCurveFunc,
  drawX,
  drawY,
  drawSlowSegmentation,
  getRealX
} from "./manualLayer";
import {
  DrawerParamsType,
  getCurveFunc as getFastCurveFunc,
  segClassName,
  getCommonSettings
} from "./drawAllFastSeg";
import { AxisDirectionEnum } from "@/enums";

export const asSurfaceList = AS_LINE_SURFACE_LIST;

export interface ASDrawerParamsType extends DrawerParamsType {
  maskSeg?: [];
  cols?: number;
  rows?: number;
}

export const getPoints = (points, start, end) => {
  if (start >= end || !points) return [];

  const resPoints = [];
  let i = start;
  while (i < end) {
    resPoints.push(points[i]);
    i++;
  }
  return resPoints;
};

// 绘制分层线
const drawPath = (svg, className, points, strikeColor, strokeWidth, curve) => {
  const editLayersStore = useEditLayersStoreHook();
  svg
    .append("path")
    .attr("class", className)
    .attr("d", curve(points))
    .attr("stroke", strikeColor)
    .attr("stroke-width", strokeWidth)
    .attr("fill", "none")
    .attr(
      "style",
      `display: ${editLayersStore.showEditLine ? "block" : "none"}`
    );
};

const MIN_EQUAL_VAL = 0.002;
const DIS = 2;
const BORDER_LINE_CLASS = "border-line";
// 绘制边界线
const drawBorderLine = (
  svg,
  x1,
  y1,
  x2,
  y2,
  points,
  preIdx,
  nxtIdx,
  segArea,
  cols,
  rows,
  selectedKey,
  segIdx,
  isFirstBorderStartWidthBscanLeftBorder = false,
  isLastBorderEndWidthBscanRightBorder = false
) => {
  svg
    .append("line")
    .attr("class", BORDER_LINE_CLASS)
    .attr("x1", x1) // 起点 x 坐标
    .attr("y1", y1) // 起点 y 坐标
    .attr("x2", x2) // 终点 x 坐标
    .attr("y2", y2) // 终点 y 坐标
    .attr("stroke", "#0f0")
    .attr("stroke-dasharray", "100, 100")
    .attr("stroke-width", 15);

  svg
    .append("line")
    .attr("class", BORDER_LINE_CLASS)
    .attr("x1", x1) // 起点 x 坐标
    .attr("y1", y1) // 起点 y 坐标
    .attr("x2", x2) // 终点 x 坐标
    .attr("y2", y2) // 终点 y 坐标
    .attr("stroke", "transparent")
    .attr("stroke-width", 100)
    .attr("fill", "none")
    .attr("cursor", "col-resize")
    .call(
      d3.drag<SVGCircleElement, unknown>().on("drag", event => {
        const realX = getRealX(event.x);
        const curIdx = points.findIndex(
          p => Math.abs(p.x - realX) <= MIN_EQUAL_VAL
        );
        // 确保是在指定区域内移动边界线
        const leftBorderIdx =
          preIdx === 0 && isFirstBorderStartWidthBscanLeftBorder
            ? preIdx
            : preIdx + DIS;
        // 处理Bscan最右边的边界线，可拖到边
        const rightBorderIdx =
          nxtIdx === points.length - 1 && isLastBorderEndWidthBscanRightBorder
            ? points.length - 1
            : nxtIdx - DIS;
        if (curIdx < 0 || curIdx < leftBorderIdx || curIdx > rightBorderIdx)
          return;

        segArea[segIdx] = curIdx;

        const editLayersStore = useEditLayersStoreHook();
        const { y: index } = editLayersStore;
        editLayersStore.isAsBorderEdit = true;
        clearBorderLine(svg);
        drawSlowSegmentation({
          index,
          selectedKey,
          cols,
          rows,
          direction: AxisDirectionEnum.SLOW,
          strikeColor: selectedStrikeColor
        });
      })
    );
};

export const clearBorderLine = svg =>
  svg.selectAll(`.${BORDER_LINE_CLASS}`).remove();

// 前节Fast Bscan分层线绘制
export const asFastPureDrawFn = ({
  svg,
  points,
  maskSeg,
  selectedKey
}: ASDrawerParamsType) => {
  if (!svg) return;
  const svgDom: SVGElement | null = svg.node();
  if (!svgDom || points?.length === 0) return;
  const className = segClassName(selectedKey);
  const strikeColor = defaultStrikeColor;
  svg.selectAll(`.${className}`).remove();

  const curve = getFastCurveFunc();
  const pathMaskSeg = maskSeg[selectedKey];
  // console.log("maskArea::selectedKey::", pathMaskSeg);
  let preSegEnd = 0;
  pathMaskSeg &&
    pathMaskSeg.forEach(([start, end]) => {
      let inactivePoints = getPoints(points, preSegEnd, start);
      drawPath(svg, className, inactivePoints, "transparent", 0, curve);

      let activePoints = getPoints(points, start, end);
      drawPath(svg, className, activePoints, strikeColor, 10, curve);

      preSegEnd = end;
    });
};

// Slow Bscan分层线绘制
export const asSlowPureDrawFn = ({
  svg,
  cols,
  rows,
  points,
  maskSeg,
  selectedKey,
  strikeColor = defaultStrikeColor
}: ASDrawerParamsType) => {
  if (!svg) return;
  const svgDom: SVGElement | null = svg.node();
  if (!svgDom || points?.length === 0) return;
  const className = segClassName(selectedKey);
  svg.selectAll(`.${className}`).remove();

  const { editSurface } = getCommonSettings();
  const curve = getSlowCurveFunc();
  const pathMaskSeg = maskSeg[selectedKey];
  if (!pathMaskSeg || !pathMaskSeg.length) return;

  const TOTAL_SEG_NUM = pathMaskSeg.length;
  let preSegEnd = 0;
  let nextSegStart = 0;
  pathMaskSeg.forEach((segArea, idx) => {
    const [start, end] = segArea;

    let inactivePoints = getPoints(points, preSegEnd, start);
    drawPath(svg, className, inactivePoints, "transparent", 0, curve);

    let activePoints = getPoints(points, start, end);
    drawPath(svg, className, activePoints, strikeColor, 10, curve);

    if (selectedKey === editSurface) {
      // 获取下一个区域的起始位置
      if (idx + 1 < TOTAL_SEG_NUM) {
        const nextSeg = pathMaskSeg[idx + 1];
        nextSeg && nextSeg.length && (nextSegStart = nextSeg[0]);
      } else {
        nextSegStart = points.length - 1;
      }

      // debugger;
      const x1 = drawX(points[start].x),
        x2 = drawX(points[end].x),
        y1 = drawY(0),
        y2 = drawY(1);
      drawBorderLine(
        svg,
        x1,
        y1,
        x1,
        y2,
        points,
        preSegEnd,
        end,
        segArea,
        cols,
        rows,
        selectedKey,
        0,
        start === preSegEnd
      );
      drawBorderLine(
        svg,
        x2,
        y1,
        x2,
        y2,
        points,
        start,
        nextSegStart,
        segArea,
        cols,
        rows,
        selectedKey,
        1,
        false,
        end === nextSegStart
      );
    }

    preSegEnd = end;
  });
};
