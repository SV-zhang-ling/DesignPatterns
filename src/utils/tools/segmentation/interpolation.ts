/* eslint-disable */
// @ts-nocheck
import { createInterpolatorWithFallback } from "commons-math-interpolation";
import { getCommonSettings } from "./drawAllFastSeg";
import { clearAnchorDom } from "./manualLayer";
import { orderBy } from "xe-utils";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers.ts";

// 计算插值点附近影响的像素数量
const getBuffer_pxl = spacing_um => {
  let buffer_um = 200.0;
  return spacing_um > 0 ? buffer_um / spacing_um : 10;
};
// 创建InterpMask
const createInterpMask = (anchors, cols, buffer_pxl) => {
  const mask = new Array(cols).fill(0);
  if (anchors.length == 0) {
    return cv.matFromArray(1, cols, cv.CV_8U, mask);
  }
  const fillMask = (left, right, val) => {
    for (let i = left; i < right; ++i) {
      if (i < 0 || i >= cols) continue;
      if (anchors.includes(i)) continue;
      mask[i] = val;
    }
  };
  let flavor = 2;
  // when there are <=2 anchors between [0, cols),
  // a linear interpolation is desired than akima.
  // Ref: https://github.com/SVisions/Product/issues/4742
  let insideAnchorNum = 0;
  for (let i = 0; i < anchors.length; i++) {
    if (anchors[i] >= 0 && anchors[i] < cols) {
      insideAnchorNum++;
      if (insideAnchorNum > 2) {
        break;
      }
    }
  }
  if (insideAnchorNum <= 2) {
    flavor = 1;
  }
  const first_pxl = anchors[0];
  const last_pxl = anchors[anchors.length - 1];
  fillMask(first_pxl - buffer_pxl, first_pxl, 1);
  fillMask(first_pxl + 1, last_pxl, flavor);
  fillMask(last_pxl + 1, last_pxl + buffer_pxl, 1);
  return cv.matFromArray(1, cols, cv.CV_8U, mask);
};

// 修改分层点

window.anchors = [];
window.originSlab = [];
window.surfData = [];
export let leftOutsidePoint = {};
export let rightOutsidePoint = {};

// 插值计算
const interpolate = (input, mask) => {
  if (mask.rows != 1 || input.cols !== mask.cols) {
    console.warn("interpolate: input error!");
    return input;
  }
  const leftAnchorNum = leftOutsidePoint.x ? 1 : 0;
  const rightAnchorNum = rightOutsidePoint.x ? 1 : 0;
  let resampled = input.clone();
  const cols = input.cols;
  const totalValidPoints =
    mask.total() - cv.countNonZero(mask) + leftAnchorNum + rightAnchorNum;
  let x = new cv.Mat(1, totalValidPoints, cv.CV_32FC1);
  let y = new cv.Mat(input.rows, totalValidPoints, cv.CV_32FC1);
  let counter = 0;
  if (leftAnchorNum) {
    x.data32F[counter] = leftOutsidePoint.x;
    y.data32F[counter] = leftOutsidePoint.y;
    counter++;
  }
  for (let i = 0; i < cols; ++i) {
    if (mask.data[i] === 0) {
      x.data32F[counter] = i;
      y.data32F[counter] = input.data32F[i];
      counter++;
    }
  }
  if (rightAnchorNum) {
    x.data32F[counter] = rightOutsidePoint.x;
    y.data32F[counter] = rightOutsidePoint.y;
  }
  const resampleOne = r => {
    const s = createInterpolatorWithFallback(
      "akima",
      x.data32F,
      y.row(r).data32F
    );
    const sL = createInterpolatorWithFallback(
      "linear",
      x.data32F,
      y.row(r).data32F
    );
    for (let col = 0; col < cols; ++col) {
      if (mask.data[col] === 1) {
        resampled.data32F[r * cols + col] = sL(col);
      } else if (mask.data[col] === 2) {
        let temp = s(col);
        if (temp > 1e5) {
          temp = sL(col);
        }
        resampled.data32F[r * cols + col] = temp;
      }
    }
  };
  for (let row = 0; row < input.rows; ++row) {
    resampleOne(row);
  }
  x.delete();
  y.delete();
  input.delete();
  return resampled;
};
const noRpeatCheck = (anchors, index) => {
  // 删除锚点的同时，清除anhcors 队列记录
  if (index !== -1) {
    clearAnchorDom(anchors[index].id);
    anchors.splice(index, 1);
  }
};
let surface;

