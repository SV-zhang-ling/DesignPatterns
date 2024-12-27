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
  isStarScan: boolean;
  isCubeData?: boolean;
}

export const scaleUnit = (scale: number) => (num: number) => num / scale;
export const drawLine = ({
  scanner,
  width,
  height,
  n,
  selected,
  isStarScan,
  isCubeData
}: scannerProps) => {
  const resizeScale = 0.04;
  const defaultColor = "rgba(255, 255, 255, 0.5)";
  const u = scaleUnit(resizeScale);
  const strokeWidth = u(2);

  const dashedLine = document.querySelector(".dashed-line");
  const dashedLineStyleAttr = dashedLine?.getAttribute("style");

  const svg = d3.select(scanner.value);
  svg.selectAll("g").remove();
  svg.selectAll("defs").remove();
  const arrowId = isStarScan ? "arrow-star" : "arrow";
  const marker = svg
    .append("defs")
    .append("marker")
    .attr("id", arrowId)
    .attr("markerWidth", u(6))
    .attr("markerHeight", u(6))
    .attr("refX", u(5) / 10)
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
      .attr("stroke-width", strokeWidth)
      .attr("stroke-dasharray", `${u(6)} ${u(6)}`)
      .attr("fill", "transparent");
  }

  if (isStarScan) {
    const angleInterval = 180 / (n - 1);
    lines.each(function (d, i) {
      const group = d3.select(this);
      if (selected === i) {
        drawSelectedLine({
          group,
          width,
          strokeWidth,
          isStarScan,
          u,
          arrowId
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
          strokeWidth,
          u,
          arrowId
        });
      }
    });
  }
};
