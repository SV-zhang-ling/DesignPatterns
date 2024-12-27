import { defineStore } from "pinia";
import { store } from "@/store";
import router from "@/router";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import {
  AxisEnum,
  ContainerNameEnum,
  ContextmenuTypeEnum,
  ProjectTypeEnum
} from "@/enums";
import { AngioAttrType } from "../utils/angiography.d";
import { useEditLayersStoreHook } from "../../../components/layers/store/editLayers";
import { buildQueryString } from "@/utils";
import { PageRoute } from "@/utils/route";
import { CAPTURE_URL_PRE, PosteriorSurfaceEnum } from "@/utils/constant";
import { ListResult } from "@/api/types.d";
import {
  UpdatePosteriorAngioLayer,
  ResetPosteriorAngioLayer,
  fetchPosteriorAngioLayer,
  fetchPosteriorSurface
} from "@/api/layer";
import {
  fetchLayers,
  freeMemeory,
  fetchSurface,
  Point,
  LayerType
} from "@/utils/tools/segmentation/index";
import { getBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";

export interface AngioState {
  showAngio: boolean;
  angioLayer: string;
  par: number;
  removeStripLine: number;
  enhance: number;
  projType: number;
  measure: string;
  quantize: string;
  ceilingSurf: string;
  floorSurf: string;
  ceilingShift: number;
  floorShift: number;
  angioSurfaceInfoArr: SurfaceInfoType[];
  slowCeilingSurfPoints: Point[] | [];
  slowFloorSurfPoints: Point[] | [];
  fastCeilingSurfPoints: Point[] | [];
  fastFloorSurfPoints: Point[] | [];
  showFastBscan: boolean;
  surfaceLoading: boolean;
  bscanProcessorType: string;
  angioProcessorType: string;
  octProcessorType: string;
  dragCeilSurfaceDistance: number;
  dragFloorSurfaceDistance: number;
  zoomTarget: null | HTMLElement;
  bscanZooming: boolean;
  angioSmartBC: number;
  sloSmartBC: number;
  slowBscanMainSmartBC: number;
  slowBscanAttachSmartBC: number;
  fastBscanSmartBC: number;
  bscanSmooth: string;
  aspectRatioFactor: number;
  // 亮度对比度
  angioBrightness: number;
  angioContrast: number;
  sloBrightness: number;
  sloContrast: number;
  octBrightness: number;
  octContrast: number;
  slowBscanBrightness: number;
  slowBscanContrast: number;
  fastBscanBrightness: number;
  fastBscanContrast: number;
  // 比例尺
  slowBscanMainZoomRatio: number;
  slowBscanMainZoomRulerHeight: number;
  slowBscanMainZoomRulerWidth: number;
  slowBscanAttachZoomRatio: number;
  slowBscanAttachZoomRulerHeight: number;
  slowBscanAttachZoomRulerWidth: number;
  fastBscanZoomRatio: number;
  fastBscanZoomRulerHeight: number;
  fastBscanZoomRulerWidth: number;
}

export const useAngioStore = defineStore({
  id: "angiography",
  state: (): AngioState => ({
    showAngio: true,
    angioLayer: "0",
    par: 1,
    removeStripLine: 1,
    enhance: 1,
    projType: ProjectTypeEnum.MAX,
    measure: "0",
    quantize: "0",
    ceilingSurf: "1",
    floorSurf: "10",
    ceilingShift: 0,
    floorShift: 25,
    angioSurfaceInfoArr: [],
    slowFloorSurfPoints: [],
    slowCeilingSurfPoints: [],
    fastFloorSurfPoints: [],
    fastCeilingSurfPoints: [],
    showFastBscan: false, // slow/fast bscan switch
    surfaceLoading: true,
    angioProcessorType: ContextmenuTypeEnum.Gray,
    octProcessorType: ContextmenuTypeEnum.Gray,
    bscanProcessorType: ContextmenuTypeEnum.Gray,
    dragCeilSurfaceDistance: 0,
    dragFloorSurfaceDistance: 0,
    zoomTarget: null,
    bscanZooming: false,
    angioSmartBC: 0,
    sloSmartBC: 1,
    slowBscanMainSmartBC: 0,
    slowBscanAttachSmartBC: 0,
    fastBscanSmartBC: 0,
    bscanSmooth: "",
    aspectRatioFactor: 0.4,
    angioBrightness: 0,
    angioContrast: 0,
    sloBrightness: 0,
    sloContrast: 0,
    octBrightness: 0,
    octContrast: 0,
    slowBscanBrightness: 0,
    slowBscanContrast: 0,
    fastBscanBrightness: 0,
    fastBscanContrast: 0,
    slowBscanMainZoomRatio: 50,
    slowBscanMainZoomRulerHeight: 20,
    slowBscanMainZoomRulerWidth: 20,
    slowBscanAttachZoomRatio: 50,
    slowBscanAttachZoomRulerHeight: 20,
    slowBscanAttachZoomRulerWidth: 20,
    fastBscanZoomRatio: 50,
    fastBscanZoomRulerHeight: 20,
    fastBscanZoomRulerWidth: 20
  }),
  getters: {
    paramsUrl(state: AngioState) {
      const params = {
        angioLayer: state.angioLayer,
        par: state.par,
        removeStripLine: state.removeStripLine,
        enhance: state.enhance,
        projType: state.projType,
        ceilingSurf: state.ceilingShift,
        floorSurf: state.floorShift,
        ceilingShift: state.ceilingShift,
        floorShift: state.floorShift
      };
      return buildQueryString(params);
    },
    angioProcessorTypeVal(state: AngioState) {
      const isPhotocoagulationLayer =
        this.angioLayer === PosteriorSurfaceEnum.Photocoagulation;
      return isPhotocoagulationLayer ? "" : state.angioProcessorType;
    },
    projRect: (state: AngioState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const isAngioEnhanced =
        router.currentRoute.value.path === PageRoute.AngioRetinaEnhanced;
      const {
        angioLayer,
        par,
        removeStripLine,
        enhance,
        projType,
        ceilingShift,
        floorShift,
        ceilingSurf,
        floorSurf,
        angioSmartBC
      } = state;
      const extraDynamicParams = buildQueryString({
        angioLayer,
        par,
        removeStripLine,
        enhance,
        projType,
        ceilingShift,
        floorShift,
        ceilingSurf,
        floorSurf,
        smartBC: angioSmartBC,
        retinaEnhanced: isAngioEnhanced ? 1 : 0
      });
      return {
        width: analysisCommonStore.dim_fast,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_enface,
        spacing: [
          analysisCommonStore.spacingX_um,
          analysisCommonStore.spacingY_um
        ],
        src: `${CAPTURE_URL_PRE}/angio/projection?captureKey=${analysisCommonStore.captureKey}&${extraDynamicParams}&timestamp=${analysisCommonStore.manualLayerTimestamp}`
      };
    },
    sloRect: (state: AngioState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.slo_width,
        height: analysisCommonStore.slo_height,
        transform: analysisCommonStore.xform_slo,
        src: `${CAPTURE_URL_PRE}/slo?captureKey=${analysisCommonStore.captureKey}&smartBC=${state.sloSmartBC}`
      };
    },
    octRect: (state: AngioState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const isAngioEnhanced =
        router.currentRoute.value.path === PageRoute.AngioRetinaEnhanced;
      const params: {
        angioLayer: string;
        projType: number;
        ceilingShift: number;
        floorShift: number;
        ceilingSurf: string;
        floorSurf: string;
        retinaEnhanced?: number;
      } = {
        angioLayer: state.angioLayer,
        projType: state.projType,
        ceilingShift: state.ceilingShift,
        floorShift: state.floorShift,
        ceilingSurf: state.ceilingSurf,
        floorSurf: state.floorSurf
      };
      isAngioEnhanced && (params.retinaEnhanced = 1);
      const extraDynamicParams = buildQueryString(params);
      return {
        width: analysisCommonStore.dim_fast,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_enface,
        src: `${CAPTURE_URL_PRE}/oct/projection?captureKey=${analysisCommonStore.captureKey}&${extraDynamicParams}&timestamp=${analysisCommonStore.manualLayerTimestamp}`
      };
    },
    slowRect: (state: AngioState) => {
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
        }&smartBC=${state.slowBscanMainSmartBC}`,
        angio: `${CAPTURE_URL_PRE}/angio/bscan?captureKey=${analysisCommonStore.captureKey}&slice=${analysisCommonStore.y}&axis=${AxisEnum.SLOW}&par=${state.par}`
      };
    },
    slowRectAttach: (state: AngioState) => {
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
        }&smartBC=${state.slowBscanAttachSmartBC}`,
        angio: `${CAPTURE_URL_PRE}/angio/bscan?captureKey=${analysisCommonStore.captureKey}&slice=${analysisCommonStore.y}&axis=${AxisEnum.SLOW}&par=${state.par}`
      };
    },
    fastRect: (state: AngioState) => {
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
        }&smartBC=${state.fastBscanSmartBC}`,
        angio: `${CAPTURE_URL_PRE}/angio/bscan?captureKey=${analysisCommonStore.captureKey}&slice=${analysisCommonStore.x}&axis=${AxisEnum.FAST}&par=${state.par}`
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
    setAngioVisible(visible: boolean) {
      this.showAngio = visible;
    },
    commitCrosshairPosition({ x, y }: { x?: number; y?: number }) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const editLayersStore = useEditLayersStoreHook();
      if (editLayersStore.showEditLayerDig) return;
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
        aspectRatioFactor: 0.4
      });
      switch (componentName) {
        case ContainerNameEnum.SlowBScanMain:
          this.slowBscanMainZoomRatio = scale ?? this.slowBscanMainZoomRatio;
          this.slowBscanMainZoomRulerHeight =
            height ?? this.slowBscanMainZoomRulerHeight;
          this.slowBscanMainZoomRulerWidth =
            width ?? this.slowBscanMainZoomRulerWidth;
          break;
        case ContainerNameEnum.SlowBScanAttach:
          this.slowBscanAttachZoomRatio =
            scale ?? this.slowBscanAttachZoomRatio;
          this.slowBscanAttachZoomRulerHeight =
            height ?? this.slowBscanAttachZoomRulerHeight;
          this.slowBscanAttachZoomRulerWidth =
            width ?? this.slowBscanAttachZoomRulerWidth;
          break;
        case ContainerNameEnum.FastBScan:
          this.fastBscanZoomRatio = scale ?? this.fastBscanZoomRatio;
          this.fastBscanZoomRulerHeight =
            height ?? this.fastBscanZoomRulerHeight;
          this.fastBscanZoomRulerWidth = width ?? this.fastBscanZoomRulerWidth;
          break;
      }
    },
    setBrightnessContrast({
      angioB,
      angioC,
      sloB,
      sloC,
      octB,
      octC,
      slowBscanB,
      slowBscanC,
      fastBscanB,
      fastBscanC
    }: {
      angioB?: number;
      angioC?: number;
      sloB?: number;
      sloC?: number;
      octB?: number;
      octC?: number;
      slowBscanB?: number;
      slowBscanC?: number;
      fastBscanB?: number;
      fastBscanC?: number;
    }) {
      this.angioBrightness = angioB ?? this.angioBrightness;
      this.angioContrast = angioC ?? this.angioContrast;
      this.sloBrightness = sloB ?? this.sloBrightness;
      this.sloContrast = sloC ?? this.sloContrast;
      this.octBrightness = octB ?? this.octBrightness;
      this.octContrast = octC ?? this.octContrast;
      this.slowBscanBrightness = slowBscanB ?? this.slowBscanBrightness;
      this.slowBscanContrast = slowBscanC ?? this.slowBscanContrast;
      this.fastBscanBrightness = fastBscanB ?? this.fastBscanBrightness;
      this.fastBscanContrast = fastBscanC ?? this.fastBscanContrast;
    },
    setAngioLayer(layer: string) {
      this.angioLayer = layer;
      const layerDetail = this.angioSurfaceInfoArr[Number(layer)];
      this.$state = {
        ...this.$state,
        ...layerDetail
      };
    },
    async setAngioAttrs(attrs: AngioAttrType) {
      this.par = attrs.par ? 1 : 0;
      this.removeStripLine = attrs.removeStripLine ? 1 : 0;
      this.enhance = attrs.enhance ? 1 : 0;
      this.projType = attrs.projType;
      this.measure = attrs.measure;
      this.quantize = attrs.quantize;

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
    },
    // 血流层操作
    async getPosteriorAngioLayer() {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey } = analysisCommonStore;
      const layers = await fetchLayers(
        { captureKey },
        fetchPosteriorAngioLayer
      );
      if (!layers) return;

      this.setAngioLayerInfo(layers as Array<SurfaceInfoType>);
    },
    async updateLayer({
      ceilingSurf,
      ceilingShift,
      floorSurf,
      floorShift
    }: LayerType) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey } = analysisCommonStore;
      const { angioLayer } = this;
      const params = {
        captureKey,
        angioLayer,
        ceilingSurf,
        ceilingShift: parseInt(ceilingShift),
        floorSurf,
        floorShift: parseInt(floorShift)
      };
      const res = await UpdatePosteriorAngioLayer(params);
      const { data } = <ListResult<SurfaceInfoType>>res;
      this.setAngioLayerInfo(data as Array<SurfaceInfoType>);
      await this.getPosteriorSurface();
    },
    async resetPosteriorAngioLayer() {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey } = analysisCommonStore;
      const res = await ResetPosteriorAngioLayer({ captureKey });
      const { data } = <ListResult<SurfaceInfoType>>res;
      this.setAngioLayerInfo(data as Array<SurfaceInfoType>);
      await this.getPosteriorSurface();
    },
    setAngioLayerInfo(data: Array<SurfaceInfoType>) {
      this.angioSurfaceInfoArr = data;
      this.setAngioLayer(this.angioLayer);
      const angioRetinaLayer = data?.[Number(this.angioLayer)]; // 获取默认分层数据
      this.$state = {
        ...this.$state,
        ...angioRetinaLayer
      };
    },
    // surface 获取
    async getPosteriorSurface() {
      this.surfaceLoading = true;
      freeMemeory(); // 请求之前需要预清除上次mat缓存
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey, dim_slow: col, dim_fast: row } = analysisCommonStore;
      const { angioLayer, angioSurfaceInfoArr } = this;
      const surfaceInfo = angioSurfaceInfoArr?.[Number(angioLayer)];
      if (!surfaceInfo) return;

      const { ceilingSurf, floorSurf } = surfaceInfo;
      const commonParams = {
        captureKey,
        col,
        row
      };
      const fetches = [
        fetchSurface({
          ...commonParams,
          surf: ceilingSurf,
          surfType: "ceilingSurfMat",
          fetchSurfaceApi: fetchPosteriorSurface
        }),
        fetchSurface({
          ...commonParams,
          surf: floorSurf,
          surfType: "floorSurfMat",
          fetchSurfaceApi: fetchPosteriorSurface
        })
      ];

      Promise.all(fetches)
        .then(results => {
          results.forEach(result => {
            const { surfType, data } = result;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window[surfType] = data;
          });
          this.surfaceLoading = false;
        })
        .catch(error => {
          this.surfaceLoading = false;
          console.error(error); // 'Error'
        });
    },
    getAllPosteriorSurface() {
      // this.surfaceLoading = true;
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey, dim_slow: col, dim_fast: row } = analysisCommonStore;
      const { angioLayer, angioSurfaceInfoArr } = this;
      const surfaceInfo = angioSurfaceInfoArr?.[Number(angioLayer)];
      const { ceilingSurf, floorSurf } = surfaceInfo;
      const commonParams = {
        captureKey,
        col,
        row
      };
      const fetches = [
        fetchSurface({
          ...commonParams,
          surf: ceilingSurf,
          surfType: "ceilingSurfMat"
        }),
        fetchSurface({
          ...commonParams,
          surf: floorSurf,
          surfType: "floorSurfMat"
        })
      ];

      Promise.all(fetches)
        .then(results => {
          results.forEach(result => {
            const { surfType, data } = result;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
        case ContainerNameEnum.AngioProj:
          this.angioSmartBC = smartBC;
          break;
        case ContainerNameEnum.SloOct:
        case ContainerNameEnum.FullScope:
        case ContainerNameEnum.OCTScope:
          this.sloSmartBC = smartBC;
          break;
        case ContainerNameEnum.SlowBScanMain:
          this.slowBscanMainSmartBC = smartBC;
          break;
        case ContainerNameEnum.SlowBScanAttach:
          this.slowBscanAttachSmartBC = smartBC;
          break;
        case ContainerNameEnum.FastBScan:
          this.fastBscanSmartBC = smartBC;
          break;
        default:
          throw new Error(`No such image type: ${imageType}`);
      }
    }
  }
});

export function useAngioStoreHook() {
  return useAngioStore(store);
}
