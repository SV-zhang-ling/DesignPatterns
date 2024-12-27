import { PageRoute } from "./../../../utils/route";
import { defineStore } from "pinia";
import { store } from "@/store";
import { CaptureType } from "@/views/patient/utils/patient";
import { GeneralResult } from "@/api/types.d";
import { queryCaptureDetail } from "@/api/patient";
import { CaptureDetail } from "./analysisCommon";
import { useBasicInfoStoreHook } from "../components/store/basicInfo";
import { useSelectDataStoreHook } from "../components/store/selectData";
import { AnalysisModeEnum, OculusTypeEnum, ContextmenuTypeEnum } from "@/enums";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
import router from "@/router";
import { isSingleLineScanProtocol } from "@/utils/protocol";

export interface CaptureDetailWithKey extends CaptureDetail, Point {
  loading: boolean;
  captureKey: string;
  slo_width: number;
  slo_height: number;
  activeSlice: number;
  referencePosSet: number[];
  currentReferencePos: number;
  sloSmartBC: number;
  bscanSmartBC: number;
  angioSmartBC: number;
  slowBscanMainSmartBC: number;
  slowBscanAttachSmartBC: number;
  fastBscanSmartBC: number;
  bscanProcessorType: string;
  angioProcessorType: string;
  bscanZooming: boolean;

  bscanSmooth: string;
  ceilingSurf: string;
  floorSurf: string;
  ceilingShift: number;
  floorShift: number;
  angioSurfaceInfoArr: SurfaceInfoType[];
  slowCeilingSurfPoints: Point[] | [];
  slowFloorSurfPoints: Point[] | [];
  fastCeilingSurfPoints: Point[] | [];
  fastFloorSurfPoints: Point[] | [];
  sloBrightness: number;
  sloContrast: number;
  bscanBrightness: number;
  bscanContrast: number;
  angioBrightness: number;
  angioContrast: number;
  slowBscanBrightness: number;
  slowBscanContrast: number;
  slowBscanZoomRatio: number;
  slowBscanZoomRulerHeight: number;
  slowBscanZoomRulerWidth: number;
  lineBscanZoomRatio: number;
  lineBscanZoomRulerHeight: number;
  lineBscanZoomRulerWidth: number;
}

export interface CaptureDetailMap<T> {
  [key: string]: T;
}

export interface AnalysisMultipleCommonState {
  ouCaptureDetailMap: CaptureDetailMap<CaptureDetailWithKey>;
  changeCaptureDetailMap: CaptureDetailMap<CaptureDetailWithKey>;
  selectCaptureMap: CaptureDetailMap<CaptureDetailWithKey>;
  activeCaptureCard: CaptureDetailWithKey | null;
}

