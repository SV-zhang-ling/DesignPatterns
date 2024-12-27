import * as d3 from "d3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import { config } from "../config.yml";
import { debounce } from "xe-utils";
import { v4 as uuidv4 } from "uuid";
import { PointType } from "@/views/analysis/store/measureCommon";
import { ContainerNameEnum, MeasureViewTypeEnum } from "@/enums";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import {
  getStrokeWidth,
  calcRulerLength,
  getOffset,
  saveViewportMeasures
} from "./index";
import { COMPONENTNAME_VIEWERTYPE } from "@/utils/constant";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { isAnteriorScan } from "@/utils/protocol";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";

const measureArrowClassName = "ruler-path";
const MIN_WIDTH = 10;
const MIN_WIDTH_X = 10.001;
const MAX_SIZE = 4.8;
const BSCAN_SCALE = 0.4;

// 右键选择测量尺触发
export const drawRulerLine = (
  viewportDom: HTMLElement,
  captureKey?: string
) => {
  const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
  if (
    captureKey &&
    captureKey !== analysisMultipleCommonStore.activeCaptureCard?.captureKey
  )
    return;
  const measureCommonStore = useMeasureCommonStore();
  const { clickCount } = measureCommonStore;
  let count = clickCount;
  measureCommonStore.setParamsVal({
    viewportDom
  });
  // 判断是否为长按
  let pressDuration: number;
  let pressStartTime: number;
  // 记录点击次数
  if (count === 0) {
    const svg = d3
      .select(viewportDom)
      .select(".coordinates")
      .classed("measure-cursor", true);
    let firstClickX: any, firstClickY: any, endClickX: any, endClickY: any;
    svg.on("mousedown", event => {
      pressStartTime = new Date().getTime();
    });
    svg.on("mouseup", event => {
      pressDuration = new Date().getTime() - pressStartTime;
    });
    svg.on(
      "click",
      debounce(event => {
        if (pressDuration < 300) {
          count++;
          measureCommonStore.setParamsVal({ count });
          const { offsetX, offsetY } = event;
          if (count === 1) {
            firstClickX = offsetX;
            firstClickY = offsetY;
            // 绘制端点及延伸指向线
            drawFirstCircleLine({
              viewportDom,
              x: firstClickX,
              y: firstClickY
            });
          }
          if (count === 2) {
            // 绘制完整线段，线+起始点
            svg.on("click", null).classed("measure-cursor", true);
            svg.on("mouseover", null);
            const firstCircle = svg.select(".firstCircle");
            const firstLine = svg.select(".firstLine");
            firstClickX = firstCircle.attr("cx");
            firstClickY = firstCircle.attr("cy");
            firstCircle.remove();
            firstLine.remove();
            endClickX = offsetX;
            endClickY = offsetY;
            drawLine({
              viewportDom,
              x1: firstClickX,
              y1: firstClickY,
              x2: endClickX,
              y2: endClickY,
              isNewRuler: true
            });
            saveViewportMeasures({ viewportDom, isStay: true });
          }
        }
      }, 300)
    );
  }
};

