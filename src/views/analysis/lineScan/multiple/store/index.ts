import { defineStore } from "pinia";
import { store } from "@/store";
import router from "@/router";
import { buildQueryString } from "@/utils";
import { CAPTURE_URL_PRE } from "@/utils/constant";
import {
  AnalysisModeEnum,
  AxisEnum,
  ContainerNameEnum,
  KeydownEnum
} from "@/enums";
import {
  useAnalysisMultipleCommonStoreHook,
  CaptureDetailWithKey,
  CaptureDetailMap
} from "@/views/analysis/store/analysisMultipleCommon";
import { isAnteriorScan, isStarScanData } from "@/utils/protocol";
import { useBasicInfoStoreHook } from "@/views/analysis/components/store/basicInfo";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { getBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";

/**
 * multiple data of line scan store
 */

export interface MultipleLineScanState {
  showBscanPosOnActiveLine: boolean;
  corrected: number;
  surfLoading: boolean;
}

export const useMultipleLineScanStore = defineStore({
  id: "multipleLineScan",
  state: (): MultipleLineScanState => {
    return {
      showBscanPosOnActiveLine: true,
      corrected: 1, // 前节Bscan是否需要校正
      surfLoading: false
    };
  },
  getters: {
    currentReferencePos: () => {
      return (item: CaptureDetailWithKey) => {
        return item.referencePosSet[
          item.activeSlice === -1 ? 0 : item.activeSlice
        ];
      };
    },
    sloRect: () => {
      return (item: CaptureDetailWithKey) => ({
        width: item.slo_width,
        height: item.slo_height,
        transform: item.xform_slo,
        src: `${CAPTURE_URL_PRE}/slo?captureKey=${item.captureKey}&smartBC=${item.sloSmartBC}`
      });
    },
    enfaceRect: () => {
      return (item: CaptureDetailWithKey) => {
        return {
          width: item.dim_fast,
          height: isStarScanData(item.protocolName)
            ? item.dim_slow
            : item.dim_slow === 1
            ? 1
            : item.dim_slow - 1,
          transform: item.xform_enface,
          n: item.dim_slow, //  线的条数
          spacingX: item.spacingX_um,
          spacingY: item.spacingY_um,
          rotate: item.rotation_deg
        };
      };
    },
    bscanSrc: (state: MultipleLineScanState) => {
      return (item: CaptureDetailWithKey) => {
        const params: {
          captureKey: string;
          axis: AxisEnum;
          encoder: string;
          quality: number;
          smooth: string;
          smartBC: number;
          slice: number;
          corrected?: number;
        } = {
          captureKey: item.captureKey,
          axis: AxisEnum.SLOW,
          encoder: "jpg",
          quality: 60,
          smooth: item.bscanSmooth,
          smartBC: item.bscanSmartBC,
          slice:
            item.activeSlice === -1
              ? Math.floor(item.dim_slow / 2)
              : item.activeSlice
        };
        isAnteriorScan(item.protocolName) &&
          (params.corrected = state.corrected);
        const srcParams = buildQueryString(params);
        return `${CAPTURE_URL_PRE}/oct/bscan?${srcParams}`;
      };
    }
  },
  actions: {
    async setActiveBscanSlice(slice: number, item: CaptureDetailWithKey) {
      const basicInfoStore = useBasicInfoStoreHook();
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const mainCaptureKey = router.currentRoute.value.query
        .captureKey as string;
      if (
        basicInfoStore.analysisMode === AnalysisModeEnum.Change &&
        basicInfoStore.xAxisLinkage &&
        basicInfoStore.isSynchronize
      ) {
        // 同步更新，根据步长更新
        const step = slice - item.activeSlice;
        const mapList = analysisMultipleCommonStore.changeCaptureDetailMap;
        const flag = await this.checkSlice(mapList, step);
        if (!flag) {
          for (const key in mapList) {
            mapList[key].activeSlice += step;
          }
        }
      } else {
        if (
          item.captureKey !==
          analysisMultipleCommonStore.activeCaptureCard?.captureKey
        )
          return;
        item.activeSlice = slice;
      }
      // 主数据syncSlowBscanIndex与单眼数据保持一致
      analysisCommonStore.syncSlowBscanIndex =
        basicInfoStore.analysisMode === AnalysisModeEnum.OU
          ? analysisMultipleCommonStore.ouCaptureDetailMap[mainCaptureKey]
              .activeSlice
          : analysisMultipleCommonStore.changeCaptureDetailMap[mainCaptureKey]
              .activeSlice;
      analysisMultipleCommonStore.saveSelectCaptureMap();
    },
    async setActiveSliceByKeydown(direction: string, key: string | undefined) {
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const basicInfoStore = useBasicInfoStoreHook();
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const mainCaptureKey = router.currentRoute.value.query
        .captureKey as string;
      if (
        basicInfoStore.analysisMode === AnalysisModeEnum.Change &&
        basicInfoStore.xAxisLinkage &&
        basicInfoStore.isSynchronize
      ) {
        // 同步更新
        const mapList = analysisMultipleCommonStore.changeCaptureDetailMap;
        if (key !== mainCaptureKey) return;
        const step = direction === KeydownEnum.UP ? -1 : 1;
        const flag = await this.checkSlice(mapList, step);
        if (!flag) {
          for (const key in mapList) {
            mapList[key].activeSlice += step;
          }
          analysisCommonStore.syncSlowBscanIndex =
            mapList[mainCaptureKey].activeSlice;
        }
      } else {
        if (!analysisMultipleCommonStore.activeCaptureCard) return;
        if (
          analysisMultipleCommonStore.activeCaptureCard &&
          key != analysisMultipleCommonStore.activeCaptureCard.captureKey
        )
          return;
        if (
          direction === KeydownEnum.UP &&
          analysisMultipleCommonStore.activeCaptureCard.activeSlice > 0
        ) {
          analysisMultipleCommonStore.activeCaptureCard.activeSlice -= 1;
        }
        if (
          direction === KeydownEnum.DOWN &&
          analysisMultipleCommonStore.activeCaptureCard.activeSlice <
            analysisMultipleCommonStore.activeCaptureCard.dim_slow - 1
        ) {
          analysisMultipleCommonStore.activeCaptureCard.activeSlice += 1;
        }
        if (
          analysisMultipleCommonStore.activeCaptureCard.captureKey ===
          mainCaptureKey
        )
          analysisCommonStore.syncSlowBscanIndex =
            analysisMultipleCommonStore.activeCaptureCard.activeSlice;
      }
      analysisMultipleCommonStore.saveSelectCaptureMap();
    },
    async setReferencePos(pos: number, item: CaptureDetailWithKey) {
      const basicInfoStore = useBasicInfoStoreHook();
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const step = pos - this.currentReferencePos(item);
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const mainCaptureKey = router.currentRoute.value.query
        .captureKey as string;
      if (
        basicInfoStore.analysisMode === AnalysisModeEnum.Change &&
        basicInfoStore.yAxisLinkage &&
        basicInfoStore.isSynchronize
      ) {
        // 同步更新
        const analysisMultipleCommonStore =
          useAnalysisMultipleCommonStoreHook();
        const mapList = analysisMultipleCommonStore.changeCaptureDetailMap;
        const flag = await this.checkPos(mapList, step);
        if (!flag) {
          for (const key in mapList) {
            mapList[key].referencePosSet[
              mapList[key].activeSlice === -1 ? 0 : mapList[key].activeSlice
            ] = this.currentReferencePos(mapList[key]) + step;
          }
          analysisCommonStore.syncFastBscanIndex = this.currentReferencePos(
            mapList[mainCaptureKey]
          );
        }
      } else {
        item.referencePosSet[item.activeSlice === -1 ? 0 : item.activeSlice] =
          pos;
        if (item.captureKey === mainCaptureKey) {
          analysisCommonStore.syncFastBscanIndex = pos;
        }
      }
      analysisMultipleCommonStore.saveSelectCaptureMap();
    },
    async bscanZoomRuler({
      innerContainerDom,
      componentName
    }: {
      innerContainerDom: HTMLElement;
      componentName: ContainerNameEnum;
    }) {
      const {
        width,
        height,
        value: scale
      } = await getBscanZoomRuler({
        innerContainerDom,
        aspectRatioFactor: 0.4
      });
      const basicInfoStore = useBasicInfoStoreHook();
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const mapList =
        basicInfoStore.analysisMode === AnalysisModeEnum.OU
          ? analysisMultipleCommonStore.ouCaptureDetailMap
          : analysisMultipleCommonStore.changeCaptureDetailMap;
      const captureKey =
        analysisMultipleCommonStore.activeCaptureCard?.captureKey;
      if (captureKey) {
        mapList[captureKey].lineBscanZoomRatio =
          scale ?? mapList[captureKey].lineBscanZoomRatio;
        mapList[captureKey].lineBscanZoomRulerHeight =
          height ?? mapList[captureKey].lineBscanZoomRulerHeight;
        mapList[captureKey].lineBscanZoomRulerWidth =
          width ?? mapList[captureKey].lineBscanZoomRulerWidth;
      } else {
        for (const key in mapList) {
          mapList[key].lineBscanZoomRatio =
            scale ?? mapList[key].lineBscanZoomRatio;
          mapList[key].lineBscanZoomRulerHeight =
            height ?? mapList[key].lineBscanZoomRulerHeight;
          mapList[key].lineBscanZoomRulerWidth =
            width ?? mapList[key].lineBscanZoomRulerWidth;
        }
      }
    },
    setBrightnessContrast({
      captureKey,
      sloB,
      sloC,
      bscanB,
      bscanC
    }: {
      captureKey: string;
      sloB?: number;
      sloC?: number;
      bscanB?: number;
      bscanC?: number;
    }) {
      const basicInfoStore = useBasicInfoStoreHook();
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const mapList =
        basicInfoStore.analysisMode === AnalysisModeEnum.OU
          ? analysisMultipleCommonStore.ouCaptureDetailMap
          : analysisMultipleCommonStore.changeCaptureDetailMap;
      if (
        captureKey !== analysisMultipleCommonStore.activeCaptureCard?.captureKey
      )
        return;
      mapList[captureKey].sloBrightness =
        sloB ?? mapList[captureKey].sloBrightness;
      mapList[captureKey].sloContrast = sloC ?? mapList[captureKey].sloContrast;
      mapList[captureKey].bscanBrightness =
        bscanB ?? mapList[captureKey].bscanBrightness;
      mapList[captureKey].bscanContrast =
        bscanC ?? mapList[captureKey].bscanContrast;
    },
    setBscanProcessorType(type: string, captureKey: string) {
      const basicInfoStore = useBasicInfoStoreHook();
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const mapList =
        basicInfoStore.analysisMode === AnalysisModeEnum.OU
          ? analysisMultipleCommonStore.ouCaptureDetailMap
          : analysisMultipleCommonStore.changeCaptureDetailMap;
      if (
        captureKey !== analysisMultipleCommonStore.activeCaptureCard?.captureKey
      )
        return;
      if (basicInfoStore.colorMode && basicInfoStore.isSynchronize) {
        // 同步更新
        for (const key in mapList) {
          mapList[key].bscanProcessorType = type;
        }
      } else {
        analysisMultipleCommonStore.activeCaptureCard.bscanProcessorType = type;
      }
    },
    resetBscanProcessorType(type: string) {
      const basicInfoStore = useBasicInfoStoreHook();
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const mapList =
        basicInfoStore.analysisMode === AnalysisModeEnum.OU
          ? analysisMultipleCommonStore.ouCaptureDetailMap
          : analysisMultipleCommonStore.changeCaptureDetailMap;
      if (basicInfoStore.colorMode && basicInfoStore.isSynchronize) {
        // 同步更新
        for (const key in mapList) {
          mapList[key].bscanProcessorType = type;
        }
      }
    },
    updateSmartBC({
      imageType,
      smartBC,
      item
    }: {
      imageType: string;
      smartBC: number;
      item: CaptureDetailWithKey;
    }) {
      switch (imageType) {
        case ContainerNameEnum.LineScanSLO:
          item.sloSmartBC = smartBC;
          break;
        case ContainerNameEnum.LineScanBscan:
          item.bscanSmartBC = smartBC;
          break;
        default:
          throw new Error(`No such image type: ${imageType}`);
      }
    },
    checkSlice(list: CaptureDetailMap<CaptureDetailWithKey>, step: number) {
      let flag = false;
      for (const key in list) {
        if (
          (step < 0 && list[key].activeSlice === 0) ||
          (step > 0 && list[key].activeSlice === list[key].dim_slow - 1)
        ) {
          flag = true;
        }
      }
      return flag;
    },
    checkPos(list: CaptureDetailMap<CaptureDetailWithKey>, step: number) {
      let flag = false;
      for (const key in list) {
        if (
          (step < 0 && this.currentReferencePos(list[key]) <= Math.abs(step)) ||
          (step > 0 &&
            this.currentReferencePos(list[key]) >= list[key].dim_fast - step)
        ) {
          flag = true;
        }
      }
      return flag;
    }
  }
});

export function useMultipleLineScanStoreHook() {
  return useMultipleLineScanStore(store);
}
