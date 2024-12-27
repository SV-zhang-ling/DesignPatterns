import { defineStore } from "pinia";
import { store } from "@/store";
import { querySelectDataList } from "@/api/analysis";
import { ListResult, selectDataParamsType } from "@/api/types";
import { CaptureType } from "@/views/patient/utils/patient";

export interface SelectDataState {
  selectDataList: Array<CaptureType>;
  activeData: CaptureType;
  ouSelectedList: Array<CaptureType>;
  ouSelectedKeys: Array<string | undefined>;
  changeSelectedList: Array<CaptureType>;
  changeSelectedKeys: Array<string | undefined>;
}

export const useSelectDataStore = defineStore({
  id: "selectData",
  state: (): SelectDataState => ({
    selectDataList: [],
    activeData: {},
    ouSelectedList: [],
    ouSelectedKeys: [],
    changeSelectedList: [],
    changeSelectedKeys: []
  }),
  actions: {
    setSelectDataList(list: Array<CaptureType>) {
      this.selectDataList = list;
    },
    setActiveData(data: CaptureType) {
      this.activeData = data;
    },
    setOuSelectedList(list: Array<CaptureType>) {
      this.ouSelectedList = [...list];
    },
    setOuSelectedKeys(keys: Array<string | undefined>) {
      this.ouSelectedKeys = [...keys];
    },
    setChangeSelectedList(list: Array<CaptureType>) {
      this.changeSelectedList = [...list];
    },
    setChangeSelectedKeys(keys: Array<string | undefined>) {
      this.changeSelectedKeys = [...keys];
    },
    async getSelectDataList(params: selectDataParamsType) {
      try {
        const res = await querySelectDataList(params);
        if (!res) return;
        let { data } = <ListResult<CaptureType>>res;
        if (!data) {
          data = [];
        }
        // save 筛选后的数据
        const dataList = data;
        this.setSelectDataList(dataList);
      } catch (error) {
        return Promise.reject(error);
      }
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "selectedData",
        paths: ["ouSelectedList", "changeSelectedList"]
      }
    ]
  }
});

export function useSelectDataStoreHook() {
  return useSelectDataStore(store);
}
