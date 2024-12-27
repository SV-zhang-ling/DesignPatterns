/* eslint-disable */
// @ts-nocheck
import * as d3 from "d3";
import { fetchSurface } from "./index";
import { PosteriorSurfaceEnum } from "@/utils/constant";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import {
  drawAllFastPosteriorSurface,
  getSurfaceList,
  getCommonSettings,
  D3Svg,
  DrawerParamsType,
  segClassName,
  mask
} from "./drawAllFastSeg";
import { modifyInterpolation } from "./interpolation";
import {
  submitSurface,
  resetSurface as resetSurfaceApi,
  editPosteriorSurface,
  fetchPosteriorSurface,
  fetchAnteriorSurface,
  editAnteriorSurface,
  fetchAnteriorSurfaceMask
} from "@/api/layer";
import { v4 as uuidv4 } from "uuid";
import { ManualLayerToolEnum } from "@/enums";
import { useManualLayerToolStoreHook } from "@/views/analysis/components/layers/store/manualLayerTool";
import { asSlowPureDrawFn, clearBorderLine } from "./asManualSurface";

// 默认的画笔颜色为30%的白色,避免过分遮挡底图
export const defaultStrikeColor = "rgba(255, 255, 255, 0.4)";
export const selectedStrikeColor = "#00FFFF";
export const referenceStrikeColor = "#FFFFFF";

type surfaceMatMap = {
  [key: string]: Mat[];
};

export const offsetX = 10000,
  offsetY = 10000;
export const surfaceMat: surfaceMatMap = {};

export const clearSurfaceMat = async () => {
  for (const key in surfaceMat) {
    if (!surfaceMat[key]) return;
    if (surfaceMat[key][0]) {
      !surfaceMat[key][0].isDeleted() && (await surfaceMat[key][0].delete());
      surfaceMat[key][0] = null;
    }
    if (surfaceMat[key][1]) {
      !surfaceMat[key][1].isDeleted() && (await surfaceMat[key][1].delete());
      surfaceMat[key][1] = null;
    }
  }
};
export const isEditStatus = () => {
  const manualLayerToolStore = useManualLayerToolStoreHook();
  return manualLayerToolStore.activeType === ManualLayerToolEnum.Edit;
};

let svg: D3Svg;
const className = `anchor`;
let radius;

