import { PointType } from "@/views/analysis/store/measureCommon";
import { getStrokeWidth, getOffset, saveViewportMeasures } from "./index";
import { ContainerNameEnum, MeasureViewTypeEnum } from "@/enums";
import { COMPONENTNAME_VIEWERTYPE } from "@/utils/constant";
import * as d3 from "d3";
import { v4 as uuidv4 } from "uuid";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import { config } from "../config.yml";
import { debounce } from "xe-utils";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { isAnteriorScan } from "@/utils/protocol";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";

const measureArrowClassName = "arrow-path";
const MIN_WIDTH = 10;
const MIN_WIDTH_X = 10.001;
const BSCAN_SCALE = 0.4;

export const drawArrowLine = (
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
              isNewArrow: true
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
  isNewArrow
}: {
  viewportDom: HTMLElement;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isNewArrow: boolean;
}) => {
  const measureCommonStore = useMeasureCommonStore();
  const id = uuidv4();
  isNewArrow
    ? measureCommonStore.setParamsVal({ id })
    : measureCommonStore.setParamsVal({ id: "" });
  const svg = d3.select(viewportDom).select(".coordinates");
  const arrowGrp = svg
    .append("g")
    .attr("class", measureArrowClassName)
    .attr("id", id);

  const cols = Number(svg.attr("width"));
  const rows = Number(svg.attr("height"));
  const componentName = d3
    .select(viewportDom)
    .select(".inner-container")
    .attr("data-custom-name") as ContainerNameEnum;
  const { arrowStrokeWidth } = getStrokeWidth(viewportDom);

  arrowGrp
    .append("defs")
    .append("marker")
    .attr("id", `arrow-${id}`)
    .attr("class", `arrow-marker`)
    .attr("viewBox", "0 0 12 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M 0 0 L 6 5 L 0 10 z")
    .attr("fill", config.measure.fill);
  const line: any = arrowGrp
    .append("line")
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2)
    .attr("id", id)
    .attr("class", "Arrows")
    .attr("marker-end", `url(#arrow-${id})`);
  line
    .attr("stroke", config.measure.fill)
    .attr("stroke-width", arrowStrokeWidth)
    .attr("d", line)
    .attr("cursor", isNewArrow ? "move" : "pointer")
    .call(
      d3.drag().on("drag", event => {
        if (
          window.isMeasureStatus &&
          line.attr("id") === measureCommonStore.operMeasureId
        ) {
          d3.select(`#arrow-${id} path`).attr(
            "fill",
            config.measure.activeFill
          );
          line.attr("stroke", config.measure.activeFill);
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
          saveViewportMeasures({ viewportDom, isStay: true });
        }
      })
    );
  // 点击，更改arrow选中状态
  line.on("click", (event: any) => {
    if (
      window.isMeasureStatus &&
      line.attr("id") === measureCommonStore.operMeasureId
    ) {
      d3.select(`#arrow-${id} path`).attr("fill", config.measure.activeFill);
      line.attr("stroke", config.measure.activeFill);
      circleStart.attr("fill", config.measure.initFill);
      circleEnd.attr("fill", config.measure.initFill);
    }
  });
  // 绘制起始端点
  const circleStart: any = arrowGrp
    .append("circle")
    .attr("cx", x1)
    .attr("cy", y1)
    .attr("r", arrowStrokeWidth)
    .attr("id", id)
    .attr("class", "Arrows")
    .style("display", isNewArrow ? "block" : "none");
  circleStart
    .attr("fill", config.measure.initFill)
    .attr("cursor", "move")
    .call(
      d3.drag().on("drag", event => {
        d3.select(`#arrow-${id} path`).attr("fill", config.measure.fill);
        line.attr("stroke", config.measure.fill);
        circleStart.attr("fill", config.measure.activeFill);
        circleEnd.attr("fill", config.measure.initFill);
        let { x, y } = event;
        x = x <= 0 ? MIN_WIDTH : x >= cols ? cols - MIN_WIDTH : x;
        y = y <= 0 ? MIN_WIDTH : y >= rows ? rows - MIN_WIDTH : y;
        circleStart.attr("cx", x).attr("cy", y);
        x1 = x;
        y1 = y;
        line.attr("x1", x1).attr("y1", y1);
        saveViewportMeasures({ viewportDom, isStay: true });
      })
    );
  circleStart.on("click", (event: any) => {
    d3.select(`#arrow-${id} path`).attr("fill", config.measure.fill);
    line.attr("stroke", config.measure.fill);
    circleStart.attr("fill", config.measure.activeFill);
    circleEnd.attr("fill", config.measure.initFill);
  });
  const circleEnd: any = arrowGrp
    .append("circle")
    .attr("cx", x2)
    .attr("cy", y2)
    .attr("r", arrowStrokeWidth)
    .attr("id", id)
    .attr("class", "Arrows")
    .style("display", isNewArrow ? "block" : "none");
  circleEnd
    .attr("fill", config.measure.activeFill)
    .attr("cursor", "move")
    .call(
      d3.drag().on("drag", event => {
        d3.select(`#arrow-${id} path`).attr("fill", config.measure.fill);
        line.attr("stroke", config.measure.fill);
        circleStart.attr("fill", config.measure.initFill);
        circleEnd.attr("fill", config.measure.activeFill);
        let { x, y } = event;
        x = x <= 0 ? MIN_WIDTH : x >= cols ? cols - MIN_WIDTH : x;
        y = y <= 0 ? MIN_WIDTH : y >= rows ? rows - MIN_WIDTH : y;
        circleEnd.attr("cx", x).attr("cy", y);
        x2 = x;
        y2 = y;
        line.attr("x2", x2).attr("y2", y2);
        saveViewportMeasures({ viewportDom, isStay: true });
      })
    );
  circleEnd.on("click", (event: any) => {
    d3.select(`#arrow-${id} path`).attr("fill", config.measure.fill);
    line.attr("stroke", config.measure.fill);
    circleStart.attr("fill", config.measure.initFill);
    circleEnd.attr("fill", config.measure.activeFill);
  });
};

