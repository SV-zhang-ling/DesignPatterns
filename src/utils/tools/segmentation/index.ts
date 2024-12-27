/* eslint-disable */
// @ts-nocheck
import * as d3 from "d3";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { useAdvancedSegStoreHook } from "@/views/analysis/posterior/advancedSeg/store/advancedSeg";
import { PageRoute } from "@/utils/route";
import { BaseParamsType, SurfaceParamsType, ListResult } from "@/api/types.d";
import { CaptureDetailWithKey } from "@/views/analysis/store/analysisMultipleCommon";
import { useStructuralProjStoreHook } from "@/views/analysis/structuralProj/store";
import { useCubeStoreHook } from "@/views/analysis/cube/store";
import { AxisDirectionEnum } from "@/enums";
import { clone } from "xe-utils";

export interface LayerType {
  ceilingShift: number;
  ceilingSurf: string;
  floorShift: number;
  floorSurf: string;
}
interface LayersResType {
  [key: string]: LayerType;
}
export interface SurfaceMatParamsType extends SurfaceParamsType {
  col: number;
  row: number;
  surfType?: string;
  isDewarp?: number;
  mask?: number;
  fetchSurfaceApi?: (params: SurfaceParamsType) => Promise<unknown>;
}
export interface SurfaceMatResType {
  surfType: string;
  data: [Mat, Mat];
  surf?: string;
  captureKey: string;
}
export interface Point {
  x: number;
  y: number;
}
export interface DrawerParamsType {
  svgDom: SVGElement;
  points: Point[];
  mouseUp?: (distance: number) => void;
  surfaceDirection?: "ceil" | "floor";
  direction?: AxisDirectionEnum.FAST | AxisDirectionEnum.SLOW;
}

const showLayerOnBscan = () => {
  const layerOnBscanControl = document.querySelector(".layer-on-bscan-item");
  return (
    !layerOnBscanControl ||
    layerOnBscanControl?.classList.contains("layer-on-bscan")
  );
};

