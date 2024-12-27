import { defineStore } from "pinia";
import { store } from "@/store";
import { AnalysisModeEnum } from "@/enums";

export interface ActionState {
  analysisMode: AnalysisModeEnum;
  isSynchronize: boolean;
  zoomAndMoveSync: boolean;
  xAxisLinkage: boolean;
  yAxisLinkage: boolean;
  colorMode: boolean;
  visitedSinglePage: string;
}

export const useBasicInfoStore = defineStore({
  id: "basicInfo",
  state: (): ActionState => ({
    analysisMode: AnalysisModeEnum.Single,
    zoomAndMoveSync: true,
    xAxisLinkage: true,
    yAxisLinkage: true,
    colorMode: true,
    isSynchronize: true,
    visitedSinglePage: ""
  }),
  actions: {
    setSynchronizeValue(val: boolean) {
      this.isSynchronize = val;
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "basicInfo",
        paths: ["analysisMode", "visitedSinglePage"] // persist store the analysisMode
      }
    ]
  }
});

export function useBasicInfoStoreHook() {
  return useBasicInfoStore(store);
}
