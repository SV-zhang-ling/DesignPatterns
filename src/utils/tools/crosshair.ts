import * as d3 from "d3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import { config } from "./config.yml";
import { ContainerNameEnum } from "@/enums";

type crosshairParamsType = {
  svgDom: SVGElement;
  x: number;
  y: number;
  cols: number;
  rows: number;
  offsetX?: number;
  offsetY?: number;
  spacing: number[];
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  componentName?: ContainerNameEnum;
};

const showNavLine = () => {
  const navigationLineControl = document.querySelector(".show-nav-line");
  return navigationLineControl?.classList.contains("navigation-line");
};

const crosshairClassName = "crosshair-path";

export const initCrossHair = ({
  svgDom,
  x,
  y,
  cols,
  rows,
  offsetX = 0,
  offsetY = 0,
  spacing,
  commitCrosshairPosition,
  componentName
}: crosshairParamsType) => {
  const [spaceX, spaceY] = spacing;
  const X = offsetX + x * spaceX;
  const Y = offsetY + y * spaceY;
  const svg = d3.select(svgDom);

  const crosshairGrp = svg
    .append("g")
    .attr("class", crosshairClassName)
    .attr(
      "style",
      `display: ${
        (componentName &&
          [
            ContainerNameEnum.OCTViewer,
            ContainerNameEnum.ThicknessMap
          ].includes(componentName)) ||
        showNavLine()
          ? "block"
          : "none"
      }`
    );

  // 定义箭头
  crosshairGrp
    .append("defs")
    .append("marker")
    .attr("id", "arrow-verticalLine")
    .attr("viewBox", "0 0 12 12")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerWidth", 12)
    .attr("markerHeight", 12)
    .attr("orient", "auto-start-reverse")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .attr("fill", config.crosshair.verticalLine.stroke);
  // 定义箭头
  crosshairGrp
    .append("defs")
    .append("marker")
    .attr("id", "arrow-horizontalLine")
    .attr("viewBox", "0 0 12 12")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerWidth", 12)
    .attr("markerHeight", 12)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .attr("fill", config.crosshair.horizontalLine.stroke);
  // 绘制十字交叉线的垂直线和水平线
  // console.log({ spaceX, spaceY, x, y }, "*********");
  // console.log(x * spaceX, y * spaceY, "++++++");
  const verticalLine = crosshairGrp
    .append("line")
    .attr("x1", X)
    .attr("y1", offsetY + 3 * spaceY)
    .attr("x2", X)
    .attr("y2", offsetY + rows * spaceY)
    .attr("stroke", config.crosshair.verticalLine.stroke)
    .attr("stroke-width", config.crosshair.strokeWidth)
    .style("pointer-events", "none")
    .attr("marker-start", "url(#arrow-verticalLine)");

  const horizontalLine = crosshairGrp
    .append("line")
    .attr("x1", offsetX)
    .attr("y1", Y)
    .attr("x2", offsetX + (cols - 3) * spaceX)
    .attr("y2", Y)
    .attr("stroke", config.crosshair.horizontalLine.stroke)
    .attr("stroke-width", config.crosshair.strokeWidth)
    .style("pointer-events", "none")
    .attr("marker-end", "url(#arrow-horizontalLine)");

  // 创建一个圆点，用于拖拽十字交叉线
  const circle = crosshairGrp
    .append("circle")
    .attr("cx", X)
    .attr("cy", Y)
    .attr("r", config.crosshair.circle.r)
    .attr("fill", "transparent")
    .attr("stroke", "transparent")
    .attr("stroke-width", config.crosshair.strokeWidth)
    .attr("cursor", "move")
    .call(
      d3.drag<SVGCircleElement, unknown>().on("drag", function (event) {
        if (
          event.x >= offsetX &&
          event.x <= offsetX + cols * spaceX &&
          event.y >= offsetY &&
          event.y <= offsetY + rows * spaceY
        ) {
          commitCrosshairPosition({
            x: parseInt((event.x - offsetX) / spaceX),
            y: parseInt((event.y - offsetY) / spaceY)
          });
        }
      })
    );
  const r = 100;
  // 添加鼠标事件监听器
  svg.on("mousedown", (event: MouseEvent) => {
    if (!componentName && !showNavLine()) return;

    const horizontalLineY = horizontalLine.attr("y1");
    const verticalLineX = verticalLine.attr("x1");
    const dy = Math.abs(Number(horizontalLineY) - event.offsetY);
    const dx = Math.abs(Number(verticalLineX) - event.offsetX);
    if (dy < r) {
      event.stopPropagation();
      svg.on("mousemove", (event: MouseEvent) => {
        if (
          event.offsetY >= offsetY &&
          event.offsetY <= offsetY + rows * spaceY
        ) {
          // console.log(event.offsetY, offsetY, "----");
          commitCrosshairPosition({
            y: parseInt((event.offsetY - offsetY) / spaceY)
          });
        } else {
          svg.on("mousemove", null);
        }
      });
      svg.on("mouseup", () => {
        svg.on("mousemove", null);
      });
      svg.on("mouseout", () => {
        svg.on("mousemove", null);
      });
    }
    if (dx < r) {
      event.stopPropagation();
      svg.on("mousemove", (event: MouseEvent) => {
        if (
          event.offsetX >= offsetX &&
          event.offsetX <= offsetX + cols * spaceX
        ) {
          commitCrosshairPosition({
            x: parseInt((event.offsetX - offsetX) / spaceX)
          });
          svg.on("mouseup", () => {
            svg.on("mousemove", null);
          });
          svg.on("mouseout", () => {
            svg.on("mousemove", null);
          });
        }
      });
    }
  });
  const getXY = (x: number, y: number) => {
    const X = offsetX + x * spacing[0];
    const Y = offsetY + y * spacing[1];
    return { X, Y };
  };
  const moveCrosshair = (x: number, y: number) => {
    const { X, Y } = getXY(x, y);
    // 垂直线改变x坐标
    verticalLine.attr("x1", X).attr("x2", X);
    // 水平线改变y坐标
    horizontalLine.attr("y1", Y).attr("y2", Y);
    // 改变中心圆位置
    circle.attr("cx", X).attr("cy", Y);
  };
  const moveVerticalLine = (x: number) => {
    const { X, Y } = getXY(x, y);
    // 更新十字交叉线的位置
    circle.attr("cx", X);
    // 垂直线改变x坐标
    verticalLine.attr("x1", X).attr("x2", X);
  };
  const moveHorizontalLine = (y: number) => {
    const { X, Y } = getXY(x, y);
    // 水平线改变y坐标
    circle.attr("cy", Y);
    // 更新十字交叉线的位置
    horizontalLine.attr("y1", Y).attr("y2", Y);
  };
  return {
    moveCrosshair,
    moveVerticalLine,
    moveHorizontalLine
  };
};
