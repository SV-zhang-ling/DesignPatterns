import { defineStore } from "pinia";
import { store } from "@/store";
import { AxisEnum, ContainerNameEnum } from "@/enums";
import { buildQueryString } from "@/utils";
import { AS_SURFACE_LIST, CAPTURE_URL_PRE } from "@/utils/constant";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { isAnteriorScan, isStarScanData } from "@/utils/protocol";
import { fetchSurface, freeMemeory } from "@/utils/tools/asSegmentation";
import { useImageActions } from "@/hooks/useImageActions";
import { isSingleLineScanProtocol } from "@/utils/protocol";
import { getBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";

const { handleLayerVisible } = useImageActions();

/**
 * line scan store
 */
export interface LineScanState {
  activeSlice: number;
  sloSmartBC: number;
  bscanSmartBC: number;
  bscanProcessorType: string;
  referencePosSet: number[];
  showBscanPosOnActiveLine: boolean;
  bscanSmooth: string;
  corrected: number;
  surfLoading: boolean;
  // 亮度对比度
  sloBrightness: number;
  sloContrast: number;
  bscanBrightness: number;
  bscanContrast: number;
  bscanZoomRatio: number;
  bscanZoomRulerHeight: number;
  bscanZoomRulerWidth: number;
}

export const useLineScanStore = defineStore({
  id: "lineScan",
  state: (): LineScanState => {
    return {
      activeSlice: -1,
      sloSmartBC: 1,
      bscanSmartBC: 0,
      bscanProcessorType: "",
      referencePosSet: [],
      showBscanPosOnActiveLine: true,
      bscanSmooth: "",
      corrected: 1, // 前节Bscan是否需要校正
      surfLoading: false,
      sloBrightness: 0,
      sloContrast: 0,
      bscanBrightness: 0,
      bscanContrast: 0,
      bscanZoomRatio: 50,
      bscanZoomRulerHeight: 20,
      bscanZoomRulerWidth: 20
    };
  },
  getters: {
    currentReferencePos: (state: LineScanState) => {
      return state.referencePosSet[
        state.activeSlice === -1 ? 0 : state.activeSlice
      ];
    },
    sloRect: (state: LineScanState) => {
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
    bscanSrc: (state: LineScanState) => {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const params: {
        captureKey: string;
        axis: AxisEnum;
        encoder: string;
        quality: number;
        smooth: string;
        smartBC: number;
        slice: number;
        corrected?: number;
      } = {
        captureKey: analysisCommonStore.captureKey,
        axis: AxisEnum.SLOW,
        encoder: "jpg",
        quality: 60,
        smooth: state.bscanSmooth,
        smartBC: state.bscanSmartBC,
        slice:
          state.activeSlice === -1
            ? Math.floor(analysisCommonStore.dim_slow / 2)
            : state.activeSlice
      };
      isAnteriorScan(analysisCommonStore.protocolName) &&
        (params.corrected = state.corrected);
      const srcParams = buildQueryString(params);
      return `${CAPTURE_URL_PRE}/oct/bscan?${srcParams}`;
    }
  },
  actions: {
    initReferencePosSet() {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const {
        dim_slow,
        dim_fast,
        syncSlowBscanIndex,
        syncFastBscanIndex,
        protocolName
      } = analysisCommonStore;
      // 初始化游标卡尺坐标为中心位置
      const fastIdx =
        syncFastBscanIndex === -1 ? dim_fast / 2 - 1 : syncFastBscanIndex;
      const referencePosSet = isSingleLineScanProtocol(protocolName)
        ? [fastIdx]
        : Array.from({ length: dim_slow }, (_, i) =>
            i === syncSlowBscanIndex ? fastIdx : dim_fast / 2 - 1
          );
      this.referencePosSet = referencePosSet;
      // console.log("referencePosSet", dim_slow, dim_fast, referencePosSet);
    },
    setActiveBscanSlice(slice: number) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      this.activeSlice = slice;
      analysisCommonStore.syncSlowBscanIndex = slice;
    },
    setReferencePos(pos: number) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      this.referencePosSet[this.activeSlice === -1 ? 0 : this.activeSlice] =
        pos;
      analysisCommonStore.syncFastBscanIndex = pos;
    },
    async bscanZoomRuler({
      innerContainerDom,
      componentName
    }: {
      innerContainerDom: HTMLElement;
      componentName: ContainerNameEnum;
    }) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const {
        width,
        height,
        value: scale
      } = await getBscanZoomRuler({
        innerContainerDom,
        aspectRatioFactor: isAnteriorScan(analysisCommonStore.protocolName)
          ? 1
          : 0.4
      });
      switch (componentName) {
        case ContainerNameEnum.LineScanBscan:
          this.bscanZoomRatio = scale ?? this.bscanZoomRatio;
          this.bscanZoomRulerHeight = height ?? this.bscanZoomRulerHeight;
          this.bscanZoomRulerWidth = width ?? this.bscanZoomRulerWidth;
          break;
      }
    },
    setBrightnessContrast({
      sloB,
      sloC,
      bscanB,
      bscanC
    }: {
      sloB?: number;
      sloC?: number;
      bscanB?: number;
      bscanC?: number;
    }) {
      this.sloBrightness = sloB ?? this.sloBrightness;
      this.sloContrast = sloC ?? this.sloContrast;
      this.bscanBrightness = bscanB ?? this.bscanBrightness;
      this.bscanContrast = bscanC ?? this.bscanContrast;
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
          this.sloSmartBC = smartBC;
          break;
        case ContainerNameEnum.LineScanBscan:
          this.bscanSmartBC = smartBC;
          break;
        default:
          throw new Error(`No such image type: ${imageType}`);
      }
    },
    updateCorrectedValue(active: boolean | undefined) {
      this.corrected = active ? 1 : 0;
      const ele = document.querySelector(".layer-on-bscan-item") as HTMLElement;
      const hideLayerOnBscan = [...ele.classList].includes("rectangle");
      !active && !hideLayerOnBscan && handleLayerVisible(active as boolean);
    },
    // as surface 获取
    async getAnteriorSurface() {
      freeMemeory(); // 请求之前需要预清除上次mat缓存

      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { captureKey, dim_slow: col, dim_fast: row } = analysisCommonStore;
      // const surfaceInfo = [0, 1, 2, 3, 4, 5, 6];
      const commonParams = {
        captureKey,
        col,
        row
      };
      this.surfLoading = true;
      Promise.all([
        ...AS_SURFACE_LIST.map((item: { value: string; surfType: string }) =>
          fetchSurface({
            ...commonParams,
            surf: item.value,
            surfType: item.surfType
          })
        )
      ])
        .then(results => {
          results.forEach(result => {
            const { surfType, data } = result;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window[surfType] = data;
          });
          this.surfLoading = false;
        })
        .catch(error => {
          console.error(error); // 'Error'
          this.surfLoading = false;
        });
    }
  }
});

export function useLineScanStoreHook() {
  return useLineScanStore(store);
}