export const drawLine = ({
  viewportDom,
  x1,
  y1,
  x2,
  y2,
  isNewRuler,
  textX,
  textY,
  TextMoved
}: {
  viewportDom: HTMLElement;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isNewRuler: boolean;
  textX?: number;
  textY?: number;
  TextMoved?: boolean;
}) => {
  const measureCommonStore = useMeasureCommonStore();
  const id = uuidv4();
  isNewRuler
    ? measureCommonStore.setParamsVal({ id })
    : measureCommonStore.setParamsVal({ id: "" });
  const svg = d3.select(viewportDom).select(".coordinates");
  const rulerGrp = svg
    .append("g")
    .attr("class", measureArrowClassName)
    .attr("id", id);

  const cols = Number(svg.attr("width"));
  const rows = Number(svg.attr("height"));

  const componentName = d3
    .select(viewportDom)
    .select(".inner-container")
    .attr("data-custom-name") as ContainerNameEnum;
  const { strokeWidth, fontSize, dashArray } = getStrokeWidth(viewportDom);

  const line: any = rulerGrp
    .append("line")
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2)
    .attr("id", id)
    .attr("class", "Rulers");
  line
    .attr("stroke", config.measure.fill)
    .attr("stroke-width", strokeWidth)
    .attr("d", line)
    .attr("cursor", isNewRuler ? "move" : "pointer")
    .call(
      d3.drag().on("drag", event => {
        if (
          window.isMeasureStatus &&
          line.attr("id") === measureCommonStore.operMeasureId
        ) {
          line.attr("stroke", config.measure.activeFill);
          text.attr("fill", config.measure.fill);
          circleStart.attr("fill", config.measure.initFill);
          circleEnd.attr("fill", config.measure.initFill);
          // 计算鼠标的移动距离
          const { dx, dy } = event;
          // 计算初始的线段长度和角度,移动过程中长度、角度不改变
          const lineLength = Math.sqrt(
            (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
          );
          const angle = Math.atan2(y2 - y1, x2 - x1);
          // 更新线段的起点和终点坐标
          let newLineStartX = Number(line.attr("x1"));
          let newLineStartY = Number(line.attr("y1"));
          let newLineEndX = Number(line.attr("x2"));
          let newLineEndY = Number(line.attr("y2"));
          // 移动判断，触及边界无法移动
          if (
            !(
              Math.min(newLineStartX, newLineEndX) <= MIN_WIDTH ||
              Math.min(newLineStartY, newLineEndY) <= MIN_WIDTH ||
              Math.max(newLineStartX, newLineEndX) >= cols - MIN_WIDTH ||
              Math.max(newLineStartY, newLineEndY) >= rows - MIN_WIDTH
            )
          ) {
            newLineStartX += dx;
            newLineStartY += dy;
            newLineEndX += dx;
            newLineEndY += dy;
          }
          if (Math.min(newLineStartX, newLineEndX) <= MIN_WIDTH) {
            newLineStartY = Number(line.attr("y1"));
            newLineEndY = Number(line.attr("y2"));
            if (newLineStartX < newLineEndX) {
              newLineStartX = MIN_WIDTH_X;
              newLineEndX = Number(line.attr("x2"));
            } else {
              newLineStartX = Number(line.attr("x1"));
              newLineEndX = MIN_WIDTH_X;
            }
          }
          if (Math.min(newLineStartY, newLineEndY) <= MIN_WIDTH) {
            newLineStartX = Number(line.attr("x1"));
            newLineEndX = Number(line.attr("x2"));
            if (newLineStartY < newLineEndY) {
              newLineStartY = MIN_WIDTH_X;
              newLineEndY = Number(line.attr("y2"));
            } else {
              newLineStartY = Number(line.attr("y1"));
              newLineEndY = MIN_WIDTH_X;
            }
          }
          if (Math.max(newLineStartX, newLineEndX) >= cols - MIN_WIDTH) {
            newLineStartY = Number(line.attr("y1"));
            newLineEndY = Number(line.attr("y2"));
            if (newLineStartX > newLineEndX) {
              newLineStartX = cols - MIN_WIDTH_X;
              newLineEndX = Number(line.attr("x2"));
            } else {
              newLineStartX = Number(line.attr("x1"));
              newLineEndX = cols - MIN_WIDTH_X;
            }
          }
          if (Math.max(newLineStartY, newLineEndY) >= rows - MIN_WIDTH) {
            newLineStartX = Number(line.attr("x1"));
            newLineEndX = Number(line.attr("x2"));
            if (newLineStartY > newLineEndY) {
              newLineStartY = rows - MIN_WIDTH_X;
              newLineEndY = Number(line.attr("y2"));
            } else {
              newLineStartY = Number(line.attr("y1"));
              newLineEndY = rows - MIN_WIDTH_X;
            }
          }
          // 线段长度/角度不变
          newLineEndX = newLineStartX + lineLength * Math.cos(angle);
          newLineEndY = newLineStartY + lineLength * Math.sin(angle);
          // 更新线段的位置
          line
            .attr("x1", newLineStartX)
            .attr("y1", newLineStartY)
            .attr("x2", newLineEndX)
            .attr("y2", newLineEndY);
          // 更新端点位置
          circleStart.attr("cx", newLineStartX).attr("cy", newLineStartY);
          circleEnd.attr("cx", newLineEndX).attr("cy", newLineEndY);
          // 更新坐标值
          x1 = newLineStartX;
          y1 = newLineStartY;
          x2 = newLineEndX;
          y2 = newLineEndY;
          // 两种情况 1.没有连接线情况下，长度值整体移动；2.有连接线情况，不更改长度值位置，更改连接线终点
          const textLineX1 = Number(textLine.attr("x1"));
          const textLineY1 = Number(textLine.attr("y1"));
          const textLineX2 = Number(textLine.attr("x2"));
          const textLineY2 = Number(textLine.attr("y2"));
          const textBBox = text.node().getBBox();
          const textWidth = textBBox.width;
          if (textLineX1 - textLineX2 === 0 && textLineY2 - textLineY1 === 0) {
            text
              .attr(
                "x",
                x2 <= MIN_WIDTH
                  ? MIN_WIDTH
                  : x2 >= cols - textWidth - MIN_WIDTH
                  ? cols - textWidth - MIN_WIDTH
                  : x2 - MIN_WIDTH
              )
              .attr(
                "y",
                y2 <= fontSize
                  ? fontSize
                  : y2 >= rows - fontSize
                  ? rows - fontSize
                  : y2 + fontSize
              );
            textLine
              .attr("x1", text.attr("x"))
              .attr("y1", text.attr("y"))
              .attr("x2", text.attr("x"))
              .attr("y2", text.attr("y"));
          } else {
            // 判断连接到到哪个端点
            const textX = text.attr("x");
            const textY = text.attr("y");
            const l1 = Math.sqrt(
              (textX - x1) * (textX - x1) + (textY - y1) * (textY - y1)
            );
            const l2 = Math.sqrt(
              (textX - x2) * (textX - x2) + (textY - y2) * (textY - y2)
            );
            textLine
              .attr("x1", textX)
              .attr("y1", textY)
              .attr("x2", l1 < l2 ? x1 : x2)
              .attr("y2", l1 < l2 ? y1 : y2);
          }
          saveViewportMeasures({ viewportDom, isStay: true });
        }
      })
    );
  // 点击，更改ruler选中状态
  line.on("click", (event: any) => {
    if (
      window.isMeasureStatus &&
      line.attr("id") === measureCommonStore.operMeasureId
    ) {
      line.attr("stroke", config.measure.activeFill);
      text.attr("fill", config.measure.fill);
      circleStart.attr("fill", config.measure.initFill);
      circleEnd.attr("fill", config.measure.initFill);
    }
  });
  // 绘制线段长度
  const length = calcRulerLength({ x1, y1, x2, y2, componentName });
  const text: any = rulerGrp
    .append("text")
    .attr(
      "x",
      isNewRuler
        ? x2 <= MIN_WIDTH
          ? MIN_WIDTH
          : x2 >= cols - fontSize * MAX_SIZE
          ? cols - fontSize * MAX_SIZE
          : x2 - MIN_WIDTH
        : textX
        ? textX
        : x2 - MIN_WIDTH
    )
    .attr(
      "y",
      isNewRuler
        ? y2 <= fontSize
          ? fontSize
          : y2 >= rows - fontSize
          ? rows - fontSize
          : y2 + fontSize
        : textY
        ? textY
        : y2 + fontSize
    )
    .attr("id", id)
    .text(`${length.toFixed(1)}μm`)
    .attr("fill", config.measure.fill)
    .attr("font-size", fontSize)
    .attr("class", "Rulers");
  text.attr("cursor", isNewRuler ? "move" : "pointer").call(
    d3.drag().on("drag", event => {
      if (
        window.isMeasureStatus &&
        text.attr("id") === measureCommonStore.operMeasureId
      ) {
        line.attr("stroke", config.measure.fill);
        text.attr("fill", config.measure.activeFill);
        circleStart.attr("fill", config.measure.initFill);
        circleEnd.attr("fill", config.measure.initFill);
        // 计算到达两个端点的距离
        const { x, y, dx, dy } = event;
        let newLineStartX = Number(textLine.attr("x1"));
        let newLineStartY = Number(textLine.attr("y1"));
        let newLineEndX = Number(textLine.attr("x2"));
        let newLineEndY = Number(textLine.attr("y2"));
        newLineStartX += dx;
        newLineStartY += dy;
        const l1 = Math.sqrt(
          (newLineStartX - x1) * (newLineStartX - x1) +
            (newLineStartY - y1) * (newLineStartY - y1)
        );
        const l2 = Math.sqrt(
          (newLineStartX - x2) * (newLineStartX - x2) +
            (newLineStartY - y2) * (newLineStartY - y2)
        );
        newLineEndX = l1 < l2 ? x1 : x2;
        newLineEndY = l1 < l2 ? y1 : y2;
        const textBBox = text.node().getBBox();
        const textWidth = textBBox.width;
        // 边界点
        newLineStartX =
          x <= MIN_WIDTH
            ? MIN_WIDTH
            : x >= cols - textWidth - MIN_WIDTH
            ? cols - textWidth - MIN_WIDTH
            : newLineStartX;
        newLineStartY =
          y <= fontSize
            ? fontSize
            : y >= rows - MIN_WIDTH
            ? rows - MIN_WIDTH
            : newLineStartY;
        text.attr("x", newLineStartX).attr("y", newLineStartY);
        textLine
          .attr("x1", newLineStartX)
          .attr("y1", newLineStartY)
          .attr("x2", newLineEndX)
          .attr("y2", newLineEndY);
        saveViewportMeasures({ viewportDom, isStay: true });
      }
    })
  );
  text.on("click", (event: any) => {
    if (
      window.isMeasureStatus &&
      text.attr("id") === measureCommonStore.operMeasureId
    ) {
      line.attr("stroke", config.measure.fill);
      text.attr("fill", config.measure.activeFill);
      circleStart.attr("fill", config.measure.initFill);
      circleEnd.attr("fill", config.measure.initFill);
    }
  });
  // 预留长度连接线
  let textLineEndX, textLineEndY;
  if (TextMoved && textX && textY) {
    const l1 = Math.sqrt(
      (textX - x1) * (textX - x1) + (textY - y1) * (textY - y1)
    );
    const l2 = Math.sqrt(
      (textX - x2) * (textX - x2) + (textY - y2) * (textY - y2)
    );
    textLineEndX = l1 < l2 ? x1 : x2;
    textLineEndY = l1 < l2 ? y1 : y2;
  }
  const textLine = rulerGrp
    .append("line")
    .attr("x1", text.attr("x"))
    .attr("y1", text.attr("y"))
    .attr(
      "x2",
      isNewRuler ? text.attr("x") : TextMoved ? textLineEndX : text.attr("x")
    )
    .attr(
      "y2",
      isNewRuler ? text.attr("y") : TextMoved ? textLineEndY : text.attr("y")
    )
    .attr("id", id)
    .attr("class", "Rulers");
  textLine
    .attr("stroke", config.measure.fill)
    .attr("stroke-width", strokeWidth)
    .attr("cursor", "pointer")
    .style("stroke-dasharray", dashArray);
  // 绘制起始端点
  const circleStart: any = rulerGrp
    .append("circle")
    .attr("cx", x1)
    .attr("cy", y1)
    .attr("r", strokeWidth * 2)
    .attr("id", id)
    .attr("class", "Rulers")
    .style("display", isNewRuler ? "block" : "none");
  circleStart
    .attr("fill", config.measure.initFill)
    .attr("cursor", "move")
    .call(
      d3.drag().on("drag", event => {
        line.attr("stroke", config.measure.fill);
        text.attr("fill", config.measure.fill);
        circleStart.attr("fill", config.measure.activeFill);
        circleEnd.attr("fill", config.measure.initFill);
        let { x, y } = event;
        x = x <= 0 ? MIN_WIDTH : x >= cols ? cols - MIN_WIDTH : x;
        y = y <= 0 ? MIN_WIDTH : y >= rows ? rows - MIN_WIDTH : y;
        circleStart.attr("cx", x).attr("cy", y);
        x1 = x;
        y1 = y;
        line.attr("x1", x1).attr("y1", y1);
        // 无连接线情况下无影响，有连接线情况下计算更改连接线终点
        const lineLength = calcRulerLength({
          x1,
          y1,
          x2,
          y2,
          componentName
        });
        text.text(`${lineLength.toFixed(1)}μm`);
        const textLineX1 = Number(textLine.attr("x1"));
        const textLineY1 = Number(textLine.attr("y1"));
        const textLineX2 = Number(textLine.attr("x2"));
        const textLineY2 = Number(textLine.attr("y2"));
        if (!(textLineX1 - textLineX2 === 0 && textLineY2 - textLineY1 === 0)) {
          const textX = text.attr("x");
          const textY = text.attr("y");
          const l1 = Math.sqrt(
            (textX - x1) * (textX - x1) + (textY - y1) * (textY - y1)
          );
          const l2 = Math.sqrt(
            (textX - x2) * (textX - x2) + (textY - y2) * (textY - y2)
          );
          textLine
            .attr("x1", textX)
            .attr("y1", textY)
            .attr("x2", l1 < l2 ? x1 : x2)
            .attr("y2", l1 < l2 ? y1 : y2);
          saveViewportMeasures({ viewportDom, isStay: true });
        }
      })
    );
  circleStart.on("click", (event: any) => {
    line.attr("stroke", config.measure.fill);
    text.attr("fill", config.measure.fill);
    circleStart.attr("fill", config.measure.activeFill);
    circleEnd.attr("fill", config.measure.initFill);
  });
  const circleEnd: any = rulerGrp
    .append("circle")
    .attr("cx", x2)
    .attr("cy", y2)
    .attr("r", strokeWidth * 2)
    .attr("id", id)
    .attr("class", "Rulers")
    .style("display", isNewRuler ? "block" : "none");
  circleEnd
    .attr("fill", config.measure.activeFill)
    .attr("cursor", "move")
    .call(
      d3.drag().on("drag", event => {
        line.attr("stroke", config.measure.fill);
        text.attr("fill", config.measure.fill);
        circleStart.attr("fill", config.measure.initFill);
        circleEnd.attr("fill", config.measure.activeFill);
        let { x, y } = event;
        x = x <= 0 ? MIN_WIDTH : x >= cols ? cols - MIN_WIDTH : x;
        y = y <= 0 ? MIN_WIDTH : y >= rows ? rows - MIN_WIDTH : y;
        circleEnd.attr("cx", x).attr("cy", y);
        x2 = x;
        y2 = y;
        line.attr("x2", x2).attr("y2", y2);
        // 同线移动，没有连接线跟随移动，有连接线更改连接线位置
        const lineLength = calcRulerLength({
          x1,
          y1,
          x2,
          y2,
          componentName
        });
        text.text(`${lineLength.toFixed(1)}μm`);
        const textLineX1 = Number(textLine.attr("x1"));
        const textLineY1 = Number(textLine.attr("y1"));
        const textLineX2 = Number(textLine.attr("x2"));
        const textLineY2 = Number(textLine.attr("y2"));
        const textBBox = text.node().getBBox();
        const textWidth = textBBox.width;
        if (textLineX1 - textLineX2 === 0 && textLineY2 - textLineY1 === 0) {
          text
            .attr(
              "x",
              isNewRuler
                ? x2 <= MIN_WIDTH
                  ? MIN_WIDTH
                  : x2 >= cols - textWidth - MIN_WIDTH
                  ? cols - textWidth - MIN_WIDTH
                  : x2 - MIN_WIDTH
                : x2 - MIN_WIDTH
            )
            .attr(
              "y",
              isNewRuler
                ? y2 <= fontSize
                  ? fontSize
                  : y2 >= rows - fontSize
                  ? rows - fontSize
                  : y2 + fontSize
                : y2 + fontSize
            );
          textLine
            .attr("x1", text.attr("x"))
            .attr("y1", text.attr("y"))
            .attr("x2", text.attr("x"))
            .attr("y2", text.attr("y"));
        } else {
          // 判断连接到到哪个端点
          const textX = text.attr("x");
          const textY = text.attr("y");
          const l1 = Math.sqrt(
            (textX - x1) * (textX - x1) + (textY - y1) * (textY - y1)
          );
          const l2 = Math.sqrt(
            (textX - x2) * (textX - x2) + (textY - y2) * (textY - y2)
          );
          textLine
            .attr("x1", textX)
            .attr("y1", textY)
            .attr("x2", l1 < l2 ? x1 : x2)
            .attr("y2", l1 < l2 ? y1 : y2);
        }
        saveViewportMeasures({ viewportDom, isStay: true });
      })
    );
  circleEnd.on("click", (event: any) => {
    line.attr("stroke", config.measure.fill);
    text.attr("fill", config.measure.fill);
    circleStart.attr("fill", config.measure.initFill);
    circleEnd.attr("fill", config.measure.activeFill);
  });
};

