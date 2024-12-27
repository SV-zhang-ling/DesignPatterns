import { defineStore } from "pinia";
import { store } from "@/store";
import { SearchForm, CaptureType } from "../utils/patient.d";
import { CAPTURE_DATA_TYPE } from "../utils";
import { ListResult, BooleanResult } from "@/api/types.d";
import { queryCaptureList, updateCaptureComment } from "@/api/patient";

export interface CaptureState {
  captureTableType: string;
  activeCaptureData: CaptureType;
  captureList: Array<CaptureType>;
  realSearchParams: SearchForm;
}

export const useCaptureStore = defineStore({
  id: "capture",
  state: (): CaptureState => ({
    captureTableType: CAPTURE_DATA_TYPE.LIST, // default as list type
    activeCaptureData: {},
    captureList: [],
    realSearchParams: {}
  }),
  actions: {
    setCaptureType(type: string) {
      this.captureTableType = type;
    },
    setCaptureList(list: Array<CaptureType>) {
      this.captureList = this.transferCaptureList(list);
    },
    setCapture(data: CaptureType) {
      this.activeCaptureData = data;
    },
    // transfer capture list to a 2d list
    transferCaptureList(originList: Array<CaptureType>): CaptureType[] {
      const transferredList: CaptureType[] = reactive([]);
      for (let i = 0; i < originList.length; i++) {
        const item = originList[i];
        // add date, time and children attributes to every item
        const dateTimeArr = item.Time ? item.Time?.split(" ") : [];
        item.date = dateTimeArr[0];
        item.hhmmss = dateTimeArr[1];
        item.children = [];

        const transferredItem = transferredList.filter(
          (tItem: CaptureType) => tItem.date === item.date
        )[0];

        if (transferredItem && transferredItem.children) {
          transferredItem.children.push(item);
          continue;
        }

        transferredList.push({
          ID: `${item.ID}-${item.date}`,
          date: item.date,
          children: [item]
        });
      }
      return transferredList;
    },
    async getCaptureList(params: SearchForm) {
      this.realSearchParams = params;
      try {
        const res = await queryCaptureList(params);
        if (!res) return;
        let { data } = <ListResult<CaptureType>>res;
        if (!data) {
          data = [];
        }
        // save capture list
        this.setCaptureList(data);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async getCaptureByID(captureID: string, local: string) {
      try {
        const params = {
          captureID,
          local
        };
        const res = await queryCaptureList(params);
        let { data } = <ListResult<CaptureType>>res;
        if (!data) {
          data = [];
        }
        // save capture list
        data.length > 0 && this.setCapture(data[0]);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async updateCapture(captureKey: string, comment: string) {
      try {
        const params = {
          captureKey,
          comment: encodeURIComponent(comment)
        };
        const res = await updateCaptureComment(params);
        const { succeed } = <BooleanResult>res;
        return succeed;
      } catch (error) {
        return Promise.reject(error);
      }
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "activeCapture",
        paths: ["activeCaptureData"] // persist store the activeCaptureData
      }
    ]
  }
});

export function useCaptureStoreHook() {
  return useCaptureStore(store);
}