const drawCircle = ({ svg, id, point, translate, color = "#00FFFF" }) => {
  const group = svg
    .append<SVGGElement>("g")
    .attr("class", className)
    .attr("id", id)
    .attr("transform", `translate(${translate.x}, ${translate.y})`);

  group
    .append<SVGCircleElement>("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", radius)
    .attr("fill", "black")
    .attr("stroke", "black");
  group
    .append<SVGCircleElement>("circle")
    .attr("class", "inner-circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", radius - 10)
    .attr("fill", color);
  group.raise();
  activeAnchorId = id;
  return group;
};
// 识别虚拟 RPEBM层并转换为BM层
export const matchSurface = (surface: string) => {
  return !isAnterior && surface === PosteriorSurfaceEnum.RPEBM
    ? PosteriorSurfaceEnum.BM
    : surface;
};
export const showSlowEditLine = () => {
  if (!svg) return;
  const { editSurface, refSurface, showEditLine } = useEditLayersStoreHook();
  svg
    .selectAll(`.${segClassName(refSurface)}`)
    .style("display", showEditLine ? "block" : "none");

  if (!isAnterior && editSurface === PosteriorSurfaceEnum.RPEBM) {
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.RPE)}`)
      .style("display", showEditLine ? "block" : "none");
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.BM)}`)
      .style("display", showEditLine ? "block" : "none");
  } else {
    svg
      .selectAll(`.${segClassName(editSurface)}`)
      .style("display", showEditLine ? "block" : "none");
  }
  svg
    .selectAll(".anchor")
    .style("display", showEditLine ? "block" : "none")
    .raise();
};
export const setSlowShowLines = () => {
  if (!svg) return;

  const { showAllLines } = useEditLayersStoreHook();
  const surfaceList = getSurfaceList();
  surfaceList.forEach(({ value }) => {
    svg
      .selectAll(`.${segClassName(value)}`)
      .style("display", showAllLines ? "block" : "none");
  });
  showSlowEditLine();
};
export const setSlowRefHighlight = () => {
  if (!svg) return;
  setSlowShowLines();
  const { editSurface, refSurface } = useEditLayersStoreHook();
  svg.selectAll("path").attr("stroke", defaultStrikeColor);
  svg
    .selectAll(`.${segClassName(refSurface)}`)
    .attr("stroke", referenceStrikeColor)
    .raise();

  if (!isAnterior && editSurface === PosteriorSurfaceEnum.RPEBM) {
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.RPE)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.BM)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
  } else {
    svg
      .selectAll(`.${segClassName(editSurface)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
  }
};

const drawCircleWithCross = ({
  svg,
  id,
  x,
  y,
  X,
  Y,
  width,
  height,
  cols,
  rows,
  index
}) => {
  let lastX = null,
    lastY = null;
  X = Math.round(X);
  // 绘制完成单点后，所有的锚点都提升到最上面
  svg
    .selectAll(".anchor")
    .each(function () {
      const group = d3.select(this);
      setAnchorActive(group, false);
    })
    .raise();
  const newGroup = drawCircle({
    svg,
    id,
    point: { x: X, y: Y },
    translate: { x, y },
    color: "#FFFFFF"
  });
  newGroup.on("dblclick", () => {
    deleteAnchor();
  });
};

export const fetchAllSurface = async () => {
  // 每次重新fetch分层线之前，要清除之前积压的mat内存
  clearSurfaceMat();
  const { captureKey, dim_slow, dim_fast } = getCommonSettings();
  const commonParams = {
    captureKey,
    col: dim_slow,
    row: dim_fast
  };
  const surfaceList = getSurfaceList(isAnterior);
  const fetches = surfaceList.map(({ value }) =>
    fetchSurface({
      ...commonParams,
      surf: value,
      mask: isAnterior ? 0 : undefined,
      fetchSurfaceApi: isAnterior ? fetchAnteriorSurface : fetchPosteriorSurface
    })
  );

  const results = await Promise.all(fetches);
  results.forEach(({ surf, data }) => {
    surfaceMat[surf as string] = data;
  });
};
export const drawAllSlowPosteriorSurface = () => {
  if (!svg) return;
  const { dim_fast, dim_axial } = getCommonSettings();
  const editLayersStore = useEditLayersStoreHook();
  const { y, editSurface, refSurface } = editLayersStore;
  const rows = dim_fast;
  const cols = dim_axial;
  svg.selectAll("path").remove();
  clearBorderLine(svg);

  const surfaceList = getSurfaceList();
  surfaceList.forEach(({ value }) => {
    drawSlowSegmentation({
      index: y,
      cols,
      rows,
      selectedKey: value,
      strikeColor: defaultStrikeColor
    });
  });

  svg
    .selectAll(`.${segClassName(refSurface)}`)
    .attr("stroke", referenceStrikeColor)
    .raise();
  if (!isAnterior && editSurface === PosteriorSurfaceEnum.RPEBM) {
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.RPE)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
    svg
      .select(`.${segClassName(PosteriorSurfaceEnum.BM)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
  } else {
    svg
      .selectAll(`.${segClassName(editSurface)}`)
      .attr("stroke", selectedStrikeColor)
      .raise();
  }

  setSlowShowLines();
  showSlowEditLine();
};
const getSegmentPointsByIndex = (
  index: number,
  segmentation: Mat,
  cols: number,
  rows: number
): Point[] => {
  if (!segmentation || segmentation.isDeleted()) return [];
  const rowData = segmentation.row(index);
  const points = rowData.data32F.reduce(
    (acc: Point[], cur: number, index: number) => {
      return [
        ...acc,
        {
          x: index / rows,
          y: cur / cols
        }
      ];
    },
    []
  );
  rowData.delete();
  return points;
};

export const drawX = x => {
  if (!svg) return;
  const svgDom: SVGElement | null = svg.node();
  const width = Number(svgDom.getAttribute("width")) - 2 * offsetX;
  return x * width + offsetX;
};

export const getRealX = x => {
  if (!svg) return;
  const svgDom: SVGElement | null = svg.node();
  const width = Number(svgDom.getAttribute("width")) - 2 * offsetX;
  return (x - offsetX) / width;
};

export const drawY = y => {
  if (!svg) return;
  const svgDom: SVGElement | null = svg.node();
  const height = Number(svgDom.getAttribute("height")) - 2 * offsetY;
  return y * height + offsetY;
};

// 创建曲线函数;
export const getCurveFunc = () => {
  if (!svg) return;

  return d3
    .line()
    .x(d => drawX(d.x))
    .y(d => drawY(d.y))
    .curve(d3.curveBasis);
};

export const pureDrawFn = ({
  points,
  selectedKey,
  strikeColor = defaultStrikeColor
}: DrawerParamsType): void => {
  const svgDom: SVGElement | null = svg.node();
  if (!svgDom || points.length === 0) return;
  const className = segClassName(selectedKey);
  svg.selectAll(`.${className}`).remove();

  const curve = getCurveFunc();
  svg
    .append("path")
    .attr("class", className)
    .attr("d", curve(points))
    .attr("stroke", strikeColor)
    .attr("stroke-width", 10)
    .attr("fill", "none");
};
export interface DrawerType {
  index: number;
  selectedKey: string;
  cols?: number;
  rows?: number;
  direction?: "fast" | "slow";
  svg?: D3Svg;
}
export const drawSlowSegmentation = ({
  index,
  selectedKey,
  cols,
  rows,
  strikeColor
}: DrawerType) => {
  // 如果高亮的分层是rpem层，则选用BM层的mat数据
  const matchedKey = matchSurface(selectedKey);
  const segmentations = surfaceMat[matchedKey];
  if (!segmentations || !segmentations.length) return;

  const [slowSeg] = segmentations;
  const segmentation = slowSeg;
  const points = getSegmentPointsByIndex(index, segmentation, cols, rows);
  if (!isAnterior) {
    pureDrawFn({
      points,
      selectedKey,
      strikeColor
    });
    return;
  }
  mask.as &&
    asSlowPureDrawFn({
      svg,
      cols,
      rows,
      points,
      maskSeg: mask.as.dim_slow[index],
      selectedKey,
      strikeColor
    });
};

export const modifySegmentation = ({
  id,
  svg,
  action,
  x,
  y,
  lastX,
  lastY,
  cols,
  rows,
  index
}) => {
  const maxY = cols;
  const editLayersStore = useEditLayersStoreHook();
  const { editSurface: selectedKey } = editLayersStore;
  // 修改分层只修改slow方向
  // 如果选中rpebm层，则修改BM层数据
  const matchedKey = matchSurface(selectedKey);
  const segmentation: Mat = surfaceMat[matchedKey][0];
  if (!isAnterior && selectedKey === PosteriorSurfaceEnum.RPEBM) {
    let rpeSlowMat = surfaceMat[PosteriorSurfaceEnum.RPE][0];
    console.log(rpeSlowMat === segmentation, "rpeSlowMat === segmentation");
    if (rpeSlowMat !== segmentation) {
      // 如果RPE层不等于BM层，说明给RPEM层第一次添加锚点，此时在重新赋值前需要清除游离的RPE mat分层，避免内存泄漏
      !rpeSlowMat.isDeleted() && rpeSlowMat.delete();
    }
    surfaceMat[PosteriorSurfaceEnum.RPE][0] = segmentation;
    // 无需担心下一次的rpe层赋值的问题，因为切换层后，必定会重新刷新分层mat数据
  }
  modifyInterpolation({
    id,
    action,
    svg,
    x,
    y,
    maxY,
    lastX,
    lastY,
    index,
    segmentation,
    cols,
    rows
  });

  if (!isAnterior && selectedKey === PosteriorSurfaceEnum.RPEBM) {
    const rpePath = svg.select(`.${segClassName(PosteriorSurfaceEnum.RPE)}`);
    const bmPath = svg.select(`.${segClassName(PosteriorSurfaceEnum.BM)}`);
    rpePath.remove();
    bmPath.remove();
    // 修改后重绘 分层线
    drawSlowSegmentation({
      index,
      selectedKey: PosteriorSurfaceEnum.RPE,
      cols,
      rows,
      strikeColor: selectedStrikeColor
    });
    drawSlowSegmentation({
      index,
      selectedKey: PosteriorSurfaceEnum.BM,
      cols,
      rows,
      strikeColor: selectedStrikeColor
    });
  } else {
    svg.selectAll(`.${segClassName(selectedKey)}`).remove();
    clearBorderLine(svg);
    // 修改后重绘 分层线
    drawSlowSegmentation({
      index,
      selectedKey,
      cols,
      rows,
      strikeColor: selectedStrikeColor
    });
  }

  setSlowShowLines();
  showSlowEditLine();
};

const drawAllSegmentation = () => {
  drawAllSlowPosteriorSurface(); // { fetch: true }
};
export const resetAnchors = () => {
  window.anchors = [];
  const { updateAnchors } = useEditLayersStoreHook();
  updateAnchors([]);
  window.originSlab = [];
  window.surfData = [];
  const anchorDoms = svg.selectAll(".anchor");
  anchorDoms.remove();
};
export const refreshSurface = async () => {
  const editLayersStore = useEditLayersStoreHook();
  editLayersStore.setDialogLoading(true);
  if (isAnterior) {
    editLayersStore.maskLoading = true;
    const { captureKey } = getCommonSettings();
    const res = await fetchAnteriorSurfaceMask({ captureKey });
    mask.as = res.data;
    editLayersStore.maskLoading = false;
  }
  await pullSurface();
  drawAllSlowPosteriorSurface();
  drawAllFastPosteriorSurface();
  editLayersStore.setDialogLoading(false);
};
export const pullSurface = async () => {
  await fetchAllSurface();
};
export const resetSurface = async () => {
  const editLayersStore = useEditLayersStoreHook();
  editLayersStore.setDialogLoading(true);
  const { captureKey } = getCommonSettings();
  await resetSurfaceApi({ captureKey });
  editLayersStore.isAsBorderEdit = false;
  resetAnchors();
  editLayersStore.updateStashTimestamp();
  await refreshSurface();
  editLayersStore.setLastManualOperationType("reset");
  editLayersStore.setHasSavedCount();
  editLayersStore.setDialogLoading(false);
};
export const saveSurface = async () => {
  const editLayersStore = useEditLayersStoreHook();
  editLayersStore.setDialogLoading(true);
  await stashFetch();
  const { captureKey } = getCommonSettings();
  await submitSurface({
    captureKey,
    cancelEdit: 0
  });
  resetAnchors();
  editLayersStore.isAsBorderEdit = false;
  await refreshSurface();
  editLayersStore.setLastManualOperationType("save");
  editLayersStore.setHasSavedCount();
  editLayersStore.setDialogLoading(false);
};
export const cancelSaveSurface = async ({
  fresh = true
}: {
  fresh?: boolean;
}) => {
  const editLayersStore = useEditLayersStoreHook();
  // 只要取消了暂存，就设置分层线为已保存状态
  editLayersStore.setDialogLoading(true);
  const { captureKey } = getCommonSettings();
  await submitSurface({
    captureKey,
    cancelEdit: 1
  });
  resetAnchors();
  editLayersStore.isAsBorderEdit = false;
  editLayersStore.updateStashTimestamp();
  editLayersStore.setLastManualOperationType("cancel");
  if (!fresh) {
    editLayersStore.setDialogLoading(false);
    return;
  }
  await refreshSurface();
  editLayersStore.setDialogLoading(false);
};
export const stashFetch = async () => {
  const { captureKey } = getCommonSettings();
  const editLayersStore = useEditLayersStoreHook();
  const { editSurface, y: slice } = editLayersStore;
  let { anchors, surfData } = window;

  let anchorData: number[][] = anchors.map(anchor => [anchor.x, anchor.y]);
  if (!isAnterior && editSurface === PosteriorSurfaceEnum.RPEBM) {
    const surfs = [PosteriorSurfaceEnum.RPE, PosteriorSurfaceEnum.BM];
    for (let i = 0; i < surfs.length; i++) {
      const params = {
        captureKey,
        surf: surfs[i],
        slice,
        surfData: Array.from(surfData),
        anchorData
      };
      await editPosteriorSurface(params);
    }
  } else {
    const params = {
      captureKey,
      surf: editSurface,
      slice,
      surfData: Array.from(surfData),
      anchorData,
      maskData: isAnterior ? mask.as.dim_slow[slice][editSurface] : undefined
    };
    const editSurfaceApi = isAnterior
      ? editAnteriorSurface
      : editPosteriorSurface;
    await editSurfaceApi(params);
  }
  resetAnchors();
  editLayersStore.isAsBorderEdit = false;
  editLayersStore.updateStashTimestamp();
};

export const stashEditSurface = async () => {
  const editLayersStore = useEditLayersStoreHook();
  editLayersStore.setDialogLoading(true);
  if (window.anchors.length === 0 && !editLayersStore.isAsBorderEdit) {
    editLayersStore.setDialogLoading(false);
    return;
  }

  editLayersStore.setLastManualOperationType("stash");
  await stashFetch();
  await refreshSurface();
  editLayersStore.setDialogLoading(false);
};
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}
export const clearAnchorDom = id => {
  svg.select(`#${id}`).remove();
};