export const drawGlobalRulers = ({
  viewportDom,
  viewerType,
  componentName,
  rulers
}: {
  viewportDom: HTMLElement;
  viewerType: MeasureViewTypeEnum;
  componentName: ContainerNameEnum;
  rulers: PointType[];
}) => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const { leftOffset, topOffset } = getOffset(viewportDom, componentName);
  rulers.forEach(ruler => {
    const { flatPoint, TextMoved, TextPosition } = ruler;
    if (flatPoint && flatPoint.length && TextPosition && TextPosition.length) {
      drawLine({
        viewportDom,
        x1:
          MeasureViewTypeEnum.FastBScan ===
          COMPONENTNAME_VIEWERTYPE[componentName]
            ? leftOffset + flatPoint[0] * BSCAN_SCALE
            : MeasureViewTypeEnum.SlowBScan ===
              COMPONENTNAME_VIEWERTYPE[componentName]
            ? isAnteriorScan(analysisCommonStore.protocolName)
              ? flatPoint[0]
              : flatPoint[0] * BSCAN_SCALE
            : flatPoint[0] + leftOffset,
        y1: flatPoint[1] + topOffset,
        x2:
          MeasureViewTypeEnum.FastBScan ===
          COMPONENTNAME_VIEWERTYPE[componentName]
            ? leftOffset + flatPoint[2] * BSCAN_SCALE
            : MeasureViewTypeEnum.SlowBScan ===
              COMPONENTNAME_VIEWERTYPE[componentName]
            ? isAnteriorScan(analysisCommonStore.protocolName)
              ? flatPoint[2]
              : flatPoint[2] * BSCAN_SCALE
            : flatPoint[2] + leftOffset,
        y2: flatPoint[3] + topOffset,
        isNewRuler: false,
        TextMoved,
        textX:
          MeasureViewTypeEnum.FastBScan ===
          COMPONENTNAME_VIEWERTYPE[componentName]
            ? leftOffset + TextPosition[0] * BSCAN_SCALE
            : MeasureViewTypeEnum.SlowBScan ===
              COMPONENTNAME_VIEWERTYPE[componentName]
            ? isAnteriorScan(analysisCommonStore.protocolName)
              ? TextPosition[0]
              : TextPosition[0] * BSCAN_SCALE
            : TextPosition[0] + leftOffset,
        textY: TextPosition[1] + topOffset
      });
    }
  });
};

