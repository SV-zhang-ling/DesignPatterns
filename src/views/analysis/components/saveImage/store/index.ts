import { defineStore } from "pinia";
import { store } from "@/store";
import { AnalysisModeEnum, ContainerNameEnum } from "@/enums";
import { PageRoute } from "@/utils/route";
import router from "@/router";
import { isAnteriorScan } from "@/utils/protocol";
import { getBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";

export interface ActionState {
  showAngioBscan: boolean;
  showSloBscan: boolean;
  analysisMode: AnalysisModeEnum;
  targetName: string;
  bscanHeight: number;
  bscanWidth: number;
  bscanZoomRatio: number;
  bscanZoomRulerHeight: number;
  bscanZoomRulerWidth: number;
  classNameType: string;
  originAngioLayer: string;
  originAngioLayerName: string;
}

export const useSaveImageStore = defineStore({
  id: "saveImage",
  state: (): ActionState => ({
    analysisMode: AnalysisModeEnum.Single,
    showAngioBscan: false,
    showSloBscan: false,
    targetName: "",
    bscanHeight: 600,
    bscanWidth: 0,
    bscanZoomRatio: 50,
    bscanZoomRulerHeight: 20,
    bscanZoomRulerWidth: 20,
    classNameType: "",
    originAngioLayer: "",
    originAngioLayerName: ""
  }),
  actions: {
    setBscanWidth(viewportDom: HTMLElement) {
      const innerContainerDom = viewportDom.querySelector(
        ".inner-container"
      ) as HTMLElement;
      const innerContainerStyle = window.getComputedStyle(innerContainerDom);
      const width = parseFloat(innerContainerStyle.width);
      const height = parseFloat(innerContainerStyle.height);
      if (!width || !height) return;
      this.bscanWidth = (width * this.bscanHeight) / height;
    },
    setAngioLayer(value: string, name: string) {
      this.originAngioLayer = value;
      this.originAngioLayerName = name;
    },
    setClassNameType(type: string) {
      this.classNameType = type;
    },
    async bscanZoomRuler({
      innerContainerDom
    }: {
      innerContainerDom: HTMLElement;
    }) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const {
        width,
        height,
        value: scale
      } = await getBscanZoomRuler({
        innerContainerDom,
        aspectRatioFactor:
          [PageRoute.AsStructuralProj, PageRoute.AsCube].includes(
            router.currentRoute.value.path
          ) || isAnteriorScan(analysisCommonStore.protocolName)
            ? 1
            : 0.4
      });
      this.bscanZoomRatio = scale ?? this.bscanZoomRatio;
      this.bscanZoomRulerWidth = width ?? this.bscanZoomRulerWidth;
      this.bscanZoomRulerHeight = height ?? this.bscanZoomRulerHeight;
    }
  }
});

export function useSaveImageStoreHook() {
  return useSaveImageStore(store);
}
