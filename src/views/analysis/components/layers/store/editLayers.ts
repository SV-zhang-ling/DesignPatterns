import router from "@/router";
import { defineStore } from "pinia";
import { store } from "@/store";
import { PageRoute } from "@/utils/route";
import {
  ContextmenuTypeEnum,
  ContainerNameEnum,
  ProjectTypeEnum,
  AxisEnum
} from "@/enums";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { useAdvancedSegStoreHook } from "@/views/analysis/posterior/advancedSeg/store/advancedSeg";
import { useLineScanStore } from "@/views/analysis/lineScan/single/store/index";
import { useStructuralProjStoreHook } from "@/views/analysis/structuralProj/store";
import {
  POSTERIOR_SURFACE_LIST,
  CAPTURE_URL_PRE,
  ANALYSIS_URL_PRE,
  PosteriorSurfaceEnum,
  AnteriorSurfaceEnum,
  AS_SURFACE_LIST
} from "@/utils/constant";
import { isAnteriorScan, isStarScanData } from "@/utils/protocol";
import { matchSurface } from "@/utils/tools/segmentation/manualLayer";
import * as Protocol from "@/utils/protocol";

interface Anchor {
  x: number;
  y: number;
  id: string;
  latestHandling: boolean | undefined;
}
type ManualOperationType = "stash" | "save" | "cancel" | "reset";
export interface EditLayersState extends Point {
  activeSlice: number;
  referencePosSet: number[];
  showBscanPosOnActiveLine: boolean;
  showEditLayerDig: boolean;
  projType: number;
  octProcessorType: string;
  bscanProcessorType: string;
  thicknessMapColorType: string;
  sloSmartBC: number;
  octSmartBC: number;
  fastBscanSmartBC: number;
  fastBscanSmooth: string;
  fastBscanZooming: boolean;
  slowBscanSmartBC: number;
  slowBscanSmooth: string;
  slowBscanZooming: boolean;
  surfaceLoading: boolean;
  angioLayer: string;
  octLayer: number;
  thicknessLayer: string;
  editSurface: string;
  refSurface: string;
  showAllLines: boolean;
  showEditLine: boolean;
  hasAnchors: boolean;
  editing: boolean;
  dialogLoading: boolean;
  hasSavedCount: number;
  stashTimestamp: number;
  anchors: Anchor[];
  lastManualOperationType: ManualOperationType;
  frameHistory: number[];
  isAsBorderEdit: boolean;
  maskLoading: boolean;
}

