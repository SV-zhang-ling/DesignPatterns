/* eslint-disable */
// @ts-nocheck

export const drawSelectedLine = ({
  isStarScan,
  group,
  spacing,
  width,
  strokeWidth,
  u,
  arrowId
}) => {
  const activeLineColor = "#00FF00";

  const activeLine = group
    .attr("class", "active-line")
    .append("line")
    .attr("stroke", activeLineColor)
    .attr("stroke-width", strokeWidth);
  if (isStarScan) {
    activeLine
      .attr("marker-start", `url(#${arrowId})`)
      .attr("x1", width / 2)
      .attr("y1", 0)
      .attr("x2", width / 2)
      .attr("y2", width - u(6));
  } else {
    activeLine
      .attr("marker-end", `url(#${arrowId})`)
      .attr("x1", 0)
      .attr("y1", d => spacing * d)
      .attr("x2", width - u(6))
      .attr("y2", d => spacing * d);
  }
};
