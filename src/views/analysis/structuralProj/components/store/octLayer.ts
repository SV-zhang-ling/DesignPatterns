import { defineStore } from "pinia";
import { store } from "@/store";
import { useStructuralProjStoreHook } from "../../store";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";

export interface OCTLayerState {
  activeLayerType: string;
  activeLayerName: string;
  layerList: [];
}

export const useOCTLayerStore = defineStore({
  id: "octLayer",
  state: (): OCTLayerState => ({
    activeLayerType: "",
    activeLayerName: "",
    layerList: []
  }),
  actions: {
    setLayerType(layerType: string) {
      const structuralProjStore = useStructuralProjStoreHook();
      const editLayersStore = useEditLayersStoreHook();
      this.activeLayerType = layerType;
      structuralProjStore.setOctLayer(layerType);
      editLayersStore.octLayer = Number(layerType);
    },
    setLayerName(name: string) {
      this.activeLayerName = name;
    },
    setLayerList(list: []) {
      this.layerList = list;
    }
  }
});

export function useOCTLayerStoreHook() {
  return useOCTLayerStore(store);
}