export const freeMemeory = () => {
  if (!window.ceilingSurfMat || !window.floorSurfMat) return;
  [...window.ceilingSurfMat, ...window.floorSurfMat].forEach(mat => {
    if (mat && !mat.isDeleted()) {
      mat.delete();
    }
  });
  window.ceilingSurfMat = [null, null];
  window.floorSurfMat = [null, null];
};
export const freeMultipleMemeory = (
  list: CaptureDetailMap<CaptureDetailWithKey>
) => {
  for (const key in list) {
    if (window[key]) {
      [...window[key].ceilingSurfMat, ...window[key].floorSurfMat].forEach(
        mat => {
          if (mat && !mat.isDeleted()) {
            mat.delete();
          }
        }
      );
      window[key] = {
        ceilingSurfMat: [null, null],
        floorSurfMat: [null, null]
      };
    }
  }
};
export const fetchLayers = async (
  { captureKey }: BaseParamsType,
  fetchApi: (params: BaseParamsType) => void
) => {
  const res = await fetchApi({ captureKey });
  if (!res) return res;
  const { data } = <ListResult<SurfaceInfoType>>res;
  return data;
};
export const fetchSurface = async ({
  captureKey,
  surf,
  surfType,
  col,
  row,
  isDewarp,
  mask,
  fetchSurfaceApi
}: SurfaceMatParamsType): Promise<SurfaceMatResType> => {
  const buffer = (await fetchSurfaceApi({
    captureKey,
    surf,
    isDewarp,
    mask
  })) as SharedArrayBuffer;
  const data = new Float32Array(buffer);
  const segmentation = cv.matFromArray(col, row, cv.CV_32F, data);
  const transposedSegmentation = segmentation.t();
  return surfType
    ? {
        surfType,
        captureKey,
        data: [segmentation, transposedSegmentation]
      }
    : {
        captureKey,
        surf,
        data: [segmentation, transposedSegmentation]
      };
};
export const getSegmentPointsByIndex = (
  index: number,
  segmentation: Mat,
  cols: number,
  rows: number,
  direction?: "fast" | "slow",
  isHorizontal?: boolean
): Point[] => {
  if (!segmentation) return;
  const rowData = segmentation.row(index);
  const bscanDom = d3.select("canvas.bscan");
  const points = rowData.data32F.reduce(
    (acc: Point[], cur: number, index: number) => {
      return [
        ...acc,
        {
          x: index / rows,
          y: isHorizontal
            ? (Number(bscanDom.attr("width")) * 0.5) / cols
            : direction === "fast"
            ? rowData.data32F[rowData.data32F.length - 1 - index] / cols
            : cur / cols
        }
      ];
    },
    []
  );
  rowData.delete();
  return points;
};
const pathClassName = "segmentation-path";
export const drawLayer = ({
  svgDom,
  ceilingSurfPoints,
  floorSurfPoints,
  cols,
  rows,
  direction,
  item
}: {}) => {
  const svg = d3.select(svgDom);
  svg.selectAll(`.${pathClassName}`).remove();
  const translateCeilSurface =
    ceilingSurfPoints &&
    pureDrawFn({
      svgDom,
      points: ceilingSurfPoints,
      surfaceDirection: "ceil",
      cols,
      rows,
      direction,
      item
    });
  const translatefloorSurface =
    floorSurfPoints &&
    pureDrawFn({
      svgDom,
      points: floorSurfPoints,
      surfaceDirection: "floor",
      cols,
      rows,
      direction,
      item
    });
  return {
    translateCeilSurface,
    translatefloorSurface
  };
};
export const pureDrawFn = ({
  svgDom,
  points,
  surfaceDirection,
  cols,
  rows,
  direction,
  item
}: DrawerParamsType): void => {
  if (!svgDom) return;
  const width = Number(svgDom.getAttribute("width"));
  const height = Number(svgDom.getAttribute("height"));
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const angioStore = useAngioStoreHook();
  const advancedSegStore = useAdvancedSegStoreHook();
  const structuralProjStore = useStructuralProjStoreHook();
  const cubeStore = useCubeStoreHook();
  const pathname = window.location.pathname;
  let currStore;
  switch (pathname) {
    case PageRoute.Angiography:
    case PageRoute.AngioRetinaEnhanced:
      currStore = angioStore;
      break;
    case PageRoute.MultipleAngio:
      currStore = item;
      break;
    case PageRoute.StructuralProjection:
      currStore = structuralProjStore;
      break;
    case PageRoute.Cube:
      currStore = cubeStore;
      break;
    default:
      currStore = advancedSegStore;
  }

  const svg = d3.select(svgDom);
  const axis = direction === AxisDirectionEnum.SLOW ? 0 : 1;
  // 创建曲线函数
  const curve = d3
    .line()
    .x(function (d) {
      return d.x * width;
    })
    .y(function (d) {
      return surfaceDirection === "ceil"
        ? d.y * height + currStore.ceilingShift
        : d.y * height +
            (currStore.isCubePage ? currStore.surfShift : currStore.floorShift);
    })
    .curve(d3.curveBasis);

  // 根据当前位置的点集，计算得出Smart模式下当前位置的实际点集
  const getSmartPoints = (deltaY, isNavChange = false) => {
    let pos = axis === 0 ? currStore.smartPosX : currStore.smartPosY;
    if (pos === undefined) {
      pos =
        axis === 0
          ? analysisCommonStore.dim_fast / 2
          : analysisCommonStore.dim_slow / 2;
    }
    const prePointY = currStore.currSurfPoints[axis][pos].y;
    const newPointY = prePointY + deltaY / height;
    const { surfPointsArr } = currStore;

    if (direction !== currStore.dragAxis || isNavChange) {
      // 更新的Surface不是当前拖动的方向
      const { smartSurface, bellowSurfType, abovePercent } = currStore;
      let aboveSurfPoints = surfPointsArr[smartSurface][axis];
      const bellowSurfPoints = surfPointsArr[bellowSurfType][axis];
      return aboveSurfPoints.map((d, index) => ({
        x: d.x,
        y:
          aboveSurfPoints[index].y * (1 - abovePercent) +
          bellowSurfPoints[index].y * abovePercent
      }));
    }

    const surfTypes = [0, 1, 2, 3, 5, 8, 10, 9, 12];
    let bellowSurf, aboveSurf, aboveSurfType, bellowSurfType;
    for (let i = 0; i < surfTypes.length; i++) {
      bellowSurfType = surfTypes[i];
      const bellowSurfPoints = toRaw(surfPointsArr[bellowSurfType][axis]);
      if (bellowSurfPoints[pos].y >= newPointY && i > 0) {
        // 找到下方距离最近的surface
        bellowSurf = bellowSurfPoints; // 相邻的下层surface
        aboveSurfType = surfTypes[i - 1];
        aboveSurf = toRaw(surfPointsArr[aboveSurfType][axis]); // 相邻的上层surface
        break;
      }
    }
    if (!bellowSurf || !aboveSurf) return;

    if (aboveSurfType !== currStore.smartSurface) {
      // 保存当前位置所处的上下表面surface type
      currStore.smartSurface = aboveSurfType;
      currStore.bellowSurfType = bellowSurfType;
    }
    const dis = bellowSurf[pos].y - aboveSurf[pos].y;
    const aboveDis = newPointY - aboveSurf[pos].y;
    const abovePercent = aboveDis / dis;
    const bellowPercent = 1 - abovePercent;
    currStore.abovePercent = abovePercent;

    // 保存上下Surface之间的距离
    const smartShift = aboveDis * height;
    smartShift >= 0 && (currStore.smartShift = smartShift);

    // 计算真正渲染的点集
    return aboveSurf.map((d, index) => ({
      x: d.x,
      y: aboveSurf[index].y * bellowPercent + bellowSurf[index].y * abovePercent
    }));
  };

  // 创建路径元素并应用曲线函数
  if (
    pathname.indexOf(PageRoute.Angiography) !== -1 ||
    pathname === PageRoute.StructuralProjection ||
    pathname === PageRoute.AsStructuralProj ||
    pathname === PageRoute.Cube
  ) {
    const lineGrp = svg
      .append("g")
      .attr("class", pathClassName)
      .attr("style", `display: ${showLayerOnBscan() ? "block" : "none"}`);

    const smartPoints = currStore.isSmart && getSmartPoints(0, true);
    const path = lineGrp
      .append("path")
      .attr("class", "move-line")
      .attr("d", curve(currStore.isSmart ? smartPoints : points))
      .attr("stroke", "transparent")
      .attr("stroke-width", 35)
      .attr("fill", "none")
      .attr("cursor", "grabbing");

    const surfaceLine = lineGrp
      .append("path")
      .attr("class", "surface-line")
      .attr("d", curve(currStore.isSmart ? smartPoints : points))
      .attr("stroke", "#00FFFF")
      .attr("stroke-width", 10)
      .attr("fill", "none");
    if (
      [
        PageRoute.Angiography,
        PageRoute.AngioRetinaEnhanced,
        PageRoute.StructuralProjection,
        PageRoute.Cube
      ].includes(pathname)
    ) {
      path.call(
        d3
          .drag()
          .on(
            "start",
            function (event) {
              // 阻止事件冒泡
              path.classed("dragging", true);
            },
            false
          )
          .on(
            "drag",
            function (event) {
              const { y, subject } = event;
              /**
               * 取消使用d3.js 原生提供的event.dx参数，因为在曲线drag运动中，
               * 会丢失部分运动帧，导致dx*n < x - subject.x的情况，
               * 出现停止下来的点永远小于dragEnd记录的终止点，也就是会出现拖拽视觉结束点
               * 总滞后于实际停止点的问题
               */
              const deltaY = y - subject.y;
              surfaceDirection === "ceil"
                ? currStore.dragCeilSurface(deltaY)
                : currStore.dragFloorSurface(deltaY);

              if (currStore.isSmart) {
                currStore.dragAxis = direction;
                const startPos = parseInt((subject.x / width) * rows);
                if (axis === 0) {
                  currStore.smartPosX = startPos;
                  currStore.smartPosY = analysisCommonStore.y;
                } else {
                  currStore.smartPosX = analysisCommonStore.x;
                  currStore.smartPosY = startPos;
                }
              }
            },
            false
          )
          .on(
            "end",
            function (event) {
              const { y, subject } = event;
              const distance = y - subject.y;
              const {
                ceilingSurf,
                ceilingShift,
                floorSurf,
                floorShift,
                surfShift
              } = currStore;

              if (currStore.isCubePage) {
                currStore.dragFloorSurface(0);

                // Smart模式下保存最后停止时的Surface
                currStore.isSmart &&
                  (currStore.currSurfPoints = clone(
                    currStore.preSmartPosPoints,
                    true
                  ));
              }

              surfaceDirection === "ceil"
                ? currStore.updateLayer({
                    ceilingSurf,
                    ceilingShift: ceilingShift + distance,
                    floorSurf,
                    floorShift
                  })
                : currStore.updateLayer({
                    ceilingSurf,
                    ceilingShift,
                    floorSurf,
                    floorShift: currStore.isSmart
                      ? 0
                      : (floorShift ?? surfShift) + distance
                  });
            },
            false
          )
      );
    }

    const translateSurface = (deltaY: number) => {
      // 永远保持初始点集不被修改，基于初始点击重新map
      let newPoints;
      if (pathname === PageRoute.Cube && currStore.isSmart) {
        newPoints = getSmartPoints(deltaY);
        // 暂存中间结果
        currStore.preSmartPosPoints[axis] = newPoints;
      } else {
        newPoints = points.map(d => ({
          x: d.x,
          y: d.y + deltaY / height
        }));
      }

      // 增加超出图像范围后不可再拖动
      if (newPoints) {
        const axisY = newPoints.map(d => d.y);
        const minY = Math.min(...axisY),
          maxY = Math.max(...axisY);
        if (minY >= 1 || maxY <= 0) return;

        path.attr("d", curve(newPoints));
        surfaceLine.attr("d", curve(newPoints));
      }
    };

    return translateSurface;
  } else {
    // 高级分割页面
    const lineGrp = svg
      .append("g")
      .attr("class", pathClassName)
      .attr("style", `display: ${showLayerOnBscan() ? "block" : "none"}`);
    const path = lineGrp
      .append("path")
      .attr("class", "move-line")
      .attr("d", curve(points))
      .attr("stroke", "transparent")
      .attr("stroke-width", 35)
      .attr("fill", "none")
      .attr("cursor", "grabbing");
    const surfaceLine = lineGrp
      .append("path")
      .attr("class", "surface-line")
      .attr("d", curve(points))
      .attr("stroke", "#00FFFF")
      .attr("stroke-width", 3)
      .attr("fill", "none");
    const translateSurface = deltaY => {
      // 永远保持初始点集不被修改，基于初始点击重新map
      // let newPoints = points.map(d => ({ x: d.x, y: d.y + deltaY }));
      // path.attr("d", curve(newPoints));
      // surfaceLine.attr("d", curve(newPoints));
    };
    return translateSurface;
  }
};
