/* eslint-disable */
// @ts-nocheck

export const drawSelectedLine = ({
  isStarScan,
  group,
  spacing,
  width,
  strokeWidth,
  divideCol,
  cols,
  u,
  showBscanPosOnActiveLine
}) => {
  // console.log("dividePointX", divideCol, cols, width);
  const dividePointX = Math.max(0, Math.min(width, (divideCol / cols) * width));
  const reverseDividePointX = width - dividePointX;
  let interactR = u(2);
  let referenceRulerWith = u(2);
  const activeLineColor = "#00FF00";
  const referenceRulerColor = "#FF00FF";

  if (!showBscanPosOnActiveLine) {
    const activeLine = group
      .attr("class", "active-line")
      .append("line")
      .attr("stroke", activeLineColor)
      .attr("stroke-width", strokeWidth);
    if (isStarScan) {
      activeLine
        .attr("marker-start", "url(#starArrow)")
        .attr("x1", width / 2)
        .attr("y1", 0)
        .attr("x2", width / 2)
        .attr("y2", width - u(6));
    } else {
      activeLine
        .attr("marker-end", "url(#arrow)")
        .attr("x1", 0)
        .attr("y1", d => spacing * d)
        .attr("x2", width - u(6))
        .attr("y2", d => spacing * d);
    }
    return;
  }

  const firstLine = group
    .attr("class", "active-line")
    .append("line")
    .attr("stroke", activeLineColor)
    .attr("stroke-width", strokeWidth);
  if (isStarScan) {
    firstLine
      .attr("marker-start", "url(#starArrow)")
      .attr("x1", width / 2)
      .attr("y1", 0)
      .attr("x2", width / 2)
      .attr("y2", reverseDividePointX - interactR);
  } else {
    firstLine
      .attr("x1", 0)
      .attr("y1", d => spacing * d)
      .attr("x2", dividePointX - interactR)
      .attr("y2", d => spacing * d);
  }

  const secondLine = group
    .append("line")
    .attr("stroke", activeLineColor)
    .attr("stroke-width", strokeWidth);

  if (isStarScan) {
    secondLine
      .attr("x1", width / 2)
      .attr("y1", reverseDividePointX + interactR + referenceRulerWith)
      .attr("x2", width / 2)
      .attr("y2", width);
    //  .attr("y2", width - u(6));
  } else {
    secondLine
      .attr("marker-end", "url(#arrow)")
      .attr("x1", dividePointX + interactR + referenceRulerWith)
      .attr("y1", d => spacing * d)
      .attr("x2", width - u(6))
      .attr("y2", d => spacing * d);
  }

  const referenceRulerGroup = group
    .append("g")
    .attr("class", "bscan-pos")
    .attr("style", "display: block");
  if (isStarScan) {
    referenceRulerGroup
      .attr("x", width / 2)
      .attr("y", reverseDividePointX - u(3));
    referenceRulerGroup
      .append("rect")
      .attr("x", width / 2 - interactR - u(5))
      .attr("y", reverseDividePointX - interactR)
      .attr("width", 2 * interactR + u(1))
      .attr("height", 2 * 2 * interactR + u(1))
      .attr("fill", "transparent");
    referenceRulerGroup
      .append("rect")
      .attr("x", width / 2 - interactR - u(5))
      .attr("y", reverseDividePointX)
      .attr("width", u(5))
      .attr("height", u(1))
      .attr("fill", referenceRulerColor);

    referenceRulerGroup
      .append("rect")
      .attr("x", width / 2 + interactR + u(1))
      .attr("y", reverseDividePointX)
      .attr("width", u(5))
      .attr("height", u(1))
      .attr("fill", referenceRulerColor);
  } else {
    referenceRulerGroup
      .attr("x", dividePointX)
      .attr("y", d => spacing * d - u(3));
    // .call(
    //   d3.drag().on("drag", function (event) {
    //     const x = Math.max(0, Math.min(width, event.x));
    //     // console.log(parseInt((x / width) * 2048), "ruler");
    //     d3.select(this).attr(
    //       "transform",
    //       `translate(${x - dividePointX}, 0)`
    //     );
    //     group.selectAll("line").each(function (d, i) {
    //       const line = d3.select(this);
    //       if (i === 0) {
    //         if (x - interactR > 0) {
    //           d3.select(this).attr("x2", x - interactR);
    //         } else {
    //           // 左侧边界处理
    //           d3.select(this).attr("x2", 0);
    //         }
    //       } else {
    //         if (x + interactR + referenceRulerWith < width) {
    //           // 右侧边界处理
    //           d3.select(this).attr("x1", x + interactR + referenceRulerWith);
    //         }
    //       }
    //     });
    //   })
    // );
    referenceRulerGroup
      .append("rect")
      .attr("x", dividePointX - interactR)
      .attr("y", d => spacing * d - interactR - u(5))
      .attr("width", 2 * interactR + u(1))
      .attr("height", 2 * 2 * interactR + u(1))
      .attr("fill", "transparent");
    referenceRulerGroup
      .append("rect")
      .attr("x", dividePointX)
      .attr("y", d => spacing * d - interactR - u(5))
      .attr("width", u(1))
      .attr("height", u(5))
      .attr("fill", referenceRulerColor);

    referenceRulerGroup
      .append("rect")
      .attr("x", dividePointX)
      .attr("y", d => spacing * d + interactR + u(1))
      .attr("width", u(1))
      .attr("height", u(5))
      .attr("fill", referenceRulerColor);
  }
};
