import { defineStore } from "pinia";
import { store } from "@/store";
import { ManualLayerToolEnum } from "@/enums";

export interface ManualLayerToolState {
  activeType: string;
  isFullScreen: boolean;
}

export const useManualLayerToolStore = defineStore({
  id: "manualLayerTool",
  state: (): ManualLayerToolState => ({
    activeType: ManualLayerToolEnum.Edit,
    isFullScreen: false
  }),
  actions: {
    setActiveType(type: string) {
      this.activeType = type;
    },
    setIsFullScreen(val: boolean) {
      this.isFullScreen = val;
    }
  }
});

export function useManualLayerToolStoreHook() {
  return useManualLayerToolStore(store);
}