export const modifyInterpolation = ({
  id,
  action,
  x,
  y,
  maxY,
  lastX,
  lastY,
  index,
  segmentation,
  rows,
  cols
}) => {
  if (!id) return;
  const anchorPositionMap = {
    top: (x, y) => 0 <= x && x < rows && y < 0,
    right: (x, y) => x >= rows,
    bottom: (x, y) => 0 <= x && x < rows && y >= cols,
    left: (x, y) => x < 0,
    center: (x, y) => x >= 0 && x < rows && y >= 0 && y < cols
  };
  // 如果在内部inner的时候，如果新点同x轴上，则删除老的锚点，具体的值需要DX<spacingX

  const repeatAnchorIndex = anchors.findIndex(item => item.id === id);
  if (action === "delete") {
    anchors.splice(repeatAnchorIndex, 1);
    // 如果删除的是左右两侧锚点，则置空leftOutsidePoint和rightOutsidePoint
    if (anchorPositionMap["left"](x, y)) {
      leftOutsidePoint = {};
    } else if (anchorPositionMap["right"](x, y)) {
      rightOutsidePoint = {};
    }
  } else {
    /**
     * 插值预处理
     * 1.数组去重，如果id相同认为是在移动锚点，则替换
     * 2.id不同则认为是插入一个新锚点,此时分为三种情况，左侧，内部，和右侧
     * 2.1.如果位于左右两侧，则需要替换锚点，并删除dom
     * 2.2.如果位于内部，则直接新增锚点
     * 3.得到最新的锚点集合后，升序重拍数组，并重新插值
     */

    x = Math.round(x);
    if (repeatAnchorIndex !== -1) {
      // 数组去重
      // 如果id相同认为是在移动锚点，则替换x,y,id不变
      anchors[repeatAnchorIndex].x = x;
      anchors[repeatAnchorIndex].y = y;
      anchors[repeatAnchorIndex].latestHandling = true;
    } else {
      // 2.id不同则认为是插入一个新锚点
      anchors.push({ x, y, id, latestHandling: true });
    }
    // 记录外侧锚点,如果发现锚点位于外侧，直接替换锚点
    // 处理上下左右测的锚点，保证每侧最多只能有一个锚点，需要优先判断锚点的位置
    /**
     * 1.如果左侧锚点数 = 2，则保留左侧latestHandling = true的锚点
     * 2.如果右侧锚点数 = 2，则保留右侧latestHandling = true的锚点
     * 3.如果正上方锚点数 = 2，则保留正上方latestHandling = true的锚点
     * 4.如果正下方锚点数 = 2，则保留正下方latestHandling = true的锚点
     * 5.如果上下左右都没有锚点，则不处理
     *
     * 最后统一设置锚点 latestHandling 属性 为false
     * 目前冗余的分支代码很多，待测试完备后，再抽离
     *
     */
    for (let key in anchorPositionMap) {
      const fn = anchorPositionMap[key];
      if (key === "left") {
        const group = anchors.filter(anchor => fn(anchor.x, anchor.y));
        if (group.length === 0) {
          leftOutsidePoint = {};
        } else if (group.length === 1) {
          leftOutsidePoint = group[0];
        } else if (group.length === 2) {
          const oldAnchor = group.find(item => !item.latestHandling);
          const oldAnchorIndex = anchors.findIndex(
            item => item.id === oldAnchor.id
          );
          noRpeatCheck(anchors, oldAnchorIndex);
          leftOutsidePoint = { x, y, id };
        }
      } else if (key === "right") {
        const group = anchors.filter(anchor => fn(anchor.x, anchor.y));
        if (group.length === 0) {
          rightOutsidePoint = {};
        } else if (group.length === 1) {
          rightOutsidePoint = group[0];
        } else if (group.length === 2) {
          const oldAnchor = group.find(item => !item.latestHandling);
          const oldAnchorIndex = anchors.findIndex(
            item => item.id === oldAnchor.id
          );
          noRpeatCheck(anchors, oldAnchorIndex);
          rightOutsidePoint = { x, y, id };
        }
      } else if (key === "top") {
        const group = anchors.filter(anchor => fn(anchor.x, anchor.y));
        if (group.length === 2) {
          const oldAnchor = group.find(item => !item.latestHandling);
          const oldAnchorIndex = anchors.findIndex(
            item => item.id === oldAnchor.id
          );
          noRpeatCheck(anchors, oldAnchorIndex);
        }
      } else if (key === "bottom") {
        const group = anchors.filter(anchor => fn(anchor.x, anchor.y));
        if (group.length === 2) {
          const oldAnchor = group.find(item => !item.latestHandling);
          const oldAnchorIndex = anchors.findIndex(
            item => item.id === oldAnchor.id
          );
          noRpeatCheck(anchors, oldAnchorIndex);
        }
      } else if (key === "center") {
        const isCenter = fn(x, y);
        if (isCenter) {
          const tolerance = 4;
          // 使用 splice 删除 x轴距离小于 tolerance 的点
          for (let i = 0; i < anchors.length; i++) {
            const distance = Math.abs(anchors[i].x - x);
            if (distance <= tolerance && anchors[i].latestHandling === false) {
              noRpeatCheck(anchors, i);
              i--; // 删除后，索引位置需要调整
            }
          }
        }
      }
    }
  }
  surface = segmentation.row(index);
  if (originSlab.length == 0) {
    originSlab = surface.clone().data32F;
  }
  let slab = originSlab.slice();
  anchors = orderBy(anchors, "x");
  for (let i = 0; i < anchors.length; i++) {
    anchors[i].latestHandling = false;
    slab[anchors[i].x] = anchors[i].y;
  }
  /**插值代码*/
  const { spacingX_um } = getCommonSettings();
  let buffer_pxl = Math.floor(getBuffer_pxl(spacingX_um));
  const anchorsXArray = anchors.map(item => item.x);
  let mask = createInterpMask(anchorsXArray, surface.cols, buffer_pxl);

  let input = cv.matFromArray(1, surface.cols, cv.CV_32FC1, slab);
  let mat = interpolate(input, mask);
  // 上下边缘检测
  for (let i = 0; i < mat.cols; i++) {
    const temp = mat.data32F[i];
    if (temp < 0) {
      mat.data32F[i] = 0;
    } else if (temp > maxY) {
      mat.data32F[i] = maxY;
    }
  }
  mat.copyTo(segmentation.row(index));
  surfData = Array.from(mat.data32F);
  mat.delete();
  mask.delete();
  surface.delete();
  const { updateAnchors } = useEditLayersStoreHook();
  updateAnchors(window.anchors);
};
