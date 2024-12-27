import { defineStore } from "pinia";
import { store } from "@/store";
import {
  ContainerNameEnum,
  ContextmenuTypeEnum,
  ProjectTypeEnum,
  AxisEnum,
  AlgorithmEnum,
  VesselEnum
} from "@/enums";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useEditLayersStoreHook } from "../../../components/layers/store/editLayers";
import { fetchSurface, Point, freeMemeory } from "@/utils/tools/segmentation";
import { fetchPosteriorSurface } from "@/api/layer";
import {
  LAYER_ADVANCEDSEG_LIST,
  CAPTURE_URL_PRE,
  ANALYSIS_URL_PRE,
  ALGORITHM_LIST,
  QUANTIZATION_VALUE_SRF_LIST,
  QUANTIZATION_VALUE_VESSEL_LIST
} from "@/utils/constant";
import { getBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";

export interface AdvancedSegState {
  showRecogonizedContent: boolean;
  algorithm: string;
  quantizationValue: string;
  octProcessorType: string;
  sloSmartBC: number;
  bscanSmartBC: number;
  bscanProcessorType: string;
  bscanZooming: boolean;
  bscanSmooth: string;
  zoomTarget: null | HTMLElement;
  octLayer: number; // 11脉络膜 12视网膜
  projType: number;
  surfaceLoading: boolean;
  ceilingSurfPoints: Point[] | [];
  floorSurfPoints: Point[] | [];
  ceilingSurf: string;
  floorSurf: string;
  ceilingShift: number;
  floorShift: number;
  // 亮度对比度
  sloBrightness: number;
  sloContrast: number;
  octBrightness: number;
  octContrast: number;
  bscanBrightness: number;
  bscanContrast: number;
  quantizeBrightness: number;
  quantizeContrast: number;
  bscanZoomRatio: number;
  bscanZoomRulerHeight: number;
  bscanZoomRulerWidth: number;
  quantizeIndexName: string | undefined;
}

export const useAdvancedSegStore = defineStore({
  id: "advancedSeg",
  state: (): AdvancedSegState => ({
    showRecogonizedContent: true,
    algorithm: AlgorithmEnum.CHVessel,
    octLayer: 11,
    projType: ProjectTypeEnum.MEAN,
    quantizationValue: "1",
    octProcessorType: ContextmenuTypeEnum.Gray,
    sloSmartBC: 1,
    bscanSmartBC: 0,
    bscanProcessorType: ContextmenuTypeEnum.Gray,
    bscanZooming: false,
    bscanSmooth: "",
    zoomTarget: null,
    surfaceLoading: true,
    floorSurfPoints: [],
    ceilingSurfPoints: [],
    ceilingSurf: "10",
    floorSurf: "9",
    ceilingShift: 0,
    floorShift: 0,
    sloBrightness: 0,
    sloContrast: 0,
    octBrightness: 0,
    octContrast: 0,
    bscanBrightness: 0,
    bscanContrast: 0,
    quantizeBrightness: 0,
    quantizeContrast: 0,
    bscanZoomRatio: 50,
    bscanZoomRulerHeight: 20,
    bscanZoomRulerWidth: 20,
    quantizeIndexName: ""
  }),
  getters: {
    quantizeRect: (state: AdvancedSegState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.dim_fast,
        height: analysisCommonStore.dim_slow,
        spacing: [
          analysisCommonStore.spacingX_um,
          analysisCommonStore.spacingY_um
        ],
        transform: analysisCommonStore.xform_enface,
        src: `${ANALYSIS_URL_PRE}/${
          state.algorithm === AlgorithmEnum.CHVessel ? "chvessel" : "srf"
        }/map?captureKey=${analysisCommonStore.captureKey}&quantize=${
          state.quantizationValue
        }&timestamp=${analysisCommonStore.manualLayerTimestamp}`
      };
    },
    bscanRect: (state: AdvancedSegState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      analysisCommonStore.optimalSmooth;
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
        }&smartBC=${state.bscanSmartBC}`,
        recogonize: `${ANALYSIS_URL_PRE}/${
          state.algorithm === AlgorithmEnum.CHVessel ? "chvessel" : "srf"
        }/bscan?captureKey=${analysisCommonStore.captureKey}&slice=${
          analysisCommonStore.y
        }&axis=${AxisEnum.SLOW}&timestamp=${
          analysisCommonStore.manualLayerTimestamp
        }`
      };
    },
    sloRect: (state: AdvancedSegState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.slo_width,
        height: analysisCommonStore.slo_height,
        transform: analysisCommonStore.xform_slo,
        src: `${CAPTURE_URL_PRE}/slo?captureKey=${analysisCommonStore.captureKey}&smartBC=${state.sloSmartBC}`
      };
    },
    octRect: (state: AdvancedSegState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.dim_fast,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_enface,
        src: `${CAPTURE_URL_PRE}/oct/projection?captureKey=${analysisCommonStore.captureKey}&octLayer=${state.octLayer}&projType=${state.projType}&timestamp=${analysisCommonStore.manualLayerTimestamp}`
      };
    }
  },
  actions: {
    setRecogonizedContentVisible(visible: boolean) {
      this.showRecogonizedContent = visible;
    },
    setAlgorithm(val: string) {
      this.algorithm = val;
    },
    setQuantizationValue(val: string) {
      this.quantizationValue = val;
    },
    setQuantizeIndexName() {
      const algorithmItem = ALGORITHM_LIST.find(
        x => x.value === this.algorithm
      );
      const quantizeList =
        this.algorithm == VesselEnum.CVV
          ? QUANTIZATION_VALUE_VESSEL_LIST
          : QUANTIZATION_VALUE_SRF_LIST;
      const quantizeItem = quantizeList.find(
        x => x.value === this.quantizationValue
      );
      this.quantizeIndexName = algorithmItem!.name + quantizeItem!.name;
    },
    setOctLayer(layer: number) {
      this.octLayer = layer;
      const layerDetail = LAYER_ADVANCEDSEG_LIST[Number(this.algorithm)];
      this.$state = {
        ...this.$state,
        ...layerDetail
      };
    },
    setRecogonizeLayerInfo() {
      this.setOctLayer(this.octLayer);
      const retinaLayer = LAYER_ADVANCEDSEG_LIST?.[Number(this.algorithm)]; // 获取默认分层数据
      this.$state = {
        ...this.$state,
        ...retinaLayer
      };
      this.setQuantizeIndexName();
    },
    setZoomTarget(el: HTMLElement | null) {
      this.zoomTarget = el;
    },
    setbscanZooming(zooming: boolean) {
      this.bscanZooming = zooming;
    },
    async updateRecogonizedContentLayer() {
      await this.getPosteriorSurface();
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
        case ContainerNameEnum.AdvancedSegBscan:
          this.bscanZoomRatio = scale ?? this.bscanZoomRatio;
          this.bscanZoomRulerHeight = height ?? this.bscanZoomRulerHeight;
          this.bscanZoomRulerWidth = width ?? this.bscanZoomRulerWidth;
          break;
      }
    },
    setBrightnessContrast({
      quantizeB,
      quantizeC,
      sloB,
      sloC,
      octB,
      octC,
      bscanB,
      bscanC
    }: {
      quantizeB?: number;
      quantizeC?: number;
      sloB?: number;
      sloC?: number;
      octB?: number;
      octC?: number;
      bscanB?: number;
      bscanC?: number;
    }) {
      this.sloBrightness = sloB ?? this.sloBrightness;
      this.sloContrast = sloC ?? this.sloContrast;
      this.octBrightness = octB ?? this.octBrightness;
      this.octContrast = octC ?? this.octContrast;
      this.bscanBrightness = bscanB ?? this.bscanBrightness;
      this.bscanContrast = bscanC ?? this.bscanContrast;
      this.quantizeBrightness = quantizeB ?? this.quantizeBrightness;
      this.quantizeContrast = quantizeC ?? this.quantizeContrast;
    },
    cancelFullscreen() {
      this.zoomTarget?.classList.remove("full-screen");
      this.setbscanZooming(false);
    },
    async getPosteriorSurface() {
      this.surfaceLoading = true;
      freeMemeory(); // 请求之前需要预清楚上次mat缓存
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey, dim_slow: col, dim_fast: row } = analysisCommonStore;
      const { algorithm } = this;
      const surfaceInfo = LAYER_ADVANCEDSEG_LIST?.[Number(algorithm)];
      const { ceilingSurf, floorSurf } = surfaceInfo;
      const commonParams = {
        captureKey,
        col,
        row
      };
      Promise.all([
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
      ])
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
        case ContainerNameEnum.AdvancedSegSlo:
        case ContainerNameEnum.FullScope:
        case ContainerNameEnum.OCTScope:
          this.sloSmartBC = smartBC;
          break;
        case ContainerNameEnum.AdvancedSegBscan:
          this.bscanSmartBC = smartBC;
          break;
        default:
          throw new Error(`No such image type: ${imageType}`);
      }
    }
  }
});

export function useAdvancedSegStoreHook() {
  return useAdvancedSegStore(store);
}
