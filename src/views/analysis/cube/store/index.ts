import { defineStore } from "pinia";
import { store } from "@/store";
import {
  ContextmenuTypeEnum,
  ContainerNameEnum,
  AxisEnum,
  CSCAN_SURF_TYPE,
  AxisDirectionEnum
} from "@/enums";
import { CAPTURE_URL_PRE, CSCAN_SURFACE_LIST } from "@/utils/constant";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { PageRoute } from "@/utils/route";
import router from "@/router";
import { fetchPosteriorSurface } from "@/api/layer";
import {
  freeMemeory,
  fetchSurface,
  getSegmentPointsByIndex
} from "@/utils/tools/segmentation";
import { getBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";

export enum CSCAN_SELECTION_TYPE {
  Smart = "-2",
  Horizontal = "-1"
}

export type surfaceMatMap = {
  [key: string]: Mat[];
};

export interface CubeState {
  layerType: string;
  layerTypeName: string | undefined;
  bscanProcessorType: string;
  zoomTarget: null | HTMLElement;
  bscanZooming: boolean;
  slowBscanSmartBC: number;
  fastBscanSmartBC: number;
  octProcessorType: string;
  bscanSmooth: string;
  // 亮度对比度
  slowBscanBrightness: number;
  slowBscanContrast: number;
  fastBscanBrightness: number;
  fastBscanContrast: number;
  cscanBrightness: number;
  cscanContrast: number;
  showCScan: boolean;
  structTransparency: number;
  reset: boolean; // 是否需要重置
  screenshotTaking: boolean; // 是否正在截屏
  cscanSmartBC: number;
  // Surface
  surfaceLoading: boolean;
  surfShift: number; // 基于cscanSurf的位置偏移量。当surfType为1时偏移量从顶部开始计算。
  smartPosX?: number; // 计算smart surface的当前位置X(仅surfType为2时需要)。
  smartPosY?: number; // 计算smart surface的当前位置Y(仅surfType为2时需要)。
  smartSurface: string; // smart surface在拖动过程中会变化，为绘制smart曲线时的上表面surface的数值
  smartShift: number; // smart模式下，上下surface之间的距离
  dragSurfaceDistance: number;
  surfPointsArr: Point[][][]; // 分层线点集的数组
  surfaceMat: surfaceMatMap; // surface与mat映射
  currSurfPoints: Point[][]; // 当前拖动至位置的surface点集
  slowBscanZoomRatio: number;
  slowBscanZoomRulerHeight: number;
  slowBscanZoomRulerWidth: number;
  fastBscanZoomRatio: number;
  fastBscanZoomRulerHeight: number;
  fastBscanZoomRulerWidth: number;
  preSmartPosPoints: Point[][];
  dragAxis?: string; // 记录当前拖动的方向
  bellowSurfType: string;
  abovePercent: number;
}

export const useCubeStore = defineStore({
  id: "cube",
  state: (): CubeState => ({
    layerType: "-2",
    layerTypeName: "Smart",
    bscanProcessorType: ContextmenuTypeEnum.Gray,
    zoomTarget: null,
    bscanZooming: false,
    slowBscanSmartBC: 0,
    fastBscanSmartBC: 0,
    octProcessorType: ContextmenuTypeEnum.Gray,
    bscanSmooth: "", // TO-DO
    slowBscanBrightness: 0,
    slowBscanContrast: 0,
    fastBscanBrightness: 0,
    fastBscanContrast: 0,
    cscanBrightness: 0,
    cscanContrast: 0,
    showCScan: false,
    structTransparency: 4,
    reset: false,
    screenshotTaking: false,
    cscanSmartBC: 0,
    surfShift: 0,
    surfaceLoading: true,
    dragSurfaceDistance: 0,
    surfPointsArr: [],
    surfaceMat: {},
    smartPosX: undefined,
    smartPosY: undefined,
    smartSurface: "10",
    smartShift: 0,
    currSurfPoints: [],
    slowBscanZoomRatio: 50,
    slowBscanZoomRulerHeight: 20,
    slowBscanZoomRulerWidth: 20,
    fastBscanZoomRatio: 50,
    fastBscanZoomRulerHeight: 20,
    fastBscanZoomRulerWidth: 20,
    preSmartPosPoints: [],
    bellowSurfType: "8",
    abovePercent: 0
  }),
  getters: {
    isAsCube() {
      return router.currentRoute.value.path === PageRoute.AsCube;
    },
    isCubePage() {
      const { path } = router.currentRoute.value;
      return path === PageRoute.Cube || path === PageRoute.AsCube;
    },
    isSmart(state: CubeState) {
      return state.layerType === CSCAN_SELECTION_TYPE.Smart;
    },
    isHorizontal(state: CubeState) {
      return state.layerType === CSCAN_SELECTION_TYPE.Horizontal;
    },
    cscanSurfVal(state: CubeState) {
      return state.layerType === CSCAN_SELECTION_TYPE.Smart
        ? state.smartSurface
        : state.layerType === CSCAN_SELECTION_TYPE.Horizontal
        ? "0"
        : state.layerType;
    },
    surfShiftVal(state: CubeState) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return state.layerType === CSCAN_SELECTION_TYPE.Smart
        ? parseInt(state.smartShift / analysisCommonStore.spacingZ_um)
        : parseInt(
            (state.dragSurfaceDistance + state.surfShift) /
              analysisCommonStore.spacingZ_um
          ) +
            (state.layerType === CSCAN_SELECTION_TYPE.Horizontal
              ? parseInt(analysisCommonStore.dim_axial / 2)
              : 0);
    },
    surfTypeVal(state: CubeState) {
      return state.layerType === CSCAN_SELECTION_TYPE.Smart
        ? CSCAN_SURF_TYPE.Smart
        : state.layerType === CSCAN_SELECTION_TYPE.Horizontal
        ? CSCAN_SURF_TYPE.Horizontal
        : CSCAN_SURF_TYPE.Normal;
    },
    cscanRect: (state: CubeState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const isSmart = state.layerType === CSCAN_SELECTION_TYPE.Smart;
      const isHorizontal = state.layerType === CSCAN_SELECTION_TYPE.Horizontal;
      const surfShift = isSmart
        ? parseInt(state.smartShift / analysisCommonStore.spacingZ_um)
        : parseInt(
            (state.dragSurfaceDistance + state.surfShift) /
              analysisCommonStore.spacingZ_um
          ) + (isHorizontal ? parseInt(analysisCommonStore.dim_axial / 2) : 0);
      return {
        width: analysisCommonStore.dim_fast,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_enface,
        spacing: [
          analysisCommonStore.spacingX_um,
          analysisCommonStore.spacingY_um
        ],
        src: `${CAPTURE_URL_PRE}/oct/cscan?captureKey=${
          analysisCommonStore.captureKey
        }&cscanType=1&surfShift=${surfShift}&cscanSurf=${
          isSmart ? state.smartSurface : isHorizontal ? "0" : state.layerType
        }&surfType=${
          isSmart
            ? CSCAN_SURF_TYPE.Smart
            : isHorizontal
            ? CSCAN_SURF_TYPE.Horizontal
            : CSCAN_SURF_TYPE.Normal
        }&smartBC=${state.cscanSmartBC}${
          isSmart
            ? `&smartPosX=${
                state.smartPosX === undefined
                  ? analysisCommonStore.dim_slow / 2
                  : state.smartPosX
              }&smartPosY=${
                state.smartPosY === undefined
                  ? analysisCommonStore.dim_fast / 2
                  : state.smartPosY
              }`
            : ""
        }&timestamp=${analysisCommonStore.manualLayerTimestamp}`
      };
    },
    slowRect: (state: CubeState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.dim_axial,
        height: analysisCommonStore.dim_fast,
        transform: analysisCommonStore.xform_slow,
        src: `${CAPTURE_URL_PRE}/oct/bscan?captureKey=${
          analysisCommonStore.captureKey
        }&slice=${analysisCommonStore.y}&axis=${AxisEnum.SLOW}&smooth=${
          state.bscanSmooth
        }&encoder=${state.bscanZooming ? "png" : "jpg"}&quality=${
          state.bscanZooming ? 95 : 30
        }&smartBC=${state.slowBscanSmartBC}${
          router.currentRoute.value.path === PageRoute.AsCube
            ? "&corrected=0"
            : ""
        }`
      };
    },
    fastRect: (state: CubeState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.dim_axial,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_fast,
        src: `${CAPTURE_URL_PRE}/oct/bscan?captureKey=${
          analysisCommonStore.captureKey
        }&slice=${analysisCommonStore.x}&axis=${AxisEnum.FAST}&smooth=${
          state.bscanSmooth
        }&encoder=${state.bscanZooming ? "png" : "jpg"}&quality=${
          state.bscanZooming ? 95 : 30
        }&smartBC=${state.fastBscanSmartBC}${
          router.currentRoute.value.path === PageRoute.AsCube
            ? "&corrected=0"
            : ""
        }`
      };
    }
  },
  actions: {
    setZoomTarget(el: HTMLElement | null) {
      this.zoomTarget = el;
    },
    setbscanZooming(zooming: boolean) {
      this.bscanZooming = zooming;
    },
    cancelFullscreen() {
      this.zoomTarget?.classList.remove("full-screen");
      this.setbscanZooming(false);
    },
    dragFloorSurface(deltaY: number) {
      this.dragSurfaceDistance = deltaY;
    },
    commitCrosshairPosition({ x, y }: { x?: number; y?: number }) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      analysisCommonStore.x = x ?? analysisCommonStore.x;
      analysisCommonStore.y = y ?? analysisCommonStore.y;
      analysisCommonStore.syncSlowBscanIndex = analysisCommonStore.y;
      analysisCommonStore.syncFastBscanIndex = analysisCommonStore.x;
    },
    async bscanZoomRuler({
      innerContainerDom,
      componentName
    }: {
      innerContainerDom: HTMLElement;
      componentName: ContainerNameEnum;
    }) {
      const {
        width,
        height,
        value: scale
      } = await getBscanZoomRuler({
        innerContainerDom,
        aspectRatioFactor:
          router.currentRoute.value.path === PageRoute.AsCube ? 1 : 0.4
      });
      switch (componentName) {
        case ContainerNameEnum.CubeSlowBscan:
          this.slowBscanZoomRatio = scale ?? this.slowBscanZoomRatio;
          this.slowBscanZoomRulerHeight =
            height ?? this.slowBscanZoomRulerHeight;
          this.slowBscanZoomRulerWidth = width ?? this.slowBscanZoomRulerWidth;
          break;
        case ContainerNameEnum.CubeFastBscan:
          this.fastBscanZoomRatio = scale ?? this.fastBscanZoomRatio;
          this.fastBscanZoomRulerHeight =
            height ?? this.fastBscanZoomRulerHeight;
          this.fastBscanZoomRulerWidth = width ?? this.fastBscanZoomRulerWidth;
          break;
      }
    },
    setBrightnessContrast({
      cscanB,
      cscanC,
      slowBscanB,
      slowBscanC,
      fastBscanB,
      fastBscanC
    }: {
      cscanB?: number;
      cscanC?: number;
      slowBscanB?: number;
      slowBscanC?: number;
      fastBscanB?: number;
      fastBscanC?: number;
    }) {
      this.cscanBrightness = cscanB ?? this.cscanBrightness;
      this.cscanContrast = cscanC ?? this.cscanContrast;
      this.slowBscanBrightness = slowBscanB ?? this.slowBscanBrightness;
      this.slowBscanContrast = slowBscanC ?? this.slowBscanContrast;
      this.fastBscanBrightness = fastBscanB ?? this.fastBscanBrightness;
      this.fastBscanContrast = fastBscanC ?? this.fastBscanContrast;
    },
    async updateLayer({ floorShift }: { floorShift: number }) {
      this.surfShift = parseInt(floorShift);
    },
    // surface 获取
    async getSurface() {
      this.surfaceLoading = true;
      freeMemeory(); // 请求之前需要预清除上次mat缓存
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey, dim_slow: col, dim_fast: row } = analysisCommonStore;
      const { layerType } = this;

      const commonParams = {
        captureKey,
        col,
        row
      };
      const result = await fetchSurface({
        ...commonParams,
        surf: this.isSmart ? "10" : this.isHorizontal ? "0" : layerType,
        fetchSurfaceApi: fetchPosteriorSurface
      });
      const { data } = result;
      window.floorSurfMat = data;
      this.surfaceLoading = false;
    },
    async clearSurfaceMat() {
      for (const key in this.surfaceMat) {
        if (!this.surfaceMat[key]) return;
        if (this.surfaceMat[key][0]) {
          !this.surfaceMat[key][0].isDeleted() &&
            (await this.surfaceMat[key][0].delete());
          this.surfaceMat[key][0] = null;
        }
        if (this.surfaceMat[key][1]) {
          !this.surfaceMat[key][1].isDeleted() &&
            (await this.surfaceMat[key][1].delete());
          this.surfaceMat[key][1] = null;
        }
      }
    },
    setCurrSurfMat() {
      const layer = this.isSmart || this.isHorizontal ? "10" : this.layerType;
      window.floorSurfMat = toRaw(this.surfaceMat[layer]);
    },
    setCurrSurfPoints() {
      const layer =
        this.isSmart || this.isHorizontal ? 10 : Number(this.layerType);
      this.currSurfPoints = this.surfPointsArr[layer];
    },
    // 获取所有分层mat，并存储在map中
    async getAllSurfaces() {
      await this.clearSurfaceMat();
      this.surfaceLoading = true;
      try {
        const analysisCommonStore = useAnalysisCommonStoreHook();
        const {
          captureKey,
          dim_slow: col,
          dim_fast: row
        } = analysisCommonStore;
        const surfaceList = [
          ...CSCAN_SURFACE_LIST.slice(2),
          {
            value: "12",
            labelKey: "analysis.bottom" // 底层
          }
        ];
        const commonParams = {
          captureKey,
          col,
          row
        };
        const fetches = surfaceList.map(({ value }) =>
          fetchSurface({
            ...commonParams,
            surf: value,
            fetchSurfaceApi: fetchPosteriorSurface
          })
        );

        const results = await Promise.all(fetches);
        results.forEach(({ surf, data }) => {
          this.surfaceMat[surf as string] = data;
          this.getSurfPoints(Number(surf), data);
        });
        this.setCurrSurfMat();
        this.setCurrSurfPoints();
        this.surfaceLoading = false;
      } catch (err) {
        this.surfaceLoading = false;
        console.error(err);
      }
    },
    getSurfPoints(surf: number, surfMat: Mat[][]) {
      this.surfPointsArr[surf] = new Array(2);
      this.getSlowSurfPoints(surf, surfMat);
      this.getFastSurfPoints(surf, surfMat);
      // 初始化顶层点集
      this.surfPointsArr[0] = new Array(2);
      this.surfPointsArr[0][0] = this.surfPointsArr[1][0].map((d: Point) => ({
        x: d.x,
        y: 0
      }));
      this.surfPointsArr[0][1] = this.surfPointsArr[1][1].map((d: Point) => ({
        x: d.x,
        y: 0
      }));
    },
    getSlowSurfPoints(surf: number, surfMat: Mat[][]) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const slowSurfPoints = getSegmentPointsByIndex(
        analysisCommonStore.y,
        surfMat[0],
        analysisCommonStore.dim_axial,
        analysisCommonStore.dim_fast,
        AxisDirectionEnum.SLOW,
        this.isHorizontal
      );
      this.surfPointsArr[surf][0] = slowSurfPoints;
    },
    getFastSurfPoints(surf: number, surfMat: Mat[][]) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const fastSurfPoints = getSegmentPointsByIndex(
        analysisCommonStore.x,
        surfMat[1],
        analysisCommonStore.dim_axial,
        analysisCommonStore.dim_slow,
        AxisDirectionEnum.FAST,
        this.isHorizontal
      );
      this.surfPointsArr[surf][1] = fastSurfPoints;
    },
    // surface 获取
    updateSmartBC({
      imageType,
      smartBC
    }: {
      imageType: string;
      smartBC: number;
    }) {
      switch (imageType) {
        case ContainerNameEnum.CubeSlowBscan:
          this.slowBscanSmartBC = smartBC;
          break;
        case ContainerNameEnum.CubeFastBscan:
          this.fastBscanSmartBC = smartBC;
          break;
        case ContainerNameEnum.CubeCscan:
          this.cscanSmartBC = smartBC;
          break;
        default:
          throw new Error(`No such image type: ${imageType}`);
      }
    }
  }
});

export function useCubeStoreHook() {
  return useCubeStore(store);
}
