/* eslint-disable */
// @ts-nocheck
import * as d3 from "d3";
import { drawSelectedLine } from "./drawSelectedLine";

interface scannerProps {
  scanner: { value: SVGElement | null };
  width: number;
  height: number;
  spacingY?: number;
  n: number;
  selected: number;
  divideCol: number;
  cols: number;
  isStarScan: boolean;
  showBscanPosOnActiveLine: boolean;
  isCubeData?: boolean;
  updateSliceIndex?: (idx: number) => void;
}

export const scaleUnit = (scale: number) => (num: number) => num / scale;
export const drawLine = ({
  scanner,
  width,
  height,
  spacingY,
  n,
  selected,
  divideCol,
  cols,
  isStarScan,
  showBscanPosOnActiveLine,
  isCubeData,
  updateSliceIndex
}: scannerProps) => {
  const resizeScale = 0.04;
  const defaultColor = "rgba(255, 255, 255, 0.5)";
  const u = scaleUnit(resizeScale);
  const strokeWidth = u(1);

  const dashedLine = document.querySelector(".dashed-line");
  const dashedLineStyleAttr = dashedLine?.getAttribute("style");

  const svg = d3.select(scanner.value);
  svg.selectAll("g").remove();
  svg.selectAll("defs").remove();
  const marker = svg
    .append("defs")
    .append("marker")
    .attr("id", isStarScan ? "starArrow" : "arrow")
    .attr("markerWidth", u(6))
    .attr("markerHeight", u(6))
    .attr("refX", u(3) / 10)
    .attr("refY", u(3) / 10)
    .attr("orient", isStarScan ? "-90deg" : "0deg");
  marker
    .append("path")
    .attr("d", `M0,0 L0,${u(6) / 10} L${u(6) / 10},${u(3) / 10} z`)
    .attr("fill", "#00FF00");

  const lines = svg
    .selectAll<SVGGElement, number>("g")
    .data(d3.range(isStarScan ? n - 1 : n))
    .enter()
    .append("g")
    .style("transform-origin", "center");

  if (isCubeData) {
    // draw rect scan area for angio/cube scan
    svg
      .append("g")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("stroke", defaultColor)
      .attr("stroke-width", u(2))
      .attr("stroke-dasharray", `${u(6)} ${u(6)}`)
      .attr("fill", "transparent");
  }

  if (isStarScan) {
    // console.log("isStarScan", isStarScan);
    const angleInterval = 180 / (n - 1);
    lines.each(function (d, i) {
      const group = d3.select(this);
      // console.log({ selected, i, n });
      if (selected === i) {
        drawSelectedLine({
          group,
          width,
          strokeWidth,
          divideCol,
          cols,
          isStarScan,
          u,
          showBscanPosOnActiveLine
        });
      } else {
        group
          .attr("class", "line")
          .append("line")
          .attr("x1", width / 2)
          .attr("y1", 0)
          .attr("x2", width / 2)
          .attr("y2", width)
          .attr("stroke-width", strokeWidth)
          .attr("stroke", defaultColor)
          .attr("stroke-dasharray", `${width / 100},${width / 100 / 2}`)
          .attr("class", "dashed-line")
          .attr("style", dashedLineStyleAttr);
      }
    });

    // Rotate each line around its center
    lines.attr("transform", (d, i) => `rotate(${i * angleInterval})`);
  } else {
    const spacing = n === 1 ? 0 : height / (n - 1);
    lines.each(function (d, i) {
      const group = d3.select(this);
      if (i !== selected && n !== 1 && !isCubeData) {
        group
          .attr("class", "line")
          .append("line")
          .attr("x1", 0)
          .attr("y1", d => spacing * d)
          .attr("x2", width)
          .attr("y2", d => spacing * d)
          .attr("stroke-width", strokeWidth)
          .attr("stroke", defaultColor)
          .attr("stroke-dasharray", `${u(5)},${u(4)}`)
          .attr("class", "dashed-line")
          .attr("style", dashedLineStyleAttr);
        return;
      }
      if ((i === selected) | (n === 1)) {
        drawSelectedLine({
          isStarScan,
          group,
          spacing,
          width,
          divideCol,
          cols,
          strokeWidth,
          u,
          showBscanPosOnActiveLine
        });
      }
    });
  }

  // 体数据增加鼠标事件拖动监听
  isCubeData &&
    svg.on("mousedown", (event: MouseEvent) => {
      const r = 30;
      const { offsetY } = event;
      const horizontalLineY = svg
        .select(".active-line")
        .select("line")
        .attr("y1");
      const dy = Math.abs(Number(horizontalLineY) - offsetY) / spacingY;

      if (dy <= r) {
        event.stopPropagation();
        svg.on("mousemove", (event: MouseEvent) => {
          const { offsetY } = event;
          const idx = Math.floor(offsetY / spacingY);
          if (idx >= 0 && idx <= height) {
            updateSliceIndex(idx);
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
};
