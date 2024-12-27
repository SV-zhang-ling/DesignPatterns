import { defineStore } from "pinia";
import { store } from "@/store";
import { buildQueryString } from "@/utils";
import { CAPTURE_URL_PRE } from "@/utils/constant";
import {
  AnalysisModeEnum,
  ContainerNameEnum,
  ContextmenuTypeEnum,
  AxisEnum
} from "@/enums";
import {
  useAnalysisMultipleCommonStoreHook,
  CaptureDetailWithKey,
  CaptureDetailMap
} from "@/views/analysis/store/analysisMultipleCommon";
import { useBasicInfoStoreHook } from "@/views/analysis/components/store/basicInfo";
import {
  fetchLayers,
  freeMultipleMemeory,
  fetchSurface
} from "@/utils/tools/segmentation";
import router from "@/router";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { fetchPosteriorAngioLayer, fetchPosteriorSurface } from "@/api/layer";
import { getBscanZoomRuler } from "@/utils/tools/bscanZoomRuler";

/**
 * multiple data of angiography store
 */
export interface MultipleAngioState {
  showAngio: boolean;
  showBscanPosOnActiveLine: boolean;
  ouActiveLayer: string;
  ouActiveLayerName: string;
  changeActiveLayer: string;
  changeActiveLayerName: string;
  angioProcessorType: string;
  surfaceLoading: boolean;
  zoomTarget: null | HTMLElement;
}