// 双击进入编辑状态
export const enterDrawRulerLine = ({
  viewportDom,
  target
}: {
  viewportDom: HTMLElement;
  target: HTMLElement;
}) => {
  const measureCommonStore = useMeasureCommonStore();
  measureCommonStore.setParamsVal({ count: 2 });
  window.isMeasureStatus = true;
  setRulerStatus({ viewportDom, target });
};

/**
 * 编辑状态下，切换当前选中的ruler
 * 1. 切换前后的ruler同属于一个dom
 * 2. 切换前后的ruler属于不同dom
 */
export const selectDrawRulerLine = ({
  viewportDom,
  target
}: {
  viewportDom: HTMLElement;
  target: HTMLElement;
}) => {
  const measureCommonStore = useMeasureCommonStore();
  const { clickCount, operViewportDom } = measureCommonStore;
  if (clickCount === 0) {
    d3.select(viewportDom).select(".coordinates").on("click", null);
    measureCommonStore.setParamsVal({ count: 2 });
  }
  if (viewportDom != operViewportDom) {
    // 不同区域需要先保存
    const svgs = d3.select(operViewportDom).selectAll(".Rulers");
    [...svgs].forEach((item: any) => {
      setOtherRulerStatus(item);
    });
  }
  setRulerStatus({ viewportDom, target });
};

