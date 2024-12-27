import { defineStore } from "pinia";
import { store } from "@/store";
import router from "@/router";
import { PageRoute } from "@/utils/route";
import { AngioLayerType } from "@/views/utils/angioLayer.d";
import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { buildQueryString } from "@/utils";

export interface AngioLayerState {
  angioLayerList: Array<AngioLayerType>;
  activeAngioLayerType: string;
  activeAngioLayerName: string;
}

export const useAngioLayerStore = defineStore({
  id: "angioLayer",
  state: (): AngioLayerState => ({
    activeAngioLayerType: "",
    angioLayerList: [],
    activeAngioLayerName: ""
  }),
  getters: {
    paramsUrl() {
      const isAngioEnhanced =
        router.currentRoute.value.path === PageRoute.AngioRetinaEnhanced;
      const angioStore = useAngioStoreHook();
      const params: {
        projType: number;
        par: number;
        enhance: number;
        removeStripLine: number;
        retinaEnhanced?: number;
      } = {
        projType: angioStore.projType,
        par: angioStore.par,
        enhance: angioStore.enhance,
        removeStripLine: angioStore.removeStripLine
      };
      isAngioEnhanced && (params.retinaEnhanced = 1);
      return buildQueryString(params);
    }
  },
  actions: {
    setAngioLayerType(layerType: string) {
      const angioStore = useAngioStoreHook();
      this.activeAngioLayerType = layerType;
      // also save angio layer type to angiography store
      angioStore.setAngioLayer(layerType);
    },
    setAngioLayerName(name: string) {
      this.activeAngioLayerName = name;
    },
    setAngioLayerList(list: Array<AngioLayerType>) {
      this.angioLayerList = list;
    }
  }
});

export function useAngioLayerStoreHook() {
  return useAngioLayerStore(store);
}
