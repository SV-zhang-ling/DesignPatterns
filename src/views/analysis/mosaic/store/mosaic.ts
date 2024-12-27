import { defineStore } from "pinia";
import { store } from "@/store";
import { buildQueryString } from "@/utils";
import { CAPTURE_URL_PRE } from "@/utils/constant";
import { useAnalysisCommonStore } from "../../store/analysisCommon";
import { ContextmenuTypeEnum } from "@/enums";
import router from "@/router";
import { PageRoute } from "@/utils/route";

/**
 * Mosaic store
 */

export interface MosaicState {
  activeLayerType: string;
  activeLayerTypeName: string;
  enhance: boolean;
  measure: string;
  quantize: string;
  smartBC: number;
  octProcessorType?: string;
  mosaicBrightness: number;
  mosaicContrast: number;
}

export const useMosaicStore = defineStore({
  id: "mosaic",
  state: (): MosaicState => {
    return {
      activeLayerType: "0",
      activeLayerTypeName:
        router.currentRoute.value.path === PageRoute.MosaicStructuralProj
          ? "RNFL"
          : "Retina",
      enhance: true,
      measure: "0",
      quantize: "0",
      smartBC: 0,
      octProcessorType: ContextmenuTypeEnum.Gray,
      mosaicBrightness: 0,
      mosaicContrast: 0
    };
  },
  getters: {
    mosaicSrc: (state: MosaicState) => {
      const analysisCommonStore = useAnalysisCommonStore();
      const srcParams = buildQueryString({
        captureKey: analysisCommonStore.captureKey,
        angioLayer: state.activeLayerType,
        smartBC: state.smartBC,
        isMosaic: 1,
        enhance: state.enhance ? 1 : 0
      });
      return `${CAPTURE_URL_PRE}/angio/projection?${srcParams}`;
    },
    mosaicOctSrc: (state: MosaicState) => {
      const analysisCommonStore = useAnalysisCommonStore();
      const srcParams = buildQueryString({
        captureKey: analysisCommonStore.captureKey,
        octLayer: state.activeLayerType,
        smartBC: state.smartBC,
        isMosaic: 1,
        projColor: state.octProcessorType
      });
      return `${CAPTURE_URL_PRE}/oct/projection?${srcParams}`;
    }
  },
  actions: {
    setActiveLayerType(layer: string) {
      this.activeLayerType = layer;
    },
    setActiveLayerTypeName(name: string | undefined) {
      this.activeLayerTypeName = name || "";
    },
    updateSmartBC({ smartBC }: { smartBC: number }) {
      this.smartBC = smartBC;
    },
    setBrightnessContrast({
      mosaicB,
      mosaicC
    }: {
      mosaicB?: number;
      mosaicC?: number;
    }) {
      this.mosaicBrightness = mosaicB ?? this.mosaicBrightness;
      this.mosaicContrast = mosaicC ?? this.mosaicContrast;
    }
  }
});

export function useMosaicStoreHook() {
  return useMosaicStore(store);
}