export function getViewportRulers({
  viewportDom,
  componentName,
  isStay
}: {
  viewportDom: HTMLElement;
  componentName: ContainerNameEnum;
  viewerType: MeasureViewTypeEnum | any;
  sliceIndex?: number;
  isStay?: boolean;
}) {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const Rulers: Array<PointType> = [];
  const { leftOffset, topOffset } = getOffset(viewportDom, componentName);
  const measureCommonStore = useMeasureCommonStore();
  const { operMeasureId } = measureCommonStore;
  const svgs = d3
    .select(viewportDom)
    .select(".coordinates")
    .classed("measure-cursor", false)
    .selectAll(".ruler-path");
  [...svgs].forEach((itemSvg: any) => {
    let flatPoint: number[] = [];
    let TextMoved = false;
    let TextPosition: number[] = [];
    const pointSvgs = d3.select(itemSvg).selectAll(".Rulers");
    [...pointSvgs].forEach((item: any) => {
      const id = d3.select(item).attr("id");
      if (item?.nodeName === "line") {
        !isStay &&
          id === operMeasureId &&
          d3
            .select(item)
            .attr("stroke", config.measure.fill)
            .attr("cursor", "pointer");
        if (d3.select(item).style("stroke-dasharray") === "none") {
          flatPoint = [
            MeasureViewTypeEnum.FastBScan ===
            COMPONENTNAME_VIEWERTYPE[componentName]
              ? (Number(d3.select(item).attr("x1")) - leftOffset) / BSCAN_SCALE
              : MeasureViewTypeEnum.SlowBScan ===
                COMPONENTNAME_VIEWERTYPE[componentName]
              ? isAnteriorScan(analysisCommonStore.protocolName)
                ? Number(d3.select(item).attr("x1"))
                : Number(d3.select(item).attr("x1")) / BSCAN_SCALE
              : Number(d3.select(item).attr("x1")) - leftOffset,
            Number(d3.select(item).attr("y1")) - topOffset,
            MeasureViewTypeEnum.FastBScan ===
            COMPONENTNAME_VIEWERTYPE[componentName]
              ? (Number(d3.select(item).attr("x2")) - leftOffset) / BSCAN_SCALE
              : MeasureViewTypeEnum.SlowBScan ===
                COMPONENTNAME_VIEWERTYPE[componentName]
              ? isAnteriorScan(analysisCommonStore.protocolName)
                ? Number(d3.select(item).attr("x2"))
                : Number(d3.select(item).attr("x2")) / BSCAN_SCALE
              : Number(d3.select(item).attr("x2")) - leftOffset,
            Number(d3.select(item).attr("y2")) - topOffset
          ];
        }
        if (d3.select(item).style("stroke-dasharray") !== "none") {
          TextMoved = !(
            Number(d3.select(item).attr("x1")) ===
              Number(d3.select(item).attr("x2")) &&
            Number(d3.select(item).attr("y1")) ===
              Number(d3.select(item).attr("y2"))
          );
        }
      }
      if (item?.nodeName === "text") {
        !isStay &&
          d3
            .select(item)
            .attr("fill", config.measure.fill)
            .attr("cursor", "pointer");
        TextPosition = [
          MeasureViewTypeEnum.FastBScan ===
          COMPONENTNAME_VIEWERTYPE[componentName]
            ? (Number(d3.select(item).attr("x")) - leftOffset) / BSCAN_SCALE
            : MeasureViewTypeEnum.SlowBScan ===
              COMPONENTNAME_VIEWERTYPE[componentName]
            ? isAnteriorScan(analysisCommonStore.protocolName)
              ? Number(d3.select(item).attr("x"))
              : Number(d3.select(item).attr("x")) / BSCAN_SCALE
            : Number(d3.select(item).attr("x")) - leftOffset,
          Number(d3.select(item).attr("y")) - topOffset
        ];
      }
      if (item?.nodeName === "circle") {
        !isStay && d3.select(item).attr("style", "display: none");
      }
    });
    Rulers.push({ type: "Item", flatPoint, TextPosition, TextMoved });
  });
  return Rulers;
}
function setRulerStatus({
  viewportDom,
  target
}: {
  viewportDom: HTMLElement;
  target: HTMLElement;
}) {
  d3.select(viewportDom).select(".coordinates").classed("measure-cursor", true);
  const selectSvg = d3.select(target); // 红色
  const id = selectSvg.attr("id");
  const measureCommonStore = useMeasureCommonStore();
  measureCommonStore.setParamsVal({ id, viewportDom });
  const svgs = d3.select(viewportDom).selectAll(".Rulers");
  [...svgs].forEach((item: any) => {
    if (d3.select(item).attr("id") === id) {
      if (item?.nodeName === "circle") {
        d3.select(item)
          .attr("style", "display: block")
          .attr("fill", config.measure.initFill)
          .attr("cursor", "move");
      } else if (
        item?.nodeName === "line" &&
        d3.select(item).style("stroke-dasharray") === "none"
      ) {
        d3.select(item)
          .attr(
            "stroke",
            selectSvg.node()?.tagName === "line"
              ? config.measure.activeFill
              : config.measure.fill
          )
          .attr("cursor", "move");
      } else if (item?.nodeName === "text") {
        d3.select(item)
          .attr(
            "fill",
            selectSvg.node()?.tagName === "line"
              ? config.measure.fill
              : config.measure.activeFill
          )
          .attr("cursor", "move");
      }
    } else {
      setOtherRulerStatus(item);
    }
  });
}
function setOtherRulerStatus(item: any) {
  if (item?.nodeName === "circle") {
    d3.select(item).attr("style", "display: none").attr("cursor", "pointer");
  } else if (item?.nodeName === "line") {
    d3.select(item)
      .attr("stroke", config.measure.fill)
      .attr("cursor", "pointer");
  } else if (item?.nodeName === "text") {
    d3.select(item).attr("fill", config.measure.fill).attr("cursor", "pointer");
  }
}

