import * as d3 from "d3";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "xe-utils";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import { config } from "../config.yml";
import { PointType } from "@/views/analysis/store/measureCommon";
import {
  ContainerNameEnum,
  MeasureViewTypeEnum,
  MeasureTypeEnum
} from "@/enums";
import {
  getStrokeWidth,
  resetMeasureParamsVal,
  getOffset,
  saveViewportMeasures
} from "./index";
import { COMPONENTNAME_VIEWERTYPE } from "@/utils/constant";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { isAnteriorScan } from "@/utils/protocol";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";

const measureTextClassName = "text-path";
const MIN_WIDTH = 10;
const BSCAN_SCALE = 0.4;

export const drawTextArea = (viewportDom: HTMLElement, captureKey?: string) => {
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
      .classed("measure-cursor-text", true);
    let clickX: any, clickY: any;
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
          const { offsetX, offsetY, x, y } = event;
          if (count === 1) {
            svg.on("click", null).classed("measure-cursor-text", true);
            svg.on("mouseover", null);
            clickX = offsetX;
            clickY = offsetY;
            measureCommonStore.setShowTextEditDialog(true);
            measureCommonStore.setMeasureText("");
            measureCommonStore.setMeasureTextPosition({ x: clickX, y: clickY });
            measureCommonStore.setTextDialogClientPosition({
              x,
              y
            });
          }
        }
      }, 300)
    );
  }
};

export const confirmEditMeasureText = async () => {
  const measureCommonStore = useMeasureCommonStore();
  const { x, y, operMeasureText, operMeasureId, operViewportDom } =
    measureCommonStore;
  // 删除原本的meausreText
  operMeasureId && (await setMeasureTextSatus());
  // 不存在id,一定是新增
  !operMeasureId &&
    operViewportDom &&
    (await drawArea({
      viewportDom: operViewportDom,
      x,
      y,
      text: operMeasureText
    }));
  // 退出编辑状态
  operViewportDom && resetMeasureParamsVal(operViewportDom);
  // 清除多余的text-path
  operViewportDom && removeSpareTextArea(operViewportDom);
};

export const drawArea = async ({
  viewportDom,
  x,
  y,
  text
}: {
  viewportDom: HTMLElement;
  x: number;
  y: number;
  text: string;
}) => {
  const measureCommonStore = useMeasureCommonStore();
  measureCommonStore.setParamsVal({ id: "" });
  const id = uuidv4();
  const svg = d3.select(viewportDom).select(".coordinates");
  const { strokeWidth, fontSize } = getStrokeWidth(viewportDom);

  const textGrp = svg
    .append("g")
    .attr("class", measureTextClassName)
    .attr("id", id);

  const cols = Number(svg.attr("width"));
  const rows = Number(svg.attr("height"));

  const maxWidth = cols - x;

  const linesText = text.split("\n");

  const textElement: any = textGrp
    .append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("id", id)
    .attr("font-size", fontSize)
    .attr("fill", config.measure.fill)
    .attr("text-anchor", "start") // 对齐到文本的左侧
    .attr("dominant-baseline", "hanging")
    .attr("class", "Texts");
  textElement.call(
    d3.drag().on("drag", event => {
      textElement.attr("fill", config.measure.fill).attr("cursor", "move");

      // 计算到达两个端点的距离
      const { x, y, dx, dy } = event;
      let newLineStartX = Number(textElement.attr("x"));
      let newLineStartY = Number(textElement.attr("y"));
      newLineStartX += dx;
      newLineStartY += dy;
      const textBBox = textElement.node().getBBox();
      const textWidth = textBBox.width;
      // 边界点
      newLineStartX =
        x <= MIN_WIDTH
          ? MIN_WIDTH
          : x >= cols - textWidth - MIN_WIDTH
          ? cols - textWidth - MIN_WIDTH
          : newLineStartX;
      newLineStartY =
        y <= 0 ? 0 : y >= rows - fontSize ? rows - fontSize : newLineStartY;
      textElement.attr("x", newLineStartX).attr("y", newLineStartY);
      textElement.selectAll("tspan").attr("x", newLineStartX);
      saveViewportMeasures({ viewportDom, isStay: true });
    })
  );
  textElement.on("mouseover", () => {
    textElement.attr("fill", config.measure.fill).attr("cursor", "move");
  });
  textElement.on("mouseleave", () => {
    textElement.attr("fill", config.measure.fill).attr("cursor", "pointer");
  });
  let dy = 0;
  linesText.forEach(line => {
    textElement
      .append("tspan")
      .attr("class", "Texts")
      .attr("id", id)
      .attr("x", x)
      .attr("dy", dy)
      .text(line || "\u00A0"); // '\u00A0' 用于处理空行的情况
    dy = fontSize; // 在首行之后设置行高
  });
  const textBBox = textElement.node().getBBox();
  const textWidth = textBBox.width;
  saveViewportMeasures({ viewportDom, isStay: true });
  if (textWidth <= maxWidth) return;
  textGrp.remove();
  drawArea({
    viewportDom,
    x: cols - textWidth,
    y,
    text
  });
};

