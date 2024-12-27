/**
 * @function handleNodesBoundings 自动处理transform过后的多个节点集合，保证无论如何旋转,平移，缩放这些节点始终位于视野中心，并且占用的面积最小
 * @param nodes 经过 css matrix transform 后的节点集合
 * @param innerContainer 父节点
 * @returns 多个节点transform 后刚好能这些节点的最小矩形逻辑宽度和高度
 */

import { addResizeTarget } from "@/utils/autoResize";
import { addGroupResizeTarget } from "@/utils/autoResize/groupResize";
import { ContainerNameEnum } from "@/enums";

const initSvgSize = (
  svg: SVGElement,
  width: number,
  height: number,
  offsetX?: number,
  offsetY?: number
) => {
  const svgWidth = offsetX ? width + 2 * offsetX : width;
  const svgHeight = offsetY ? height + 2 * offsetY : height;
  if (offsetX && offsetY) {
    // 如果设置了偏移量，则将svg的宽高设置为auto，否则会导致svg的宽高被拉伸
    // 仅用于手动分层
    svg.style.width = "auto";
    svg.style.height = "auto";
    svg.style.left = -1 * offsetX + "px";
    svg.style.top = -1 * offsetY + "px";
  }
  svg.setAttribute("width", svgWidth + "");
  svg.setAttribute("height", svgHeight + "");
};
type TransformNode = HTMLCanvasElement | SVGElement;
export const handleNodesBoundings = (
  nodes: TransformNode[],
  innerContainer: HTMLDivElement,
  viewportDom: HTMLDivElement,
  componentName: ContainerNameEnum,
  captureKey?: string,
  offsetX?: number,
  offsetY?: number
): { innerWidth: number; innerHeight: number } => {
  const rect = getMinRect(nodes);

  // 得到实际父容器的左上角顶点坐标x,y
  const innerContainerRect = innerContainer.getBoundingClientRect();
  const { x, y } = innerContainerRect;

  /**
   * 重置所有子节点的position,让真实父节点innerContainer 和 最小逻辑父矩形的左上顶点重合
   * (保持真实父节点innerContainer不动，移动所有子节点，避免最外层viewport和innerContainer动态resize时，产生位置偏移)
   */
  // 得出真实父节点innerContainer 和 最小逻辑父矩形左上顶点的偏移量 dx,dy
  // 最小逻辑父矩形的位置;
  const { left, right, top, bottom } = rect;
  const dx = x - left;
  const dy = y - top;
  nodes.forEach(node => {
    node.style.left = dx + "px";
    node.style.top = dy + "px";
  });
  // 得出最小逻辑父矩形的宽度和高度;
  const innerWidth = right - left;
  const innerHeight = bottom - top;
  // 设置真实父节点 innerContainer 对宽高为最小逻辑父矩形对宽高
  innerContainer.style.width = innerWidth + "px";
  innerContainer.style.height = innerHeight + "px";
  // 统一坐标系宽高
  const svg = innerContainer.querySelector(".coordinates") as SVGElement;
  initSvgSize(svg, innerWidth, innerHeight, offsetX, offsetY);
  captureKey
    ? addGroupResizeTarget({
        viewportDom,
        innerContainerDom: innerContainer,
        innerWidth,
        innerHeight,
        componentName,
        captureKey
      })
    : addResizeTarget({
        viewportDom,
        innerContainerDom: innerContainer,
        innerWidth,
        innerHeight,
        componentName
      });
  // 返回 innerContainer的 宽和高，以便暴露给最外层父节点viewport 做autoResize
  return {
    innerWidth,
    innerHeight
  };

  /*******至此，真实父节点innerContainer 和 最小逻辑父矩形 已完全重合 ***********/
};
export const handleOctScopeBoundings = (
  nodes: TransformNode[],
  innerContainer: HTMLDivElement,
  viewportDom: HTMLDivElement,
  componentName: ContainerNameEnum,
  isMinArea?: boolean
): { innerWidth: number; innerHeight: number } => {
  const [firstNode] = nodes;
  const firstNodeRect = firstNode.getBoundingClientRect();

  // 得到实际父容器的左上角顶点坐标x,y
  const innerContainerRect = innerContainer.getBoundingClientRect();
  const { x, y } = innerContainerRect;

  /**
   * 重置所有子节点的position,让真实父节点innerContainer 和 最小逻辑父矩形的左上顶点重合
   * (保持真实父节点innerContainer不动，移动所有子节点，避免最外层viewport和innerContainer动态resize时，产生位置偏移)
   */

  // 统一坐标系宽高
  const svg = innerContainer.querySelector(".coordinates") as SVGElement;
  const {
    left: firstLeft,
    top: firstTop,
    width: innerWidth,
    height: innerHeight
  } = firstNodeRect;
  if (isMinArea) {
    const rect = getMinRect(nodes);
    const { left, right, top, bottom } = rect;
    svg.style.width = right - left + "px";
    svg.style.height = bottom - top + "px";
    svg.style.left = left - firstLeft + "px";
    svg.style.top = top - firstTop + "px";
    svg.setAttribute("width", right - left + "");
    svg.setAttribute("height", bottom - top + "");
  }
  const dx = x - firstLeft;
  const dy = y - firstTop;
  nodes.forEach(node => {
    node.style.left = dx + "px";
    node.style.top = dy + "px";
  });
  innerContainer.style.overflow = "hidden";
  // 设置真实父节点 innerContainer 对宽高为最小逻辑父矩形对宽高
  innerContainer.style.width = innerWidth + "px";
  innerContainer.style.height = innerHeight + "px";

  !isMinArea && initSvgSize(svg, innerWidth, innerHeight);
  addResizeTarget({
    viewportDom,
    innerContainerDom: innerContainer,
    innerWidth,
    innerHeight,
    componentName
  });
  // 返回 innerContainer的 宽和高，以便暴露给最外层父节点viewport 做autoResize
  return {
    innerWidth,
    innerHeight
  };

  /*******至此，真实父节点innerContainer 和 最小逻辑父矩形 已完全重合 ***********/
};

const getMinRect = (nodes: TransformNode[]) => {
  const [firstNode, ...extraNodes] = nodes;
  const firstNodeRect = firstNode.getBoundingClientRect();
  interface Rect {
    [key: string]: number;
  }

  const rect = extraNodes.reduce((acc: Rect, node: TransformNode) => {
    const currentRect = node.getBoundingClientRect();
    const { left, top, right, bottom } = currentRect;
    return {
      left: Math.min(left, acc.left),
      top: Math.min(top, acc.top),
      right: Math.max(right, acc.right),
      bottom: Math.max(bottom, acc.bottom)
    };
  }, firstNodeRect /**以第一个节点为计算起点 */);

  return rect;
};