function drawFirstCircleLine({
  viewportDom,
  x,
  y
}: {
  viewportDom: HTMLElement;
  x: number;
  y: number;
}) {
  const svg = d3.select(viewportDom).select(".coordinates");
  const { strokeWidth } = getStrokeWidth(viewportDom);
  const line = svg
    .append("line")
    .attr("stroke", config.measure.fill)
    .attr("stroke-width", strokeWidth)
    .attr("class", "firstLine");
  const circle = svg
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", strokeWidth * 2)
    .attr("class", "firstCircle");
  line.attr("x1", x).attr("y1", y).attr("x2", x).attr("y2", y);
  circle
    .attr("fill", config.measure.initFill)
    .attr("cursor", "move")
    .call(
      d3.drag<SVGCircleElement, unknown>().on("drag", event => {
        svg.attr("cursor", "move");
        circle.attr("fill", config.measure.activeFill);
        const { x, y, dx, dy } = event;
        const newCircleX = x + dx;
        const newCircleY = y + dy;
        circle.attr("cx", newCircleX).attr("cy", newCircleY);
        line
          .attr("x1", newCircleX)
          .attr("y1", newCircleY)
          .attr("x2", newCircleX)
          .attr("y2", newCircleY);
      })
    );
  svg.on("mousemove", event => {
    const { offsetX, offsetY } = event;
    line.attr("x2", offsetX).attr("y2", offsetY);
  });
}
