import * as d3 from "d3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import { config } from "./config.yml";
import { ContainerNameEnum } from "@/enums";

type crosshairParamsType = {
  svgDom: SVGElement;
  direction: "slow" | "fast";
  rows: number;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  componentName?: ContainerNameEnum;
};

const crosshairClassName = "crosshair-path";

export const initCrossHair = ({
  svgDom,
  direction,
  rows,
  commitCrosshairPosition,
  componentName
}: crosshairParamsType) => {
  const width = Number(svgDom.getAttribute("width"));
  const height = Number(svgDom.getAttribute("height"));
  const initMiddlePointY: number = height * 0.5;
  const initMiddlePointX: number = width * 0.5;
  svgDom.style.zIndex = "10";
  const svg = d3.select(svgDom);
  const preCrosshairPath = document.querySelector(`.${crosshairClassName}`);
  let crosshairVisible =
    preCrosshairPath && preCrosshairPath.getAttribute("style");
  componentName === ContainerNameEnum.ManualFastBscan &&
    (crosshairVisible = "display: block");
  const crosshairGrp = svg
    .append("g")
    .attr("class", crosshairClassName)
    .attr("style", crosshairVisible);
  const verticalLine = crosshairGrp
    .append("line")
    .attr("x1", direction === "slow" ? initMiddlePointX : initMiddlePointY)
    .attr("y1", 0)
    .attr("x2", direction === "slow" ? initMiddlePointX : initMiddlePointY)
    .attr("y2", height)
    .attr(
      "stroke",
      direction === "slow"
        ? config.crosshair.verticalLine.stroke
        : config.crosshair.horizontalLine.stroke
    )
    .attr("stroke-width", config.crosshair.strokeWidth / 4)
    .style("pointer-events", "none");

  const r = 100;
  // 添加鼠标事件监听器
  svg.on("mousedown", (event: MouseEvent) => {
    const pathDom = document.querySelector(".crosshair-path");
    const crosshairStyle = pathDom
      ?.getAttribute("style")
      ?.indexOf("none") as number;
    const hideCrosshair =
      componentName !== ContainerNameEnum.ManualFastBscan &&
      crosshairStyle > -1;
    if (hideCrosshair) return;

    const { offsetX } = event;
    const verticalLineX = verticalLine.attr("x1");
    const dy = Math.abs(Number(verticalLineX) - offsetX);
    if (dy < r) {
      event.stopPropagation();
      svg.on("mousemove", (event: MouseEvent) => {
        const { offsetX } = event;
        if (offsetX >= 0 && offsetX <= width) {
          direction === "slow"
            ? commitCrosshairPosition({ x: parseInt((offsetX / width) * rows) })
            : commitCrosshairPosition({
                y: parseInt((offsetX / width) * rows)
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
  });

  const moveVerticalLine = (x: number) => {
    // 更新十字交叉线的位置
    verticalLine.attr("x1", (x / rows) * width).attr("x2", (x / rows) * width);
  };
  return {
    moveVerticalLine
  };
};
