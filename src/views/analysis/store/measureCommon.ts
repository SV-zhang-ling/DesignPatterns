import { defineStore } from "pinia";
import { store } from "@/store";
import { getMeasureList, saveMeasureList } from "@/api/measure";
import { GeneralResult } from "@/api/types.d";
import router from "@/router";
import _ from "lodash";
import { getPostRequestData } from "@/utils";

const OTHER_MEASURE_TYPE = ["Quantize", "Mosaic", "Oct"];

export interface MeasureWithCapture {
  [key: string]: MeasureResponse;
}
export interface MeasureResponse {
  [key: string]: Array<MeasureResult>;
}
export interface MeasureResult {
  [key: string]: Array<PointType> | string;
}
export interface PointType {
  type?: string;
  flatPoint: Array<number>;
  text?: string;
  TextPosition?: Array<number>;
  TextMoved?: boolean;
}

export interface MeasureCommonState extends Point {
  clickCount: number;
  operMeasureId: string;
  operViewportDom: HTMLElement | null;
  measureGlobalData: MeasureWithCapture;
  originMeasureData: MeasureWithCapture;
  showTextEditDialog: boolean;
  operMeasureText: string;
  clientLeft: number;
  clientTop: number;
  measureLoading: boolean;
}

export const useMeasureCommonStore = defineStore({
  id: "measureCommon",
  state: (): MeasureCommonState => ({
    /** 文本需要记录坐标点 */
    x: 0,
    y: 0,
    clickCount: 0,
    operMeasureId: "",
    operViewportDom: null,
    measureGlobalData: {},
    originMeasureData: {},
    showTextEditDialog: false,
    operMeasureText: "",
    clientLeft: 0,
    clientTop: 0,
    measureLoading: true
  }),
  getters: {},
  actions: {
    setParamsVal({
      count,
      id,
      viewportDom
    }: {
      count?: number;
      id?: string;
      viewportDom?: HTMLElement | null;
    }) {
      this.clickCount = count ?? this.clickCount;
      this.operMeasureId = id ?? this.operMeasureId;
      this.operViewportDom = viewportDom ?? this.operViewportDom;
    },
    setMeasureGlobalData(captureKey: string, list: MeasureResponse) {
      this.measureGlobalData[captureKey] = { ...list };
      this.originMeasureData = _.cloneDeep(this.measureGlobalData);
      this.setMeasureDataSession();
    },
    setMeasureDataByViewerType(
      captureKey: string,
      viewerType: string,
      list: MeasureResult[]
    ) {
      this.measureGlobalData[captureKey][viewerType] = [...list];
      this.setMeasureDataSession();
    },
    setMeasureDataSession() {
      sessionStorage.setItem(
        "measureGlobalData",
        JSON.stringify(this.measureGlobalData)
      );
    },
    setShowTextEditDialog(visible: any) {
      this.showTextEditDialog = visible;
    },
    setMeasureText(val: any) {
      this.operMeasureText = val;
    },
    setMeasureTextPosition({ x, y }: { x: number; y: number }) {
      this.x = x;
      this.y = y;
    },
    setTextDialogClientPosition({ x, y }: { x: number; y: number }) {
      this.clientLeft = x;
      this.clientTop = y;
    },
    async getMeasureData(key?: string) {
      this.measureLoading = true;
      const captureKey = !key
        ? (router.currentRoute.value.query.captureKey as string)
        : key;
      try {
        const res = await getMeasureList({ captureKey });
        if (!res) return;
        const { data } = <GeneralResult<MeasureResponse>>res;
        if (!data) return;
        this.setMeasureGlobalData(captureKey, data);
        this.measureLoading = false;
      } catch (error) {
        this.measureLoading = false;
        return Promise.reject(error);
      }
    },
    async saveMeasureData() {
      // 处理存储数据，非后端存储类型，需要删除
      const global = getPostRequestData(this.measureGlobalData);
      for (const key in global) {
        try {
          if (!_.isEqual(this.originMeasureData[key], global[key])) {
            await saveMeasureList({
              captureKey: key,
              userInputData: global[key]
            });
          }
        } catch (error) {
          return Promise.reject(error);
        }
      }
    }
  }
});

export function useMeasureCommonStoreHook() {
  return useMeasureCommonStore(store);
}
