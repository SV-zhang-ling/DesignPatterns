import { defineStore } from "pinia";
import { store } from "@/store";

export interface AnalysisElement {
  labelKey: string;
  value: string;
  path: string;
}

export interface AnalysisState {
  singleAnalysisList: Array<AnalysisElement>;
  activeAnalysis: string;
}

export const useAnalysisSelStore = defineStore({
  id: "analysisSel",
  state: (): AnalysisState => ({
    activeAnalysis: "",
    singleAnalysisList: []
  }),
  actions: {
    setAnalysis(value: string) {
      this.activeAnalysis = value;
    }
  }
});

export function useAnalysisSelStoreHook() {
  return useAnalysisSelStore(store);
}