export const useEditLayersStore = defineStore({
  id: "editLayers",
  state: (): EditLayersState => ({
    x: 100,
    y: 200,
    activeSlice: -1,
    referencePosSet: [],
    showBscanPosOnActiveLine: true,
    showEditLayerDig: false,
    projType: ProjectTypeEnum.MAX,
    octProcessorType: ContextmenuTypeEnum.Gray,
    bscanProcessorType: ContextmenuTypeEnum.Gray,
    thicknessMapColorType: ContextmenuTypeEnum.Range500,
    sloSmartBC: 1,
    octSmartBC: 0,
    fastBscanSmartBC: 0,
    fastBscanSmooth: "3",
    fastBscanZooming: false,
    slowBscanSmartBC: 0,
    slowBscanSmooth: "0",
    slowBscanZooming: false,
    surfaceLoading: true,
    // 需要更改，用于判断修改分层是否结束
    angioLayer: "0",
    octLayer: 11,
    thicknessLayer: "",
    editSurface: PosteriorSurfaceEnum.BM,
    refSurface: PosteriorSurfaceEnum.ILM,
    showAllLines: true,
    showEditLine: true,
    hasAnchors: false,
    editing: true,
    dialogLoading: false,
    hasSavedCount: 0,
    stashTimestamp: 0,
    anchors: [],
    lastManualOperationType: "cancel",
    frameHistory: [],
    isAsBorderEdit: false,
    maskLoading: true
  }),
  getters: {
    isCloseDlgVisible: (state: EditLayersState) => {
      // 当前存在锚点，或者最后执行的一次操作是暂存，则显示关闭对话框
      const visible =
        state.anchors.length > 0 ||
        state.lastManualOperationType === "stash" ||
        state.isAsBorderEdit;
      return visible;
    },
    cancelStashButtonDisabled: (state: EditLayersState) => {
      const disable =
        state.anchors.length === 0 &&
        state.lastManualOperationType !== "stash" &&
        !state.isAsBorderEdit;
      return disable;
    },
    editedTipsVisible: (state: EditLayersState) => {
      // 当前切片有过修改记录，或者当前有锚点存在则显示edited
      if (state.anchors.length > 0) return true;
      const recordIndex = state.frameHistory.findIndex(
        record => record === state.y
      );
      if (recordIndex !== -1) return true;
      if (state.isAsBorderEdit) return true;
      return false;
    },
    saveButtonDisabled: (state: EditLayersState) => {
      const disable =
        state.anchors.length === 0 &&
        state.lastManualOperationType !== "stash" &&
        !state.isAsBorderEdit;
      return disable;
    },
    stashButtonDisabled: (state: EditLayersState) => {
      return state.anchors.length === 0 && !state.isAsBorderEdit;
    },
    toggleEditedScanButtonDisabled: (state: EditLayersState) => {
      const disable =
        state.frameHistory.length === 0 ||
        (state.frameHistory.length === 1 && state.frameHistory[0] === state.y);
      return disable;
    },
    currentReferencePos: (state: EditLayersState) => {
      return state.referencePosSet[
        state.activeSlice === -1 ? 0 : state.activeSlice
      ];
    },
    mapRect: (state: EditLayersState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const currentEditSurface = matchSurface(state.editSurface);
      return {
        width: analysisCommonStore.dim_fast,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_enface,
        spacing: [
          analysisCommonStore.spacingX_um,
          analysisCommonStore.spacingY_um
        ],
        src:
          router.currentRoute.value.path === PageRoute.AsStructuralProj
            ? `${ANALYSIS_URL_PRE}/anterior/thickness/map?captureKey=${analysisCommonStore.captureKey}&editSurf=${currentEditSurface}&refSurf=${state.refSurface}&colorMapName=${state.thicknessMapColorType}&timestamp=${state.stashTimestamp}`
            : `${ANALYSIS_URL_PRE}/thickness/map?captureKey=${analysisCommonStore.captureKey}&editSurf=${currentEditSurface}&refSurf=${state.refSurface}&colorMapName=${state.thicknessMapColorType}&thicknessLayer=${state.thicknessLayer}&timestamp=${state.stashTimestamp}`
      };
    },
    sloRect: (state: EditLayersState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.slo_width,
        height: analysisCommonStore.slo_height,
        transform: analysisCommonStore.xform_slo,
        src: `${CAPTURE_URL_PRE}/slo?captureKey=${analysisCommonStore.captureKey}&smartBC=${state.sloSmartBC}`
      };
    },
    enfaceRect: () => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.dim_fast,
        height: isStarScanData(analysisCommonStore.protocolName)
          ? analysisCommonStore.dim_slow
          : analysisCommonStore.dim_slow === 1
          ? 1
          : analysisCommonStore.dim_slow - 1,
        transform: analysisCommonStore.xform_enface,
        n: analysisCommonStore.dim_slow, //  线的条数
        spacingX: analysisCommonStore.spacingX_um,
        spacingY: analysisCommonStore.spacingY_um,
        rotate: analysisCommonStore.rotation_deg
      };
    },
    octRect: (state: EditLayersState) => {
      const currentEditSurface = matchSurface(state.editSurface);
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.dim_fast,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_enface,
        spacing: [
          analysisCommonStore.spacingX_um,
          analysisCommonStore.spacingY_um
        ],
        src: `${CAPTURE_URL_PRE}/oct/projection?captureKey=${analysisCommonStore.captureKey}&smartBC=${state.octSmartBC}&editSurf=${currentEditSurface}&refSurf=${state.refSurface}&timestamp=${state.stashTimestamp}`
      };
    },
    fastRect: (state: EditLayersState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.dim_axial,
        height: analysisCommonStore.dim_slow,
        transform: analysisCommonStore.xform_fast,
        src: `${CAPTURE_URL_PRE}/oct/bscan?captureKey=${
          analysisCommonStore.captureKey
        }&slice=${state.x}&axis=${AxisEnum.FAST}&smooth=${
          state.fastBscanSmooth
        }&encoder=${state.fastBscanZooming ? "png" : "jpg"}&quality=${
          state.fastBscanZooming ? 95 : 30
        }&smartBC=${state.fastBscanSmartBC}${
          isAnteriorScan(analysisCommonStore.protocolName) ? "&corrected=0" : ""
        }`
      };
    },
    slowRect: (state: EditLayersState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      return {
        width: analysisCommonStore.dim_axial,
        height: analysisCommonStore.dim_fast,
        transform: analysisCommonStore.xform_slow,
        src: `${CAPTURE_URL_PRE}/oct/bscan?captureKey=${
          analysisCommonStore.captureKey
        }&slice=${state.y}&axis=${AxisEnum.SLOW}&smooth=${
          state.slowBscanSmooth
        }&encoder=${state.slowBscanZooming ? "png" : "jpg"}&quality=${
          state.slowBscanZooming ? 95 : 30
        }&smartBC=${state.slowBscanSmartBC}${
          isAnteriorScan(analysisCommonStore.protocolName) ? "&corrected=0" : ""
        }`
      };
    },
    bscanIndex: (state: EditLayersState) => {
      return router.currentRoute.value.path === PageRoute.LineScan
        ? state.activeSlice
        : state.y;
    }
  },
  actions: {
    setLastManualOperationType(type: ManualOperationType) {
      this.lastManualOperationType = type;
      if (["cancel", "save", "reset"].includes(type)) {
        // 清空修改记录
        this.resetFrameHistory();
      } else {
        // stash后，把当前索引加入历史记录
        this.pushFrameHistory(this.bscanIndex);
      }
    },
    resetFrameHistory() {
      this.frameHistory = [];
    },
    pushFrameHistory(index: number) {
      if (!this.frameHistory.includes(index)) {
        this.frameHistory.push(index);
        this.frameHistory.sort((a, b) => a - b);
        this.frameHistory = [...this.frameHistory];
      }
    },
    updateAnchors(anchors: Anchor[]) {
      this.anchors = anchors;
    },
    updateStashTimestamp() {
      this.stashTimestamp = new Date().getTime();
    },
    async updateLayer() {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const angioStore = useAngioStoreHook();
      const timestamp = new Date().getTime();
      analysisCommonStore.updateManualLayerTimestamp(timestamp);
      if (
        [PageRoute.Angiography, PageRoute.AngioRetinaEnhanced].includes(
          analysisCommonStore.path
        )
      ) {
        angioStore.getPosteriorSurface();
      } else if (analysisCommonStore.path === PageRoute.AdvancedSeg) {
        const advancedSegStore = useAdvancedSegStoreHook();
        advancedSegStore.getPosteriorSurface();
      } else if (
        [PageRoute.StructuralProjection, PageRoute.AsStructuralProj].includes(
          analysisCommonStore.path
        )
      ) {
        const structuralProjStore = useStructuralProjStoreHook();
        structuralProjStore.getSurfaces();
      } else if (Protocol.isAnteriorScan(analysisCommonStore.protocolName)) {
        const lineScanStore = useLineScanStore();
        lineScanStore.getAnteriorSurface();
      }

      return timestamp;
    },
    setHasSavedCount() {
      this.hasSavedCount++;
    },
    setDialogLoading(loading: boolean) {
      this.dialogLoading = loading;
    },
    setEditStatus(status: boolean) {
      this.editing = status;
    },
    setEditLayerDigVisible(visible: boolean) {
      this.showEditLayerDig = visible;
    },
    setShowAllLines(val: boolean) {
      this.showAllLines = val;
    },
    setShowEditLine(val: boolean) {
      this.showEditLine = val;
    },
    setEditSurface(value: string) {
      this.editSurface = value;
    },
    setRefSurface(value: string) {
      this.refSurface = value;
    },
    setActiveBscanSlice(slice: number) {
      this.activeSlice = slice;
      this.commitCrosshairPosition({ y: slice });
    },
    setSurfaceLoading(val: boolean) {
      this.surfaceLoading = val;
    },
    initEditLayerDigInfo() {
      const { path } = router.currentRoute.value;
      const angioStore = useAngioStoreHook();
      const advancedSegStore = useAdvancedSegStoreHook();
      const lineScanStore = useLineScanStore();
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const structuralProjStore = useStructuralProjStoreHook();
      this.x = analysisCommonStore.x;
      this.y = analysisCommonStore.y;
      /**
       * 后节---初始为编辑层为bm层，参考层为内界膜层
       * 若接收到的上边界不在编辑层列表内，则编辑层为bm层
       * 若为色素上皮脱离层，参考层默认为色素上皮层，且不可以更改
       * 根据上边界判断，编辑层为bm层，参考层为内界膜层，编辑层非bm层，参考层为bm层
       */
      let pageStore;
      let keyIndex;
      switch (path) {
        case PageRoute.Angiography:
        case PageRoute.AngioRetinaEnhanced:
          pageStore = angioStore;
          this.projType = angioStore.projType;
          this.angioLayer = angioStore.angioLayer;
          keyIndex = POSTERIOR_SURFACE_LIST.findIndex(
            option => option.value === angioStore.ceilingSurf
          );
          this.setRefByEditSurf(
            keyIndex !== -1 ? angioStore.ceilingSurf : PosteriorSurfaceEnum.BM
          );
          break;
        case PageRoute.StructuralProjection:
          pageStore = structuralProjStore;
          this.projType = structuralProjStore.projType;
          this.octLayer = Number(structuralProjStore.layerType);
          keyIndex = POSTERIOR_SURFACE_LIST.findIndex(
            option => option.value === structuralProjStore.ceilingSurf
          );
          this.setRefByEditSurf(
            keyIndex !== -1
              ? structuralProjStore.ceilingSurf
              : PosteriorSurfaceEnum.BM
          );
          break;
        case PageRoute.AsStructuralProj:
          pageStore = structuralProjStore;
          this.projType = structuralProjStore.projType;
          this.octLayer = Number(structuralProjStore.layerType);
          keyIndex = AS_SURFACE_LIST.findIndex(
            option => option.value === structuralProjStore.ceilingSurf
          );
          this.setAsRefByEditSurf(
            keyIndex !== -1
              ? structuralProjStore.ceilingSurf
              : AnteriorSurfaceEnum.IrisFront
          );
          break;
        case PageRoute.AdvancedSeg:
          pageStore = advancedSegStore;
          this.projType = advancedSegStore.projType;
          this.octLayer = advancedSegStore.octLayer;
          keyIndex = POSTERIOR_SURFACE_LIST.findIndex(
            option => option.value === advancedSegStore.ceilingSurf
          );
          this.setRefByEditSurf(
            keyIndex !== -1
              ? advancedSegStore.ceilingSurf
              : PosteriorSurfaceEnum.BM
          );
          break;
        default:
          pageStore = lineScanStore;
          this.activeSlice = lineScanStore.activeSlice;
          this.referencePosSet = lineScanStore.referencePosSet;
          Protocol.isAnteriorScan(analysisCommonStore.protocolName)
            ? this.setAsRefByEditSurf(AnteriorSurfaceEnum.IrisFront)
            : this.setRefByEditSurf(PosteriorSurfaceEnum.BM);
          break;
      }
      const { bscanProcessorType, bscanSmooth } = pageStore;
      this.bscanProcessorType = bscanProcessorType;
      this.slowBscanSmooth = bscanSmooth;
      this.fastBscanSmooth = bscanSmooth;
    },
    setRefByEditSurf(layer: string) {
      this.editSurface = layer;
      switch (layer) {
        case PosteriorSurfaceEnum.BM:
          this.refSurface = PosteriorSurfaceEnum.ILM;
          break;
        case PosteriorSurfaceEnum.RPEBM:
          this.refSurface = PosteriorSurfaceEnum.RPE;
          break;
        default:
          this.refSurface = PosteriorSurfaceEnum.BM;
          break;
      }
    },
    setAsRefByEditSurf(layer: string) {
      this.editSurface = layer;
      switch (layer) {
        case AnteriorSurfaceEnum.OcularSurface:
          this.refSurface = AnteriorSurfaceEnum.StromaBack;
          break;
        case AnteriorSurfaceEnum.StromaFront:
        case AnteriorSurfaceEnum.StromaBack:
          this.refSurface = AnteriorSurfaceEnum.OcularSurface;
          break;
        case AnteriorSurfaceEnum.IrisFront:
          this.refSurface = AnteriorSurfaceEnum.IrisBack;
          break;
        case AnteriorSurfaceEnum.IrisBack:
          this.refSurface = AnteriorSurfaceEnum.IrisFront;
          break;
        case AnteriorSurfaceEnum.LensFront:
          this.refSurface = AnteriorSurfaceEnum.LensBack;
          break;
        case AnteriorSurfaceEnum.LensBack:
          this.refSurface = AnteriorSurfaceEnum.LensFront;
          break;
        default:
          break;
      }
    },
    commitCrosshairPosition({ x, y }: { x?: number; y?: number }) {
      this.x = x ?? this.x;
      this.y = y ?? this.y;
      this.activeSlice = y ?? this.y;
    },
    syncCrosshairPosition() {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const lineScanStore = useLineScanStore();
      analysisCommonStore.y = this.y;
      analysisCommonStore.x = this.x;
      analysisCommonStore.syncSlowBscanIndex = this.y;
      analysisCommonStore.syncFastBscanIndex = this.x;
      analysisCommonStore.syncSlowBscanIndex = this.activeSlice;
      if (router.currentRoute.value.path === PageRoute.LineScan) {
        lineScanStore.activeSlice = this.activeSlice;
      }
    },
    updateSmartBC({
      imageType,
      smartBC
    }: {
      imageType: string;
      smartBC: number;
    }) {
      switch (imageType) {
        case ContainerNameEnum.LineScanSLO:
        case ContainerNameEnum.ManualSLO:
          this.sloSmartBC = smartBC;
          break;
        case ContainerNameEnum.OCTViewer:
          this.octSmartBC = smartBC;
          break;
        case ContainerNameEnum.ManualFastBscan:
          this.fastBscanSmartBC = smartBC;
          break;
        case ContainerNameEnum.ManualBscan:
          this.slowBscanSmartBC = smartBC;
          break;
        default:
          throw new Error(`No such image type: ${imageType}`);
      }
    }
  }
});

export function useEditLayersStoreHook() {
  return useEditLayersStore(store);
}
