import { defineStore } from "pinia";
import { store } from "@/store";
import { getAnalysisRouteQuery } from "@/utils/route";
import { GeneralResult } from "@/api/types.d";
import { queryCaptureDetail } from "@/api/patient";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { useAdvancedSegStoreHook } from "@/views/analysis/posterior/advancedSeg/store/advancedSeg";
import { useLineScanStoreHook } from "@/views/analysis/lineScan/single/store/index";
import { useStructuralProjStoreHook } from "../structuralProj/store";
import { useCubeStoreHook } from "../cube/store";
import { fetchSurface } from "@/utils/tools/segmentation";
import { isONHScanProtocol } from "@/utils/protocol";
import router from "@/router";
import { fetchPosteriorSurface } from "@/api/layer";

const angioStore = useAngioStoreHook();
const lineScanStore = useLineScanStoreHook();
const advancedSegStore = useAdvancedSegStoreHook();
const structuralProjStore = useStructuralProjStoreHook();
const cubeStore = useCubeStoreHook();

export interface CaptureDetail {
  averagedFramesPerSlice?: number[];
  captureTime?: string;
  depth_mm?: number;
  dim_axial: number;
  dim_fast: number;
  dim_slow: number;
  dim_slo?: number;
  oculusType?: string;
  protocolName?: string;
  repeat?: number;
  signalStrength?: number;
  softwareVersion?: string;
  spacingX_um: number;
  spacingY_um: number;
  spacingZ_um: number;
  topBoundary: number;
  downBoundary: number;
  xform_enface?: number[];
  xform_fast?: number[];
  xform_slo?: number[];
  xform_slow?: number[];
  lineScanLength_mm?: number;
  optimalSmooth: string;
  rotation_deg: number;
  sn: string;
}

export interface AnalysisCommonState extends CaptureDetail, Point {
  captureKey: string;
  patientID: string;
  captureTime: string;
  captureID: string;
  oculusType: string;
  ip: string;
  path: string;
  slo_width: number;
  slo_height: number;
  syncSlowBscanIndex: number; // keep the slow bscan index
  syncFastBscanIndex: number; // keep the fast bscan index
  manualLayerTimestamp: number; // 手动更新层的时间戳
  lineActiveIndex: number;
}

export const useAnalysisCommonStore = defineStore({
  id: "analysisCommon",
  state: (): AnalysisCommonState => ({
    x: 100,
    y: 200,
    captureKey: "",
    patientID: "",
    captureTime: "",
    captureID: "",
    oculusType: "",
    ip: "",
    /*** capture detail info */
    averagedFramesPerSlice: [],
    depth_mm: 0,
    dim_axial: 0,
    dim_fast: 0,
    dim_slow: 0,
    dim_slo: 0,
    protocolName: "",
    path: "",
    repeat: 0,
    signalStrength: 0,
    softwareVersion: "",
    spacingX_um: 0,
    spacingY_um: 0,
    spacingZ_um: 0,
    topBoundary: 0,
    xform_enface: [],
    xform_fast: [],
    xform_slo: [],
    xform_slow: [],
    slo_width: 1000,
    slo_height: 1000,
    lineScanLength_mm: undefined,
    optimalSmooth: "",
    rotation_deg: 0,
    downBoundary: 0,
    sn: "",
    /*** capture detail info */
    syncSlowBscanIndex: -1, // -1表示值为空(避免TypeError报错)
    syncFastBscanIndex: -1, // -1表示值为空
    manualLayerTimestamp: 0, // 手动更新层的时间戳
    lineActiveIndex: -1 // 记录线扫页面当前bscan slice
  }),
  actions: {
    initInfoByRoute() {
      // 页面加载时初始化路由参数
      this.$state = {
        ...this.$state,
        ...getAnalysisRouteQuery()
      };
    },
    updateManualLayerTimestamp(timestamp: number) {
      this.manualLayerTimestamp = timestamp;
    },
    setDownBoundary(value: number) {
      this.downBoundary = value;
    },
    setLineActiveSliceIndex(index: number) {
      this.lineActiveIndex = index;
    },
    async computedDownBoundary() {
      // 重新以脉络膜层为底计算分层线 代码暂时保留。后期可作为前端自主动态
      // 控制有效视野范围的参考
      const {
        captureKey,
        dim_slow: col,
        dim_fast: row,
        setDownBoundary,
        protocolName
      } = this;
      if (isONHScanProtocol(protocolName)) return;
      const commonParams = {
        captureKey,
        col,
        row
      };
      const res = await fetchSurface({
        ...commonParams,
        surf: 9, // 脉络膜层为底
        surfType: "floorSurfMat",
        fetchSurfaceApi: fetchPosteriorSurface
      });
      const {
        data: [mat]
      } = res;
      const { maxVal } = cv.minMaxLoc(mat);
      setDownBoundary(maxVal);
    },
    async initPageInfo() {
      this.initInfoByRoute();
      const captureKey =
        this.$state.captureKey ?? router.currentRoute.value.query.captureKey;
      try {
        const res = await queryCaptureDetail({ captureKey });
        if (!res) return;

        const { data } = <GeneralResult<CaptureDetail>>res;
        if (!data) return false;

        // "captureTime" in data && delete data.captureTime;
        this.$state = {
          ...this.$state,
          ...data,
          x:
            this.syncFastBscanIndex === -1
              ? Math.floor(data.dim_fast / 2)
              : this.syncFastBscanIndex,
          y:
            this.syncSlowBscanIndex === -1
              ? Math.floor(data.dim_slow / 2)
              : this.syncSlowBscanIndex
        };
        // 暂时取消以脉络膜层作为下边界的控制行为，仍然保持原来的BM层+200的计算方式
        // await this.computedDownBoundary();
        this.initSmoothInContextmenu();
        angioStore.bscanSmooth = data.optimalSmooth;
        lineScanStore.bscanSmooth = data.optimalSmooth;
        advancedSegStore.bscanSmooth = data.optimalSmooth;
        structuralProjStore.bscanSmooth = data.optimalSmooth;
        cubeStore.bscanSmooth = data.optimalSmooth;
        return true;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    initSmoothInContextmenu() {
      const contextmenuStore = useContextmenuStoreHook();
      contextmenuStore.$reset();
      contextmenuStore.syncSmoothStatus(this.optimalSmooth);
    },
    clearSaveInfo() {
      window.isAllSaveImages && window.location.reload();
    }
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "analysisCommon",
        paths: ["syncSlowBscanIndex", "syncFastBscanIndex"]
      }
    ]
  }
});

export function useAnalysisCommonStoreHook() {
  return useAnalysisCommonStore(store);
}
