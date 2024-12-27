import * as d3 from "d3";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import { config } from "./config.yml";

import { PageRoute } from "@/utils/route";
import router from "@/router";
import { useImageActionStoreHook } from "@/views/analysis/components/store/imageAction";

type crosshairParamsType = {
  svgDom: SVGElement;
  width: number;
  height: number;
  cols: number;
  defaultShowNav?: boolean;
  referenceActivePos: number;
  setReferencePos: (pos: number) => void;
};

const crosshairClassName = "crosshair-path";
const strokeWidth = 10;
export const initCrossHair = ({
  svgDom,
  width,
  height,
  cols,
  referenceActivePos,
  setReferencePos
}: crosshairParamsType) => {
  const initMiddlePointX: number = Math.floor(
    (referenceActivePos / cols) * width
  ); // width * 0.5;

  const svg = d3.select(svgDom);
  const preCrosshairPath = document.querySelector(
    `.${crosshairClassName}`
  ) as HTMLElement;
  // default hide the navigation line
  let crosshairVisible = preCrosshairPath
    ? preCrosshairPath.getAttribute("style")
    : "display: none";

  if (router.currentRoute.value.path === PageRoute.MultipleLineScan) {
    const imageActionStore = useImageActionStoreHook();
    crosshairVisible = imageActionStore.navigationLine
      ? "display: block"
      : "display: none";
  }
  const crosshairGrp = svg
    .append("g")
    .attr("class", crosshairClassName)
    .attr("style", crosshairVisible);

  const horizontalLine = crosshairGrp
    .append("line")
    .attr("x1", initMiddlePointX)
    .attr("y1", 0)
    .attr("x2", initMiddlePointX)
    .attr("y2", height)
    .attr("stroke", config.crosshair.verticalLine.stroke)
    .attr("stroke-width", strokeWidth)
    .style("pointer-events", "none");

  const r = 100;
  // 添加鼠标事件监听器
  svg.on("mousedown", (event: MouseEvent) => {
    const pathDom = document.querySelector(".crosshair-path");
    const crosshairStyle = pathDom
      ?.getAttribute("style")
      ?.indexOf("none") as number;
    const hideCrosshair = crosshairStyle > -1;
    if (hideCrosshair) return;

    const { offsetX } = event;
    const horizontalLineX = horizontalLine.attr("x1");
    const dx = Math.abs(Number(horizontalLineX) - offsetX);
    if (dx < r) {
      event.stopPropagation();
      svg.on("mousemove", (event: MouseEvent) => {
        const { offsetX } = event;
        if (offsetX >= 0 && offsetX < width) {
          // console.log("offsetX", offsetX, parseInt((offsetX / width) * cols));
          const pos = parseInt((offsetX / width) * cols);
          setReferencePos(pos);
          // moveHorizontalLine(offsetX);
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
    const X = x * (width / cols);
    horizontalLine.attr("x1", X).attr("x2", X);
  };
  return moveVerticalLine;
};
