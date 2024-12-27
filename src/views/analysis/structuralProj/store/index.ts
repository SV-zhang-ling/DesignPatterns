import { defineStore } from "pinia";
import { store } from "@/store";
import {
  ProjectTypeEnum,
  ContextmenuTypeEnum,
  ContainerNameEnum,
  AxisEnum
} from "@/enums";
import { CAPTURE_URL_PRE } from "@/utils/constant";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import { buildQueryString } from "@/utils";
import { ListResult } from "@/api/types.d";
import {
  updatePosteriorOctLayer,
  resetPosteriorOctLayer,
  fetchPosteriorOctLayer,
  fetchAnteriorOctLayer,
  updateAnteriorOctLayer,
  resetAnteriorOctLayer,
  fetchPosteriorSurface,
  fetchAnteriorSurface
} from "@/api/layer";
import {
  fetchLayers,
  freeMemeory,
  fetchSurface,
  Point,
  LayerType
} from "@/utils/tools/segmentation";
import { PageRoute } from "@/utils/route";
import router from "@/router";
import { getBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";

export interface AttrType extends LayerAttrType {
  par?: boolean;
  projType: number;
}

export interface StructuralProjState {
  layerType: string;
  projType: number;
  ceilingSurf: string;
  floorSurf: string;
  ceilingShift: number;
  floorShift: number;
  octSurfaceInfoArr: SurfaceInfoType[];
  // slowCeilingSurfPoints: Point[] | [];
  // slowFloorSurfPoints: Point[] | [];
  // fastCeilingSurfPoints: Point[] | [];
  // fastFloorSurfPoints: Point[] | [];
  surfaceLoading: boolean;
  octProcessorType: string;
  bscanProcessorType: string;
  dragCeilSurfaceDistance: number;
  dragFloorSurfaceDistance: number;
  zoomTarget: null | HTMLElement;
  bscanZooming: boolean;
  octSmartBC: number;
  sloSmartBC: number;
  slowBscanSmartBC: number;
  fastBscanSmartBC: number;
  bscanSmooth: string;
  // 亮度对比度
  sloBrightness: number;
  sloContrast: number;
  octBrightness: number;
  octContrast: number;
  slowBscanBrightness: number;
  slowBscanContrast: number;
  fastBscanBrightness: number;
  fastBscanContrast: number;
  slowBscanZoomRatio: number;
  slowBscanZoomRulerHeight: number;
  slowBscanZoomRulerWidth: number;
  fastBscanZoomRatio: number;
  fastBscanZoomRulerHeight: number;
  fastBscanZoomRulerWidth: number;
}

export const useStructuralProjStore = defineStore({
  id: "structuralProj",
  state: (): StructuralProjState => ({
    layerType: "",
    projType: ProjectTypeEnum.MEAN,
    ceilingSurf: "1",
    floorSurf: "10",
    ceilingShift: 0,
    floorShift: 25,
    octSurfaceInfoArr: [],
    // slowFloorSurfPoints: [],
    // slowCeilingSurfPoints: [],
    // fastFloorSurfPoints: [],
    // fastCeilingSurfPoints: [],
    surfaceLoading: true,
    octProcessorType: ContextmenuTypeEnum.Gray,
    bscanProcessorType: ContextmenuTypeEnum.Gray,
    dragCeilSurfaceDistance: 0,
    dragFloorSurfaceDistance: 0,
    zoomTarget: null,
    bscanZooming: false,
    octSmartBC: 0,
    sloSmartBC: 1,
    slowBscanSmartBC: 0,
    fastBscanSmartBC: 0,
    bscanSmooth: "",
    sloBrightness: 0,
    sloContrast: 0,
    octBrightness: 0,
    octContrast: 0,
    slowBscanBrightness: 0,
    slowBscanContrast: 0,
    fastBscanBrightness: 0,
    fastBscanContrast: 0,
    slowBscanZoomRatio: 50,
    slowBscanZoomRulerHeight: 20,
    slowBscanZoomRulerWidth: 20,
    fastBscanZoomRatio: 50,
    fastBscanZoomRulerHeight: 20,
    fastBscanZoomRulerWidth: 20
  }),
  getters: {
    isAs() {
      return router.currentRoute.value.path === PageRoute.AsStructuralProj;
    },
    octRect: (state: StructuralProjState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const params: {
        octLayer: string;
        projType: number;
        smartBC: number;
      } = {
        octLayer: state.layerType,
        projType: state.projType,
        smartBC: state.octSmartBC
      };
      const extraDynamicParams = buildQueryString(params);
      return {
        width: analysisCommonStore.dim_fast,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_enface,
        spacing: [
          analysisCommonStore.spacingX_um,
          analysisCommonStore.spacingY_um
        ],
        src: `${CAPTURE_URL_PRE}/oct/projection?captureKey=${analysisCommonStore.captureKey}&${extraDynamicParams}&timestamp=${analysisCommonStore.manualLayerTimestamp}`
      };
    },
    octRectOnSlo: (state: StructuralProjState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const params: {
        octLayer: string;
        projType: number;
      } = {
        octLayer: state.layerType,
        projType: state.projType
      };
      const extraDynamicParams = buildQueryString(params);
      return {
        width: analysisCommonStore.dim_fast,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_enface,
        src: `${CAPTURE_URL_PRE}/oct/projection?captureKey=${analysisCommonStore.captureKey}&${extraDynamicParams}&timestamp=${analysisCommonStore.manualLayerTimestamp}`
      };
    },
    sloRect: (state: StructuralProjState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.slo_width,
        height: analysisCommonStore.slo_height,
        transform: analysisCommonStore.xform_slo,
        src: `${CAPTURE_URL_PRE}/slo?captureKey=${analysisCommonStore.captureKey}&smartBC=${state.sloSmartBC}`
      };
    },
    slowRect: (state: StructuralProjState) => {
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
          router.currentRoute.value.path === PageRoute.AsStructuralProj
            ? "&corrected=0"
            : ""
        }`
      };
    },
    fastRect: (state: StructuralProjState) => {
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
          router.currentRoute.value.path === PageRoute.AsStructuralProj
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
    dragCeilSurface(deltaY: number) {
      this.dragCeilSurfaceDistance = deltaY;
    },
    dragFloorSurface(deltaY: number) {
      this.dragFloorSurfaceDistance = deltaY;
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
          router.currentRoute.value.path === PageRoute.AsStructuralProj
            ? 1
            : 0.4
      });
      switch (componentName) {
        case ContainerNameEnum.OctSlowBscan:
          this.slowBscanZoomRatio = scale ?? this.slowBscanZoomRatio;
          this.slowBscanZoomRulerHeight =
            height ?? this.slowBscanZoomRulerHeight;
          this.slowBscanZoomRulerWidth = width ?? this.slowBscanZoomRulerWidth;
          break;
        case ContainerNameEnum.OctFastBscan:
          this.fastBscanZoomRatio = scale ?? this.fastBscanZoomRatio;
          this.fastBscanZoomRulerHeight =
            height ?? this.fastBscanZoomRulerHeight;
          this.fastBscanZoomRulerWidth = width ?? this.fastBscanZoomRulerWidth;
          break;
      }
    },
    setBrightnessContrast({
      sloB,
      sloC,
      octB,
      octC,
      slowBscanB,
      slowBscanC,
      fastBscanB,
      fastBscanC
    }: {
      sloB?: number;
      sloC?: number;
      octB?: number;
      octC?: number;
      slowBscanB?: number;
      slowBscanC?: number;
      fastBscanB?: number;
      fastBscanC?: number;
    }) {
      this.sloBrightness = sloB ?? this.sloBrightness;
      this.sloContrast = sloC ?? this.sloContrast;
      this.octBrightness = octB ?? this.octBrightness;
      this.octContrast = octC ?? this.octContrast;
      this.slowBscanBrightness = slowBscanB ?? this.slowBscanBrightness;
      this.slowBscanContrast = slowBscanC ?? this.slowBscanContrast;
      this.fastBscanBrightness = fastBscanB ?? this.fastBscanBrightness;
      this.fastBscanContrast = fastBscanC ?? this.fastBscanContrast;
    },
    setOctLayer(layer: string) {
      this.layerType = layer;
      const layerDetail = this.octSurfaceInfoArr[Number(layer)];
      this.$state = {
        ...this.$state,
        ...layerDetail
      };
    },
    async setAttrs(attrs: AttrType) {
      // this.par = attrs.par ? 1 : 0;
      this.projType = attrs.projType;
      this.setProjType();

      const { ceilingSurf, floorSurf, ceilingShift, floorShift } = attrs;
      const ceilShift = Number(ceilingShift),
        flrShift = Number(floorShift);
      await this.updateLayer({
        ceilingSurf,
        floorSurf,
        ceilingShift: ceilShift,
        floorShift: flrShift
      });
      this.ceilingSurf = ceilingSurf;
      this.floorSurf = floorSurf;
      this.ceilingShift = ceilShift;
      this.floorShift = flrShift;

      const analysisCommonStore = useAnalysisCommonStoreHook();
      analysisCommonStore.updateManualLayerTimestamp(Date.now());
    },
    setProjType() {
      const editLayersStore = useEditLayersStoreHook();
      editLayersStore.projType = this.projType;
    },
    // OCT层
    async getOctLayers() {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey } = analysisCommonStore;
      try {
        const fetchOctApi = this.isAs
          ? fetchAnteriorOctLayer
          : fetchPosteriorOctLayer;
        const layers = await fetchLayers({ captureKey }, fetchOctApi);
        if (!layers) return;

        this.setOctLayerInfo(layers as Array<SurfaceInfoType>);
      } catch (err) {
        console.error(err);
      }
    },
    setOctLayerInfo(data: Array<SurfaceInfoType>) {
      this.octSurfaceInfoArr = data;
      const layerDetail = data?.[Number(this.layerType)];
      this.$state = {
        ...this.$state,
        ...layerDetail
      };
    },
    async updateLayer({
      ceilingSurf,
      ceilingShift,
      floorSurf,
      floorShift
    }: LayerType) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey } = analysisCommonStore;
      const { layerType } = this;
      const params = {
        captureKey,
        octLayer: layerType,
        ceilingSurf,
        ceilingShift: parseInt(ceilingShift),
        floorSurf,
        floorShift: parseInt(floorShift)
      };
      const updateOctApi = this.isAs
        ? updateAnteriorOctLayer
        : updatePosteriorOctLayer;
      const res = await updateOctApi(params);
      const { data } = <ListResult<SurfaceInfoType>>res;
      this.setOctLayerInfo(data as Array<SurfaceInfoType>);
      await this.getSurfaces();
    },
    async resetOctLayer() {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey } = analysisCommonStore;
      const resetOctApi = this.isAs
        ? resetAnteriorOctLayer
        : resetPosteriorOctLayer;
      const res = await resetOctApi({ captureKey });
      const { data } = <ListResult<SurfaceInfoType>>res;
      this.setOctLayerInfo(data as Array<SurfaceInfoType>);
      await this.getSurfaces();
    },
    // surface 获取
    async getSurfaces() {
      this.surfaceLoading = true;
      freeMemeory(); // 请求之前需要预清除上次mat缓存
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey, dim_slow: col, dim_fast: row } = analysisCommonStore;
      const { layerType, octSurfaceInfoArr } = this;
      const surfaceInfo = octSurfaceInfoArr?.[Number(layerType)];
      if (!surfaceInfo) return;

      const { ceilingSurf, floorSurf } = surfaceInfo;
      const commonParams = {
        captureKey,
        col,
        row
      };
      const fetchSurfaceApi = this.isAs
        ? fetchAnteriorSurface
        : fetchPosteriorSurface;
      const fetches = [
        fetchSurface({
          ...commonParams,
          surf: ceilingSurf,
          surfType: "ceilingSurfMat",
          isDewarp: this.isAs ? undefined : 1,
          fetchSurfaceApi
        }),
        fetchSurface({
          ...commonParams,
          surf: floorSurf,
          surfType: "floorSurfMat",
          isDewarp: this.isAs ? undefined : 1,
          fetchSurfaceApi
        })
      ];

      Promise.all(fetches)
        .then(results => {
          results.forEach(result => {
            const { surfType, data } = result;
            window[surfType] = data;
          });
          this.surfaceLoading = false;
        })
        .catch(error => {
          this.surfaceLoading = false;
          console.error(error); // 'Error'
        });
    },
    updateSmartBC({
      imageType,
      smartBC
    }: {
      imageType: string;
      smartBC: number;
    }) {
      switch (imageType) {
        case ContainerNameEnum.StructuralProjOct:
          this.octSmartBC = smartBC;
          break;
        case ContainerNameEnum.SloOct:
        case ContainerNameEnum.FullScope:
        case ContainerNameEnum.OCTScope:
          this.sloSmartBC = smartBC;
          break;
        case ContainerNameEnum.OctSlowBscan:
          this.slowBscanSmartBC = smartBC;
          break;
        case ContainerNameEnum.OctFastBscan:
          this.fastBscanSmartBC = smartBC;
          break;
        default:
          throw new Error(`No such image type: ${imageType}`);
      }
    }
  }
});

export function useStructuralProjStoreHook() {
  return useStructuralProjStore(store);
}