export const useMultipleAngioStore = defineStore({
  id: "multipleAngio",
  state: (): MultipleAngioState => {
    return {
      showAngio: true,
      showBscanPosOnActiveLine: true,
      ouActiveLayer: "0",
      ouActiveLayerName: "Retina",
      changeActiveLayer: "0",
      changeActiveLayerName: "Retina",
      angioProcessorType: ContextmenuTypeEnum.Gray,
      surfaceLoading: true,
      zoomTarget: null
    };
  },
  getters: {
    activeLayer(state: MultipleAngioState) {
      return router.currentRoute.value.query.m === AnalysisModeEnum.OU
        ? state.ouActiveLayer
        : state.changeActiveLayer;
    },
    captureDetailMap() {
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      return router.currentRoute.value.query.m === AnalysisModeEnum.OU
        ? analysisMultipleCommonStore.ouCaptureDetailMap
        : analysisMultipleCommonStore.changeCaptureDetailMap;
    },
    // currentReferencePos: () => {
    //   return (item: CaptureDetailWithKey) => {
    //     return item.referencePosSet[
    //       item.activeSlice === -1 ? 0 : item.activeSlice
    //     ];
    //   };
    // },
    projRect: (state: MultipleAngioState) => {
      return (item: CaptureDetailWithKey) => {
        const {
          ceilingShift,
          floorShift,
          ceilingSurf,
          floorSurf,
          angioSmartBC
        } = item;
        const extraDynamicParams = buildQueryString({
          angioLayer:
            router.currentRoute.value.query.m === AnalysisModeEnum.OU
              ? state.ouActiveLayer
              : state.changeActiveLayer,
          ceilingShift,
          floorShift,
          ceilingSurf,
          floorSurf,
          smartBC: angioSmartBC
        });
        return {
          width: item.dim_fast,
          height: item.dim_slow,
          transform: item.xform_enface,
          spacing: [item.spacingX_um, item.spacingY_um],
          src: `${CAPTURE_URL_PRE}/angio/projection?captureKey=${item.captureKey}&${extraDynamicParams}`
        };
      };
    },
    slowBscanRect: () => {
      return (item: CaptureDetailWithKey) => {
        return {
          width: item.dim_axial,
          height: item.dim_fast,
          transform: item.xform_slow,
          src: `${CAPTURE_URL_PRE}/oct/bscan?captureKey=${
            item.captureKey
          }&slice=${item.y}&axis=${AxisEnum.SLOW}&smooth=${
            item.bscanSmooth
          }&encoder=${item.bscanZooming ? "png" : "jpg"}&quality=${
            item.bscanZooming ? 95 : 30
          }&smartBC=${item.slowBscanMainSmartBC}`,
          angio: `${CAPTURE_URL_PRE}/angio/bscan?captureKey=${item.captureKey}&slice=${item.y}&axis=${AxisEnum.SLOW}`
        };
      };
    }
  },
  actions: {
    setAngioProcessorType(type: string, captureKey: string) {
      const basicInfoStore = useBasicInfoStoreHook();
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const mapList = this.captureDetailMap;
      if (
        captureKey !== analysisMultipleCommonStore.activeCaptureCard?.captureKey
      )
        return;

      if (basicInfoStore.colorMode && basicInfoStore.isSynchronize) {
        // 同步更新
        for (const key in mapList) {
          mapList[key].angioProcessorType = type;
        }
      } else {
        analysisMultipleCommonStore.activeCaptureCard.angioProcessorType = type;
      }
    },
    setBscanProcessorType(type: string, captureKey: string) {
      const basicInfoStore = useBasicInfoStoreHook();
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const mapList = this.captureDetailMap;
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
    setBscanSmooth(type: string, captureKey: string) {
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const mapList = this.captureDetailMap;

      if (
        captureKey !== analysisMultipleCommonStore.activeCaptureCard?.captureKey
      )
        return;
      for (const key in mapList) {
        mapList[key].bscanSmooth = type;
      }
    },
    async bscanZoomRuler({
      innerContainerDom,
      componentName,
      captureKey
    }: {
      innerContainerDom: HTMLElement;
      componentName: ContainerNameEnum;
      captureKey?: string;
    }) {
      const {
        width,
        height,
        value: scale
      } = await getBscanZoomRuler({
        innerContainerDom,
        aspectRatioFactor: 0.4
      });
      const mapList = this.captureDetailMap;
      if (captureKey) {
        mapList[captureKey].slowBscanZoomRatio =
          scale ?? mapList[captureKey].slowBscanZoomRatio;
        mapList[captureKey].slowBscanZoomRulerHeight =
          height ?? mapList[captureKey].slowBscanZoomRulerHeight;
        mapList[captureKey].slowBscanZoomRulerWidth =
          width ?? mapList[captureKey].slowBscanZoomRulerWidth;
      }
    },
    // 血流层操作
    async getPosteriorAngioLayer(item: CaptureDetailWithKey) {
      const layers = await fetchLayers(
        { captureKey: item.captureKey },
        fetchPosteriorAngioLayer
      );
      if (!layers) return;

      this.setAngioLayerInfo(item, layers as Array<SurfaceInfoType>);
    },
    setAngioLayerInfo(
      item: CaptureDetailWithKey,
      data: Array<SurfaceInfoType>
    ) {
      item.angioSurfaceInfoArr = data;

      const angioRetinaLayer = data?.[Number(this.activeLayer)]; // 获取默认分层数据
      item = {
        ...item,
        ...angioRetinaLayer
      };

      this.captureDetailMap[item.captureKey] = item;
      this.getPosteriorSurface(item);
    },
    async setAngioLayer() {
      // 全部数据都要更新
      const mapList = this.captureDetailMap;
      for (const key in mapList) {
        await this.getPosteriorSurface(mapList[key]);
      }
    },
    // surface 获取
    async getPosteriorSurface(item: CaptureDetailWithKey) {
      this.surfaceLoading = true;
      const mapList = this.captureDetailMap;
      freeMultipleMemeory(mapList); // 请求之前需要预清除上次mat缓存

      const { captureKey, dim_slow, dim_fast, angioSurfaceInfoArr } = item;
      const surfaceInfo = angioSurfaceInfoArr?.[Number(this.activeLayer)];
      if (!surfaceInfo) return;

      if (dim_slow && dim_fast) {
        const { ceilingSurf, floorSurf } = surfaceInfo;
        const commonParams = {
          captureKey,
          col: dim_slow,
          row: dim_fast
        };
        const fetches = [
          fetchSurface({
            ...commonParams,
            surf: ceilingSurf,
            surfType: "ceilingSurfMat",
            fetchSurfaceApi: fetchPosteriorSurface
          }),
          fetchSurface({
            ...commonParams,
            surf: floorSurf,
            surfType: "floorSurfMat",
            fetchSurfaceApi: fetchPosteriorSurface
          })
        ];

        Promise.all(fetches)
          .then(results => {
            window[captureKey] = {
              ceilingSurfMat: [],
              floorSurfMat: []
            };
            if (results && results.length == 2) {
              results.findIndex(x => x.surfType === "ceilingSurfMat");
              window[captureKey]["ceilingSurfMat"] =
                results[
                  results.findIndex(x => x.surfType === "ceilingSurfMat")
                ].data;
              window[captureKey]["floorSurfMat"] =
                results[
                  results.findIndex(x => x.surfType === "floorSurfMat")
                ].data;
              this.surfaceLoading = false;
            }
          })
          .catch(error => {
            this.surfaceLoading = false;
            console.error(error); // 'Error'
          });
      }
    },
    resetPosteriorSurface() {
      const mapList = this.captureDetailMap;
      for (const key in mapList) {
        this.getPosteriorSurface(mapList[key]);
      }
    },
    async commitCrosshairPosition({
      x,
      y,
      captureKey
    }: {
      x?: number;
      y?: number;
      captureKey: string;
    }) {
      const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
      const item = analysisMultipleCommonStore.captureDetail(captureKey);
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const basicInfoStore = useBasicInfoStoreHook();
      const { isSynchronize, xAxisLinkage, yAxisLinkage } = basicInfoStore;
      const xOffset = x ? x - item.x : 0;
      const yOffset = y ? y - item.y : 0;
      // change数据同步
      if (
        router.currentRoute.value.query.m === AnalysisModeEnum.Change &&
        isSynchronize &&
        (xAxisLinkage || yAxisLinkage)
      ) {
        // 判断是否支持继续拖动，有无导航线到达边界
        const { xFlag, yFlag } = await this.isAllowMove(
          analysisMultipleCommonStore.changeCaptureDetailMap,
          xOffset,
          yOffset
        );
        if (!xFlag) {
          for (const key in analysisMultipleCommonStore.changeCaptureDetailMap) {
            basicInfoStore.yAxisLinkage &&
              (analysisMultipleCommonStore.changeCaptureDetailMap[key].x =
                analysisMultipleCommonStore.changeCaptureDetailMap[key].x +
                xOffset);
          }
        }
        if (!yFlag) {
          for (const key in analysisMultipleCommonStore.changeCaptureDetailMap) {
            basicInfoStore.xAxisLinkage &&
              (analysisMultipleCommonStore.changeCaptureDetailMap[key].y =
                analysisMultipleCommonStore.changeCaptureDetailMap[key].y +
                yOffset);
          }
        }
        if (!xAxisLinkage) {
          item.y = y ?? item.y;
        }
        if (!yAxisLinkage) {
          item.x = x ?? item.x;
        }
      } else {
        item.x = x ?? item.x;
        item.y = y ?? item.y;
      }
      // 同步/异步处理，主数据更改同步到单眼数据
      const mainCaptureKey = router.currentRoute.value.query
        .captureKey as string;
      if (captureKey === mainCaptureKey) {
        analysisCommonStore.syncSlowBscanIndex = item.y;
        analysisCommonStore.syncFastBscanIndex = item.x;
      }
      analysisMultipleCommonStore.saveSelectCaptureMap();
    },
    setBrightnessContrast({
      captureKey,
      angioB,
      angioC,
      slowBscanB,
      slowBscanC
    }: {
      captureKey: string;
      angioB?: number;
      angioC?: number;
      slowBscanB?: number;
      slowBscanC?: number;
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
      mapList[captureKey].angioBrightness =
        angioB ?? mapList[captureKey].angioBrightness;
      mapList[captureKey].angioContrast =
        angioC ?? mapList[captureKey].angioContrast;
      mapList[captureKey].slowBscanBrightness =
        slowBscanB ?? mapList[captureKey].slowBscanBrightness;
      mapList[captureKey].slowBscanContrast =
        slowBscanC ?? mapList[captureKey].slowBscanContrast;
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
        case ContainerNameEnum.AngioProj:
          item.angioSmartBC = smartBC;
          break;
        case ContainerNameEnum.SloOct:
        case ContainerNameEnum.FullScope:
        case ContainerNameEnum.OCTScope:
          item.sloSmartBC = smartBC;
          break;
        case ContainerNameEnum.SlowBScanMain:
          item.slowBscanMainSmartBC = smartBC;
          break;
        case ContainerNameEnum.SlowBScanAttach:
          item.slowBscanAttachSmartBC = smartBC;
          break;
        case ContainerNameEnum.FastBScan:
          item.fastBscanSmartBC = smartBC;
          break;
        default:
          throw new Error(`No such image type: ${imageType}`);
      }
    },
    resetProcessorType(type: string) {
      const basicInfoStore = useBasicInfoStoreHook();
      const mapList = this.captureDetailMap;

      if (basicInfoStore.colorMode && basicInfoStore.isSynchronize) {
        // 同步更新
        for (const key in mapList) {
          mapList[key].bscanProcessorType = type;
          mapList[key].angioProcessorType = type;
        }
      }
    },
    isAllowMove(
      list: CaptureDetailMap<CaptureDetailWithKey>,
      xOffset: number,
      yOffset: number
    ) {
      let xFlag = false;
      let yFlag = false;
      for (const key in list) {
        if (
          list[key].x + xOffset < 0 ||
          list[key].x + xOffset > list[key].dim_fast - 1
        ) {
          xFlag = true;
        }
        if (
          list[key].y + yOffset < 0 ||
          list[key].y + yOffset > list[key].dim_slow - 1
        ) {
          yFlag = true;
        }
      }
      return { xFlag, yFlag };
    }
  }
});

export function useMultipleAngioStoreHook() {
  return useMultipleAngioStore(store);
}