export const drawGlobalTexts = ({
  viewportDom,
  viewerType,
  componentName,
  texts
}: {
  viewportDom: HTMLElement;
  viewerType: MeasureViewTypeEnum;
  componentName: ContainerNameEnum;
  texts: PointType[];
}) => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const { leftOffset, topOffset } = getOffset(viewportDom, componentName);
  texts.forEach(Text => {
    const { flatPoint, text } = Text;
    drawArea({
      viewportDom,
      x:
        MeasureViewTypeEnum.FastBScan ===
        COMPONENTNAME_VIEWERTYPE[componentName]
          ? leftOffset + flatPoint[0] * BSCAN_SCALE
          : MeasureViewTypeEnum.SlowBScan ===
            COMPONENTNAME_VIEWERTYPE[componentName]
          ? isAnteriorScan(analysisCommonStore.protocolName)
            ? flatPoint[0]
            : flatPoint[0] * BSCAN_SCALE
          : flatPoint[0] + leftOffset,
      y: flatPoint[1] + topOffset,
      text: text || ""
    });
  });
};

export const enterDrawTextArea = ({
  viewportDom,
  target,
  x,
  y
}: {
  viewportDom: HTMLElement;
  target: HTMLElement;
  x: number;
  y: number;
}) => {
  const measureCommonStore = useMeasureCommonStore();
  measureCommonStore.setParamsVal({ count: 1 });
  window.isMeasureStatus = true;
  measureCommonStore.setShowTextEditDialog(true);
  // 设置文本
  const selectSvg = d3.select(target); // 红色
  const id = selectSvg.attr("id");
  let text = "";
  const svg = d3
    .select(viewportDom)
    .select(".coordinates")
    .classed("measure-cursor-text", true);
  const svgs = svg.selectAll(".Texts");
  [...svgs].forEach((item: any) => {
    if (d3.select(item).attr("id") === id) {
      d3.select(item).attr("fill", config.measure.fill);
      if (item?.nodeName === "text") {
        const tspans = d3.select(item).selectAll("tspan").nodes();
        text = tspans.map((tspan: any) => tspan?.textContent).join("\n");
        text = text
          .split("\n")
          .map(line => line.trimEnd())
          .join("\n");
      }
    }
  });
  measureCommonStore.setParamsVal({ id, viewportDom });
  measureCommonStore.setMeasureText(text);
  measureCommonStore.setTextDialogClientPosition({
    x,
    y
  });
};

export const setMeasureTextSatus = () => {
  const measureCommonStore = useMeasureCommonStore();
  const { operMeasureId, operViewportDom, operMeasureText } =
    measureCommonStore;
  const svg = d3
    .select(operViewportDom)
    .select(".coordinates")
    .classed("measure-cursor-text", false);
  const svgs = svg.selectAll(".Texts");
  [...svgs].forEach((item: any) => {
    if (d3.select(item).attr("id") === operMeasureId) {
      let x, y;
      if (item?.nodeName === "text") {
        x = Number(d3.select(item).attr("x"));
        y = Number(d3.select(item).attr("y"));

        operViewportDom &&
          drawArea({
            viewportDom: operViewportDom,
            x,
            y,
            text: operMeasureText
          });
      }
      // 删除原文本svg
      const itemSvg = d3.select(item);
      itemSvg && itemSvg.remove();
    }
  });
};

export const getViewportTexts = ({
  viewportDom,
  componentName,
  isStay
}: {
  viewportDom: HTMLElement;
  componentName: ContainerNameEnum;
  viewerType: MeasureViewTypeEnum | any;
  sliceIndex?: number;
  isStay?: boolean;
}) => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const Texts: Array<PointType> = [];
  const { leftOffset, topOffset } = getOffset(viewportDom, componentName);
  const svgs = d3
    .select(viewportDom)
    .select(".coordinates")
    .classed("measure-cursor-text", false)
    .selectAll(".text-path");
  [...svgs].forEach((itemSvg: any) => {
    let flatPoint: number[] = [];
    let text = "";
    const pointSvgs = d3.select(itemSvg).selectAll(".Texts");
    [...pointSvgs].forEach((item: any) => {
      if (item?.nodeName === "text") {
        flatPoint = [
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
        const tspans = d3.select(item).selectAll("tspan").nodes();
        text = tspans.map((tspan: any) => tspan?.textContent).join("\n");
        text = text
          .split("\n")
          .map(line => line.trimEnd())
          .join("\n");
      }
    });
    text && Texts.push({ text, flatPoint });
  });
  return Texts;
};

export const removeSpareTextArea = (viewportDom: HTMLElement) => {
  const svgs = d3.select(viewportDom).selectAll(".text-path");
  [...svgs].forEach((itemSvg: any) => {
    const pointSvgs = d3.select(itemSvg).selectAll(".Texts");
    pointSvgs.empty() && d3.select(itemSvg).remove();
  });
};