export const drawGlobalArrows = ({
  viewportDom,
  viewerType,
  componentName,
  arrows
}: {
  viewportDom: HTMLElement;
  viewerType: MeasureViewTypeEnum;
  componentName: ContainerNameEnum;
  arrows: PointType[];
}) => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const { leftOffset, topOffset } = getOffset(viewportDom, componentName);
  arrows.forEach(arrow => {
    const { flatPoint } = arrow;
    if (flatPoint && flatPoint.length) {
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
        isNewArrow: false
      });
    }
  });
};

// 双击进入编辑状态
export const enterDrawArrowLine = ({
  viewportDom,
  target
}: {
  viewportDom: HTMLElement;
  target: HTMLElement;
}) => {
  const measureCommonStore = useMeasureCommonStore();
  measureCommonStore.setParamsVal({ count: 2 });
  window.isMeasureStatus = true;
  setArrowStatus({ viewportDom, target });
};

export const selectDrawArrowLine = ({
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
    const svgs = d3.select(operViewportDom).selectAll(".Arrows");
    [...svgs].forEach((item: any) => {
      setOtherArrowStatus(item);
    });
  }
  setArrowStatus({ viewportDom, target });
};

export function getViewportArrows({
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
  const Arrows: Array<PointType> = [];
  const { leftOffset, topOffset } = getOffset(viewportDom, componentName);
  const measureCommonStore = useMeasureCommonStore();
  const { operMeasureId } = measureCommonStore;
  const svgs = d3
    .select(viewportDom)
    .select(".coordinates")
    .classed("measure-cursor", false)
    .selectAll(".arrow-path");
  [...svgs].forEach((itemSvg: any) => {
    let flatPoint: number[] = [];
    const pointSvgs = d3.select(itemSvg).selectAll(".Arrows");
    [...pointSvgs].forEach((item: any) => {
      const id = d3.select(item).attr("id");
      if (item?.nodeName === "line") {
        !isStay &&
          id === operMeasureId &&
          d3
            .select(item)
            .attr("stroke", config.measure.fill)
            .attr("cursor", "pointer");
        !isStay &&
          d3.select(`#arrow-${id} path`).attr("fill", config.measure.fill);
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
      if (item?.nodeName === "circle") {
        !isStay && d3.select(item).attr("style", "display: none");
      }
    });
    Arrows.push({ type: "Item", flatPoint });
  });
  return Arrows;
}

function setArrowStatus({
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
  const svgs = d3.select(viewportDom).selectAll(".Arrows");
  [...svgs].forEach((item: any) => {
    if (d3.select(item).attr("id") === id) {
      if (item?.nodeName == "circle") {
        d3.select(item)
          .attr("style", "display: block")
          .attr("fill", config.measure.initFill)
          .attr("cursor", "move");
      } else if (item?.nodeName === "line") {
        d3.select(item)
          .attr(
            "stroke",
            selectSvg.node()?.tagName === "line"
              ? config.measure.activeFill
              : config.measure.fill
          )
          .attr("cursor", "move");
        d3.select(`#arrow-${id} path`).attr(
          "fill",
          selectSvg.node()?.tagName === "line"
            ? config.measure.activeFill
            : config.measure.fill
        );
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
      setOtherArrowStatus(item);
    }
  });
}
function setOtherArrowStatus(item: any) {
  if (item?.nodeName === "circle") {
    d3.select(item).attr("style", "display: none").attr("cursor", "pointer");
  } else if (item?.nodeName === "line") {
    d3.select(item)
      .attr("stroke", config.measure.fill)
      .attr("cursor", "pointer");
    d3.select(`#arrow-${item.id} path`).attr("fill", config.measure.fill);
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
  const { arrowStrokeWidth } = getStrokeWidth(viewportDom);
  svg
    .append("defs")
    .append("marker")
    .attr("id", "firstArrow")
    .attr("viewBox", "0 0 12 10")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M 0 0 L 6 5 L 0 10 z")
    .attr("fill", config.measure.fill)
    .attr("class", "firstArrow");
  const line = svg
    .append("line")
    .attr("stroke", config.measure.fill)
    .attr("stroke-width", arrowStrokeWidth)
    .attr("class", "firstLine")
    .attr("marker-end", "url(#firstArrow)");
  const circle = svg
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", arrowStrokeWidth)
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