let activeAnchorId = null;
export const setAnchorActive = (selector, isActive) => {
  const group =
    typeof selector === "string" ? svg.select(`#${selector}`) : selector;
  const fill = isActive ? "#FFFFFF" : "#00FFFF";
  const innerCircle = group.select(".inner-circle");
  innerCircle.attr("fill", fill);
  if (isActive) {
    if (typeof selector === "string") {
      activeAnchorId = selector;
    } else {
      activeAnchorId = selector.attr("id");
    }
  }
};

let isAnterior: boolean;
/**
 * 初始化分割功能
 *
 * @param svgDom SVG DOM 元素
 * @returns 无返回值
 */
export const initSegmentation = (
  svgDom: SVGElement,
  cols: number,
  rows: number,
  isAS?: boolean
) => {
  isAnterior = isAS;
  svg = d3.select<SVGElement, unknown>(svgDom);
  const { dim_slow, dim_fast, dim_axial } = getCommonSettings();
  // 按尺寸进行锚点大小适配
  radius =
    dim_fast > 1500
      ? 60
      : dim_fast > 1200
      ? 50
      : dim_fast > 800
      ? 30
      : isAnterior
      ? 60
      : 35;
  const editLayersStore = useEditLayersStoreHook();
  const { editSurface } = editLayersStore;
  // window.surfData = 123;

  const width = Number(svgDom.getAttribute("width")) - 2 * offsetX;
  const height = Number(svgDom.getAttribute("height")) - 2 * offsetY;
  // 1. 初始化渲染分层线
  drawAllSegmentation();
  // 只有slow-bscan生效
  let draggable = false;
  let hasPressed = false;
  svg.on("mousedown", (event: MouseEvent) => {
    if (!isEditStatus()) return;
    if (!editLayersStore.showEditLine) return;
    if (event.button === 2) {
      console.log("Right mouse button clicked");
      stashEditSurface();
      return;
    }
    if (event.button !== 0) return;
    hasPressed = true;
    const id = `anchor-${uuidv4()}`;
    let mousedownEvent = event;
    // 2.手动调整分层逻辑

    // 找到在指定半径内的点
    let minDistance = Infinity; // 初始化为正无穷大
    let closetAnchor = null; // 初始化为null或undefined，取决于你的代码环境
    let latestAnchorIndex = -1;
    for (let i = 0; i < anchors.length; i++) {
      const anchor = anchors[i];
      const realX = anchor.x * (width / rows) + offsetX;
      const realY = anchor.y * (height / cols) + offsetY;
      // 计算两点之间的距离的函数
      const delta = distance(
        realX,
        realY,
        mousedownEvent.offsetX,
        mousedownEvent.offsetY
      );

      // 更新最小距离和对应的锚点
      if (delta < minDistance) {
        minDistance = delta;
        latestAnchorIndex = i;
      }
    }

    // 检查最小距离是否小于或等于radius
    if (minDistance <= radius + 20) {
      closetAnchor = anchors[latestAnchorIndex];
      console.log("找到锚点", { closetAnchor, minDistance, radius });
      // 在这里可以执行其他需要的操作，因为我们已经知道closetAnchor是距离最小的且满足条件的锚点
    } else {
      // 如果没有找到满足条件的锚点，可以在这里处理
      console.log("没有找到距离小于或等于radius的锚点");
    }
    if (closetAnchor) {
      // console.log("找到锚点", closetAnchor);
      const { x, y, id } = closetAnchor;
      svg.selectAll(".anchor").each(function () {
        const group = d3.select(this);
        setAnchorActive(group, false);
      });
      const activeAnchor = svg.select(`#${id}`);
      setAnchorActive(id, true);
      svg.on("mousemove", e => {
        if (!isEditStatus()) return;
        if (event.button === 2) {
          console.log("Right mouse button clicked");
          return;
        }
        draggable = true;
        activeAnchor.attr("transform", `translate(${e.offsetX},${e.offsetY})`);
      });
    }
    svg.on("mouseup", event => {
      console.log("mouseup::", event);
      if (!isEditStatus()) return;
      svg.on("mousemove", null);
      if (event.button === 2) {
        console.log("Right mouse button clicked");
        return;
      }
      if (event.button !== 0) return;
      if (!hasPressed) return;
      const { y: index } = editLayersStore;
      const X = (event.offsetX - offsetX) / (width / rows);
      const Y = (event.offsetY - offsetY) / (height / cols);
      if (closetAnchor && !draggable) return;
      if (closetAnchor && draggable) {
        // const delta = distance(
        //   mousedownEvent.offsetX,
        //   mousedownEvent.offsetY,
        //   event.offsetX,
        //   event.offsetY
        // );
        modifySegmentation({
          id: closetAnchor.id,
          x: X,
          y: Y,
          lastX: null,
          lastY: null,
          index,
          selectedKey: editLayersStore.editSurface,
          cols,
          rows,
          svg
        });
        svg.selectAll(".anchor").raise();
      }
      if (!closetAnchor) {
        // 新建anchor
        modifySegmentation({
          id: id,
          x: X,
          y: Y,
          lastX: null,
          lastY: null,
          index,
          selectedKey: editSurface,
          cols,
          rows,
          svg
        });
        svg.selectAll(".anchor").raise();
        drawCircleWithCross({
          id,
          svg,
          x: event.offsetX,
          y: event.offsetY,
          X,
          Y,
          width,
          height,
          cols,
          rows,
          index
        });
      }
      draggable = false;
      hasPressed = false;
    });
  });
};
export const deleteAnchor = () => {
  if (!isEditStatus()) return;
  const editLayersStore = useEditLayersStoreHook();
  if (!editLayersStore.showEditLine) return;
  const svgDom: SVGElement | null = svg.node();
  if (!svgDom) return;
  if (window.anchors.length === 0) return;
  const { dim_fast: rows, dim_axial: cols } = getCommonSettings();
  const { editSurface, y: index } = editLayersStore;
  clearAnchorDom(activeAnchorId);
  modifySegmentation({
    id: activeAnchorId,
    action: "delete",
    index,
    selectedKey: editSurface,
    cols,
    rows,
    svg
  });
  svg.selectAll(".anchor").raise();
  if (anchors.length) {
    activeAnchorId = anchors[anchors.length - 1].id;
    setAnchorActive(activeAnchorId, true);
  }
};