export const useAnalysisMultipleCommonStore = defineStore({
  id: "analysisMultipleCommon",
  state: (): AnalysisMultipleCommonState => ({
    ouCaptureDetailMap: {},
    changeCaptureDetailMap: {},
    selectCaptureMap: {},
    activeCaptureCard: null
  }),
  getters: {
    analysisMode() {
      const basicInfoStore = useBasicInfoStoreHook();
      return basicInfoStore.analysisMode;
    },
    selectedList() {
      const selectDataStore = useSelectDataStoreHook();
      const { ouSelectedList, changeSelectedList } = selectDataStore;
      if (
        router.currentRoute.value.query.m === AnalysisModeEnum.OU &&
        ouSelectedList.length
      ) {
        return ouSelectedList[0].Oculus === OculusTypeEnum.OD
          ? ouSelectedList
          : [ouSelectedList[1], ouSelectedList[0]];
      }
      return changeSelectedList;
    },
    captureDetail(state: AnalysisMultipleCommonState) {
      if (router.currentRoute.value.query.m === AnalysisModeEnum.OU) {
        return (captureKey: string) => {
          return state.ouCaptureDetailMap[captureKey];
        };
      } else {
        return (captureKey: string) => {
          return state.changeCaptureDetailMap[captureKey];
        };
      }
    }
  },
  actions: {
    resetWin() {
      const selectDataStore = useSelectDataStoreHook();
      const { ouSelectedList, changeSelectedList } = selectDataStore;
      [...ouSelectedList, ...changeSelectedList].forEach(
        (item: CaptureType) => {
          delete window[item.captureKey ?? ""];
        }
      );
    },
    initReferencePosSet(item: CaptureDetailWithKey) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const basicInfoStore = useBasicInfoStoreHook();
      const { syncSlowBscanIndex, syncFastBscanIndex, protocolName } =
        analysisCommonStore;

      const mainCaptureKey = router.currentRoute.value.query.captureKey;
      const { dim_slow, dim_fast } = item;
      // 初始化游标卡尺坐标为中心位置
      const fastIdx =
        item.captureKey === mainCaptureKey ||
        (this.analysisMode === AnalysisModeEnum.Change &&
          basicInfoStore.yAxisLinkage &&
          basicInfoStore.isSynchronize)
          ? syncFastBscanIndex === -1
            ? dim_fast / 2 - 1
            : syncFastBscanIndex
          : this.getInitValue("syncFastBscanIndex", item.captureKey, dim_fast);
      const referencePosSet = isSingleLineScanProtocol(protocolName)
        ? [fastIdx]
        : Array.from({ length: dim_slow }, (_, i) =>
            i === syncSlowBscanIndex ? fastIdx : dim_fast / 2 - 1
          );
      item.referencePosSet = referencePosSet;
    },
    initPageInfo(initParams?: boolean) {
      const dataList = this.selectedList;

      dataList.forEach((item: CaptureType) => {
        const captureKey = item.captureKey ?? "";
        const mapData = {
          activeSlice: -1,
          referencePosSet: [],
          currentReferencePos: 0,
          sloSmartBC: 1,
          bscanSmartBC: 0,
          angioSmartBC: 0,
          slowBscanMainSmartBC: 0,
          slowBscanAttachSmartBC: 0,
          fastBscanSmartBC: 0,
          bscanSmooth: "",
          bscanZooming: false,
          captureKey: captureKey,
          slo_width: 1000,
          slo_height: 1000,
          x: 100,
          y: 200,
          bscanProcessorType: ContextmenuTypeEnum.Gray,
          angioProcessorType: ContextmenuTypeEnum.Gray,
          loading: true,
          averagedFramesPerSlice: [],
          captureTime: "",
          depth_mm: 0,
          dim_axial: 0,
          dim_fast: 0,
          dim_slow: 0,
          dim_slo: 0,
          oculusType: "",
          protocolName: "",
          repeat: 0,
          signalStrength: 0,
          softwareVersion: "",
          spacingX_um: 0,
          spacingY_um: 0,
          spacingZ_um: 0,
          topBoundary: 0,
          downBoundary: 0,
          xform_enface: [],
          xform_fast: [],
          xform_slo: [],
          xform_slow: [],
          lineScanLength_mm: undefined,
          optimalSmooth: "",
          rotation_deg: 0,
          SN: "",
          ceilingSurf: "1",
          floorSurf: "10",
          ceilingShift: 0,
          floorShift: 25,
          angioSurfaceInfoArr: [],
          slowFloorSurfPoints: [],
          slowCeilingSurfPoints: [],
          fastFloorSurfPoints: [],
          fastCeilingSurfPoints: [],
          sn: "",
          sloBrightness: 0,
          sloContrast: 0,
          bscanBrightness: 0,
          bscanContrast: 0,
          angioBrightness: 0,
          angioContrast: 0,
          slowBscanBrightness: 0,
          slowBscanContrast: 0,
          slowBscanZoomRatio: 50,
          slowBscanZoomRulerHeight: 20,
          slowBscanZoomRulerWidth: 20,
          lineBscanZoomRatio: 50,
          lineBscanZoomRulerHeight: 20,
          lineBscanZoomRulerWidth: 20
        };
        if (this.analysisMode === AnalysisModeEnum.OU) {
          this.ouCaptureDetailMap[captureKey] = mapData;
        } else {
          this.changeCaptureDetailMap[captureKey] = mapData;
        }
      });
      !initParams &&
        dataList.forEach((item: CaptureType) => {
          this.getCaptureDetail(item);
        });
    },
    async getCaptureDetail(item: CaptureType) {
      if (!item) return;

      const basicInfoStore = useBasicInfoStoreHook();
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { syncSlowBscanIndex, syncFastBscanIndex } = analysisCommonStore;
      const mainCaptureKey = router.currentRoute.value.query.captureKey;
      try {
        const captureKey = item.captureKey ?? "";
        const res = await queryCaptureDetail({ captureKey });
        if (!res) return;

        const { data } = <GeneralResult<CaptureDetail>>res;
        if (!data) return;

        const params = {
          ...data,
          loading: false,
          captureKey: item.captureKey,
          bscanSmooth: data.optimalSmooth || 0,
          x:
            item.captureKey === mainCaptureKey ||
            (this.analysisMode === AnalysisModeEnum.Change &&
              basicInfoStore.yAxisLinkage &&
              basicInfoStore.isSynchronize)
              ? syncFastBscanIndex === -1
                ? Math.floor(data.dim_fast / 2)
                : syncFastBscanIndex
              : item.captureKey &&
                this.getInitValue(
                  "syncFastBscanIndex",
                  item.captureKey as string,
                  data.dim_fast
                ),
          y:
            item.captureKey === mainCaptureKey ||
            (this.analysisMode === AnalysisModeEnum.Change &&
              basicInfoStore.xAxisLinkage &&
              basicInfoStore.isSynchronize)
              ? syncSlowBscanIndex === -1
                ? Math.floor(data.dim_slow / 2)
                : syncSlowBscanIndex
              : item.captureKey &&
                this.getInitValue(
                  "syncSlowBscanIndex",
                  item.captureKey as string,
                  data.dim_slow
                ),
          activeSlice:
            item.captureKey === mainCaptureKey ||
            (this.analysisMode === AnalysisModeEnum.Change &&
              basicInfoStore.xAxisLinkage &&
              basicInfoStore.isSynchronize)
              ? syncSlowBscanIndex === -1
                ? Math.floor(data.dim_slow / 2)
                : syncSlowBscanIndex
              : item.captureKey &&
                this.getInitValue(
                  "syncSlowBscanIndex",
                  item.captureKey as string,
                  data.dim_slow
                )
        } as CaptureDetailWithKey;

        this.initReferencePosSet(params);
        this.initSmoothInContextmenu(data.optimalSmooth);

        if (this.analysisMode === AnalysisModeEnum.OU) {
          this.ouCaptureDetailMap[captureKey] = {
            ...this.ouCaptureDetailMap[captureKey],
            ...params
          };
        } else {
          this.changeCaptureDetailMap[captureKey] = {
            ...this.changeCaptureDetailMap[captureKey],
            ...params
          };
        }
      } catch (error) {
        return Promise.reject(error);
      }
    },
    initSmoothInContextmenu(optimalSmooth: string) {
      const contextmenuStore = useContextmenuStoreHook();
      contextmenuStore.$reset();
      contextmenuStore.syncSmoothStatus(optimalSmooth);
    },
    getInitValue(type: string, captureKey: string, dim: number) {
      if (
        router.currentRoute.value.path === PageRoute.MultipleLineScan &&
        captureKey in this.selectCaptureMap
      ) {
        return type === "syncSlowBscanIndex"
          ? this.selectCaptureMap[captureKey].activeSlice
          : this.selectCaptureMap[captureKey].referencePosSet[
              this.selectCaptureMap[captureKey].activeSlice
            ];
      }
      if (
        router.currentRoute.value.path === PageRoute.MultipleAngio &&
        captureKey in this.selectCaptureMap
      ) {
        return type === "syncSlowBscanIndex"
          ? this.selectCaptureMap[captureKey].y
          : this.selectCaptureMap[captureKey].x;
      }
      return Math.floor(dim / 2);
    },
    getRecordByKey(captureKey: string) {
      const selectDataStore = useSelectDataStoreHook();
      const ou = selectDataStore.ouSelectedList.filter(
        (item: CaptureType) => item.captureKey === captureKey
      );
      const change = selectDataStore.changeSelectedList.filter(
        (item: CaptureType) => item.captureKey === captureKey
      );
      return ou[0] || change[0];
    },
    syncActiveSlice(mode: string) {
      const mainCaptureKey = router.currentRoute.value.query
        .captureKey as string;
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { syncSlowBscanIndex, syncFastBscanIndex } = analysisCommonStore;
      const basicInfoStore = useBasicInfoStoreHook();
      if (mode === AnalysisModeEnum.OU) {
        // 同步主数据activeSlice
        this.ouCaptureDetailMap[mainCaptureKey].activeSlice =
          syncSlowBscanIndex;
        this.ouCaptureDetailMap[mainCaptureKey].referencePosSet[
          syncSlowBscanIndex
        ] = syncFastBscanIndex;
      }
      if (mode === AnalysisModeEnum.Change) {
        // 根据同步、异步判断
        if (
          (basicInfoStore.isSynchronize && basicInfoStore.xAxisLinkage) ||
          (basicInfoStore.isSynchronize && basicInfoStore.yAxisLinkage)
        ) {
          for (const key in this.changeCaptureDetailMap) {
            basicInfoStore.xAxisLinkage &&
              (this.changeCaptureDetailMap[key].activeSlice =
                syncSlowBscanIndex);
            basicInfoStore.yAxisLinkage &&
              (this.changeCaptureDetailMap[key].referencePosSet[
                syncSlowBscanIndex
              ] = syncFastBscanIndex);
          }
        } else {
          this.changeCaptureDetailMap[mainCaptureKey].activeSlice =
            syncSlowBscanIndex;
          this.changeCaptureDetailMap[mainCaptureKey].referencePosSet[
            syncSlowBscanIndex
          ] = syncFastBscanIndex;
        }
      }
    },
    syncCommitCrosshairPosition(mode: string) {
      const mainCaptureKey = router.currentRoute.value.query
        .captureKey as string;
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { syncSlowBscanIndex, syncFastBscanIndex } = analysisCommonStore;
      const basicInfoStore = useBasicInfoStoreHook();
      if (mode === AnalysisModeEnum.OU) {
        // 同步主数据activeSlice
        this.ouCaptureDetailMap[mainCaptureKey].y =
          syncSlowBscanIndex === -1
            ? Math.floor(this.ouCaptureDetailMap[mainCaptureKey].dim_slow / 2)
            : syncSlowBscanIndex;
        this.ouCaptureDetailMap[mainCaptureKey].x =
          syncFastBscanIndex === -1
            ? Math.floor(this.ouCaptureDetailMap[mainCaptureKey].dim_fast / 2)
            : syncFastBscanIndex;
      }
      if (mode === AnalysisModeEnum.Change) {
        // 根据同步、异步判断
        if (
          (basicInfoStore.isSynchronize && basicInfoStore.xAxisLinkage) ||
          (basicInfoStore.isSynchronize && basicInfoStore.yAxisLinkage)
        ) {
          for (const key in this.changeCaptureDetailMap) {
            basicInfoStore.xAxisLinkage &&
              (this.changeCaptureDetailMap[key].y =
                syncSlowBscanIndex === -1
                  ? Math.floor(
                      this.changeCaptureDetailMap[mainCaptureKey].dim_slow / 2
                    )
                  : syncSlowBscanIndex);
            basicInfoStore.yAxisLinkage &&
              (this.changeCaptureDetailMap[key].x =
                syncFastBscanIndex === -1
                  ? Math.floor(
                      this.changeCaptureDetailMap[mainCaptureKey].dim_fast / 2
                    )
                  : syncFastBscanIndex);
          }
        } else {
          this.changeCaptureDetailMap[mainCaptureKey].y = this.getInitValue(
            "syncSlowBscanIndex",
            mainCaptureKey,
            this.changeCaptureDetailMap[mainCaptureKey].dim_slow
          );
          this.changeCaptureDetailMap[mainCaptureKey].x = this.getInitValue(
            "syncFastBscanIndex",
            mainCaptureKey,
            this.changeCaptureDetailMap[mainCaptureKey].dim_fast
          );
        }
      }
    },
    saveSelectCaptureMap() {
      this.selectCaptureMap = {};
      const selectDataStore = useSelectDataStoreHook();
      const { ouSelectedKeys, changeSelectedKeys } = selectDataStore;
      for (const key in this.ouCaptureDetailMap) {
        if (ouSelectedKeys.includes(key)) {
          this.selectCaptureMap[key] = this.ouCaptureDetailMap[key];
        }
      }
      for (const key in this.changeCaptureDetailMap) {
        if (changeSelectedKeys.includes(key)) {
          this.selectCaptureMap[key] = this.changeCaptureDetailMap[key];
        }
      }
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "analysisMultipleCommon",
        paths: [
          "ouCaptureDetailMap",
          "changeCaptureDetailMap",
          "selectCaptureMap"
        ]
      }
    ]
  }
});

export function useAnalysisMultipleCommonStoreHook() {
  return useAnalysisMultipleCommonStore(store);
}
