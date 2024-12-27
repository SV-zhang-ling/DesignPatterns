import { defineStore } from "pinia";
import { store } from "@/store";

export interface ActionState {
  navigationLine: boolean;
  layerOnBscan: boolean;
  angioColor: boolean;
  recogonizedContent: boolean;
  scanLine: boolean;
  layerEdit: boolean;
}

export const useImageActionStore = defineStore({
  id: "imageAction",
  state: (): ActionState => ({
    navigationLine: true,
    layerOnBscan: false,
    angioColor: true,
    recogonizedContent: true,
    scanLine: true,
    layerEdit: true
  }),
  actions: {
    setNavigationStatus(status: boolean) {
      this.navigationLine = status;
    },
    setLayerOnBscan(status: boolean) {
      this.layerOnBscan = status;
    },
    setAngioColor(status: boolean) {
      this.angioColor = status;
    },
    setRecogonizedContent(status: boolean) {
      this.recogonizedContent = status;
    },
    setScanLine(status: boolean) {
      this.scanLine = status;
    }
  }
});

export function useImageActionStoreHook() {
  return useImageActionStore(store);
}
