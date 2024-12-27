<template>
  <div
    v-if="saveImageStore.showSloBscan"
    class="slo-bscan-container"
    :style="{
      width: `${saveImageStore.bscanHeight + saveImageStore.bscanWidth}px`,
      height: `${saveImageStore.bscanHeight}px`
    }"
  >
    <el-row class="row images">
      <div :style="{ width: `${saveImageStore.bscanHeight}px` }">
        <slo-viewer
          v-if="
            saveImageStore.targetName === ContainerNameEnum.SaveLineScanBscan &&
            router.currentRoute.value.path === PageRoute.LineScan
          "
          :image-type="ContainerNameEnum.SaveLineScanSLO"
          :slo="lineScanStore.sloRect"
          :enface="lineScanStore.enfaceRect"
          :showSmartBc="false"
          :activeSlice="lineScanStore.activeSlice"
          :currentReferencePos="lineScanStore.currentReferencePos"
          :showBscanPosOnActiveLine="lineScanStore.showBscanPosOnActiveLine"
          :smart-bc="lineScanStore.sloSmartBC"
          :brightness="lineScanStore.sloBrightness"
          :contrast="lineScanStore.sloContrast"
          :isStarScan="isStarScan"
          :isCubeData="isCubeData"
          :showDirection="isAS"
          :oculusType="analysisCommonStore.oculusType"
          :arrowDeg="
            analysisCommonStore.oculusType === OculusTypeEnum.OD ? 0 : 180
          "
        />
        <slo-viewer
          v-else-if="
            saveImageStore.targetName === ContainerNameEnum.SaveLineScanBscan &&
            router.currentRoute.value.path === PageRoute.MultipleLineScan
          "
          :image-type="ContainerNameEnum.SaveLineScanSLO"
          :slo="multipleLineScanStore.sloRect(captureDetail)"
          :enface="multipleLineScanStore.enfaceRect(captureDetail)"
          :showSmartBc="false"
          :activeSlice="captureDetail.activeSlice"
          :currentReferencePos="
            multipleLineScanStore.currentReferencePos(captureDetail)
          "
          :showBscanPosOnActiveLine="
            multipleLineScanStore.showBscanPosOnActiveLine
          "
          :smart-bc="captureDetail.sloSmartBC"
          :brightness="captureDetail.sloBrightness"
          :contrast="captureDetail.sloContrast"
          :isStarScan="isStarScanData(captureDetail.protocolName)"
          :isCubeData="isCubeScan(captureDetail.protocolName)"
          :showDirection="isAnteriorScan(captureDetail.protocolName)"
          :oculusType="captureDetail.oculusType"
          :arrowDeg="captureDetail.oculusType === OculusTypeEnum.OD ? 0 : 180"
        />
        <FullScope
          v-else
          :slo="
            [PageRoute.Angiography, PageRoute.AngioRetinaEnhanced].includes(
              router.currentRoute.value.path
            )
              ? angioSlo
              : router.currentRoute.value.path ===
                PageRoute.StructuralProjection
              ? structuralProjSlo
              : router.currentRoute.value.path === PageRoute.AdvancedSeg
              ? advancedSegSlo
              : null
          "
          :oct="
            [PageRoute.Angiography, PageRoute.AngioRetinaEnhanced].includes(
              router.currentRoute.value.path
            )
              ? angioOct
              : router.currentRoute.value.path ===
                PageRoute.StructuralProjection
              ? structuralProjOct
              : router.currentRoute.value.path === PageRoute.AdvancedSeg
              ? advancedSegOct
              : null
          "
          :x="analysisCommonStore.x"
          :y="analysisCommonStore.y"
          :spacing="[
            analysisCommonStore.spacingX_um,
            analysisCommonStore.spacingY_um
          ]"
          :image-type="ContainerNameEnum.SaveSlo"
          :showSmartBc="false"
          :processorsType="currentStore?.octProcessorType"
          :opacity="0"
          :brightness="currentStore?.sloBrightness"
          :contrast="currentStore?.sloContrast"
          :smart-bc="currentStore?.sloSmartBC"
          v-bind="$attrs"
        />
      </div>
      <div :style="{ width: `${saveImageStore.bscanWidth}px` }">
        <slow-bscan
          v-if="
            saveImageStore.targetName === ContainerNameEnum.SaveSlowBScanMain
          "
          :bscan-type="ContainerNameEnum.SaveSlowBScanMain"
          :showSmartBc="false"
          v-bind="angioStore.slowRect"
          :aspectRatioFactor="0.4"
          :showAngio="angioStore.showAngio"
          :direction="AxisDirectionEnum.SLOW"
          :index="analysisCommonStore.y"
          :sum="analysisCommonStore.dim_slow"
          :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
          :repeat="analysisCommonStore.repeat"
          :zoomRatio="saveImageStore.bscanZoomRatio"
          :bscanZoomRulerHeight="saveImageStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="saveImageStore.bscanZoomRulerWidth"
          :x="analysisCommonStore.x"
          :y="analysisCommonStore.y"
          :brightness="angioStore.slowBscanBrightness"
          :contrast="angioStore.slowBscanContrast"
          :processorsType="angioStore.bscanProcessorType"
          :surfaceLoading="angioStore.surfaceLoading"
          :ceilingSurfPoints="angioStore.slowCeilingSurfPoints"
          :floorSurfPoints="angioStore.slowFloorSurfPoints"
          :smart-bc="angioStore.slowBscanMainSmartBC"
          :oculusType="analysisCommonStore.oculusType"
        />
        <slow-bscan
          v-if="
            saveImageStore.targetName === ContainerNameEnum.SaveOctSlowBscan
          "
          v-bind="structuralProjStore.slowRect"
          :showSmartBc="false"
          :bscan-type="ContainerNameEnum.SaveOctSlowBscan"
          :aspectRatioFactor="0.4"
          :showAngio="false"
          :direction="AxisDirectionEnum.SLOW"
          :index="analysisCommonStore.y"
          :sum="analysisCommonStore.dim_slow"
          :spacingZ_um="analysisCommonStore.spacingZ_um"
          :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
          :repeat="analysisCommonStore.repeat"
          :zoomRatio="saveImageStore.bscanZoomRatio"
          :bscanZoomRulerHeight="saveImageStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="saveImageStore.bscanZoomRulerWidth"
          :x="analysisCommonStore.x"
          :y="analysisCommonStore.y"
          :brightness="structuralProjStore.slowBscanBrightness"
          :contrast="structuralProjStore.slowBscanContrast"
          :processorsType="structuralProjStore.bscanProcessorType"
          :surfaceLoading="structuralProjStore.surfaceLoading"
          :ceilingShift="structuralProjStore.ceilingShift"
          :floorShift="structuralProjStore.floorShift"
          :smart-bc="angioStore.slowBscanMainSmartBC"
          :oculusType="analysisCommonStore.oculusType"
        />
        <slow-bscan
          v-if="
            saveImageStore.targetName === ContainerNameEnum.SaveSlowBScanAttach
          "
          :bscan-type="ContainerNameEnum.SaveSlowBScanAttach"
          :showSmartBc="false"
          v-bind="angioStore.slowRectAttach"
          :aspectRatioFactor="0.4"
          :showAngio="false"
          :index="analysisCommonStore.y"
          :sum="analysisCommonStore.dim_slow"
          :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
          :repeat="analysisCommonStore.repeat"
          :showFastBscan="angioStore.showFastBscan"
          :zoomRatio="saveImageStore.bscanZoomRatio"
          :bscanZoomRulerHeight="saveImageStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="saveImageStore.bscanZoomRulerWidth"
          :processorsType="angioStore.bscanProcessorType"
          :x="analysisCommonStore.x"
          :y="analysisCommonStore.y"
          :brightness="angioStore.fastBscanBrightness"
          :contrast="angioStore.fastBscanContrast"
          :surfaceLoading="angioStore.surfaceLoading"
          :ceilingSurfPoints="angioStore.slowCeilingSurfPoints"
          :floorSurfPoints="angioStore.slowFloorSurfPoints"
          :smart-bc="angioStore.slowBscanAttachSmartBC"
          :oculusType="analysisCommonStore.oculusType"
        />
        <fast-bscan
          v-if="saveImageStore.targetName === ContainerNameEnum.SaveFastBScan"
          :bscan-type="ContainerNameEnum.SaveFastBScan"
          :showSmartBc="false"
          v-bind="angioStore.fastRect"
          :aspectRatioFactor="0.4"
          :showAngio="angioStore.showAngio"
          :index="analysisCommonStore.x"
          :sum="analysisCommonStore.dim_fast"
          :zoomRatio="saveImageStore.bscanZoomRatio"
          :bscanZoomRulerHeight="saveImageStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="saveImageStore.bscanZoomRulerWidth"
          :y="analysisCommonStore.y"
          :x="analysisCommonStore.x"
          :brightness="angioStore.fastBscanBrightness"
          :contrast="angioStore.fastBscanContrast"
          :showFastBscan="angioStore.showFastBscan"
          :processorsType="angioStore.bscanProcessorType"
          :surfaceLoading="angioStore.surfaceLoading"
          :ceilingSurfPoints="angioStore.fastCeilingSurfPoints"
          :floorSurfPoints="angioStore.fastFloorSurfPoints"
          :smart-bc="angioStore.fastBscanSmartBC"
          :oculusType="analysisCommonStore.oculusType"
        />
        <fast-bscan
          v-if="
            saveImageStore.targetName === ContainerNameEnum.SaveOctFastBscan
          "
          v-bind="structuralProjStore.fastRect"
          :showSmartBc="false"
          :aspectRatioFactor="0.4"
          :bscan-type="ContainerNameEnum.SaveOctFastBscan"
          :index="analysisCommonStore.x"
          :sum="analysisCommonStore.dim_fast"
          :showAngio="false"
          :zoomRatio="saveImageStore.bscanZoomRatio"
          :bscanZoomRulerHeight="saveImageStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="saveImageStore.bscanZoomRulerWidth"
          :y="analysisCommonStore.y"
          :x="analysisCommonStore.x"
          :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
          :processorsType="structuralProjStore.bscanProcessorType"
          :surfaceLoading="structuralProjStore.surfaceLoading"
          :ceilingShift="structuralProjStore.ceilingShift"
          :floorShift="structuralProjStore.floorShift"
          :brightness="structuralProjStore.fastBscanBrightness"
          :contrast="structuralProjStore.fastBscanContrast"
          :smart-bc="structuralProjStore.fastBscanSmartBC"
          :oculusType="analysisCommonStore.oculusType"
        />
        <advanced-seg-bscan
          v-if="
            saveImageStore.targetName === ContainerNameEnum.SaveAdvancedSegBscan
          "
          :showSmartBc="false"
          v-bind="advancedSegStore.bscanRect"
          :bscan-type="ContainerNameEnum.SaveAdvancedSegBscan"
          :aspectRatioFactor="0.4"
          :showRecogonizedContent="advancedSegStore.showRecogonizedContent"
          :index="analysisCommonStore.y"
          :repeat="analysisCommonStore.repeat"
          :sum="analysisCommonStore.dim_slow"
          :zoomRatio="saveImageStore.bscanZoomRatio"
          :bscanZoomRulerHeight="saveImageStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="saveImageStore.bscanZoomRulerWidth"
          :x="analysisCommonStore.x"
          :y="analysisCommonStore.y"
          :surfaceLoading="advancedSegStore.surfaceLoading"
          :ceilingSurfPoints="advancedSegStore.ceilingSurfPoints"
          :floorSurfPoints="advancedSegStore.floorSurfPoints"
          :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
          :brightness="advancedSegStore.bscanBrightness"
          :contrast="advancedSegStore.bscanContrast"
          :oculusType="analysisCommonStore.oculusType"
          :smart-bc="advancedSegStore.bscanSmartBC"
          :processorsType="advancedSegStore.bscanProcessorType"
        />
        <line-scan-bscan
          v-if="
            saveImageStore.targetName === ContainerNameEnum.SaveLineScanBscan &&
            router.currentRoute.value.path === PageRoute.LineScan
          "
          :bscan-type="ContainerNameEnum.SaveLineScanBscan"
          :showSmartBc="false"
          :src="lineScanStore.bscanSrc"
          :index="activeIndex"
          :processorsType="lineScanStore.bscanProcessorType"
          :smart-bc="lineScanStore.bscanSmartBC"
          :activeSlice="lineScanStore.activeSlice"
          :currentReferencePos="lineScanStore.currentReferencePos"
          :referencePosSet="lineScanStore.referencePosSet"
          :setReferencePos="lineScanStore.setReferencePos"
          :repeat="analysisCommonStore.repeat"
          :rotate="analysisCommonStore.rotation_deg"
          :sum="analysisCommonStore.dim_slow"
          :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
          :isStarScan="isStarScan"
          :brightness="lineScanStore.bscanBrightness"
          :contrast="lineScanStore.bscanContrast"
          :aspectRatioFactor="aspectRatioFactor"
          :zoomRatio="saveImageStore.bscanZoomRatio"
          :bscanZoomRulerHeight="saveImageStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="saveImageStore.bscanZoomRulerWidth"
          :transform="analysisCommonStore.xform_slow"
          :cols="analysisCommonStore.dim_fast"
          :downBoundary="analysisCommonStore.downBoundary"
          :oculusType="analysisCommonStore.oculusType"
          :spacingZ_um="analysisCommonStore.spacingZ_um"
          :isAS="isAS"
        />
        <line-scan-bscan
          v-if="
            saveImageStore.targetName === ContainerNameEnum.SaveLineScanBscan &&
            router.currentRoute.value.path === PageRoute.MultipleLineScan
          "
          :bscan-type="ContainerNameEnum.SaveLineScanBscan"
          :showSmartBc="false"
          :src="multipleLineScanStore.bscanSrc(captureDetail)"
          :index="activeIndex(captureDetail)"
          :processorsType="captureDetail.bscanProcessorType"
          :smart-bc="captureDetail.bscanSmartBC"
          :activeSlice="captureDetail.activeSlice"
          :currentReferencePos="
            multipleLineScanStore.currentReferencePos(captureDetail)
          "
          :zoomRatio="saveImageStore.bscanZoomRatio"
          :bscanZoomRulerHeight="saveImageStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="saveImageStore.bscanZoomRulerWidth"
          :referencePosSet="captureDetail.referencePosSet"
          :setReferencePos="(pos: number) => multipleLineScanStore.setReferencePos(pos, captureDetail)"
          :repeat="captureDetail.repeat"
          :rotate="captureDetail.rotation_deg"
          :sum="captureDetail.dim_slow"
          :averagedFramesPerSlice="captureDetail.averagedFramesPerSlice"
          :isStarScan="isStarScanData(captureDetail.protocolName)"
          :aspectRatioFactor="aspectRatioFactor"
          :brightness="lineScanStore.bscanBrightness"
          :contrast="lineScanStore.bscanContrast"
          :transform="captureDetail.xform_slow"
          :cols="captureDetail.dim_fast"
          :downBoundary="captureDetail.downBoundary"
          :oculusType="captureDetail.oculusType"
          :spacingZ_um="captureDetail.spacingZ_um"
          :isAS="isAnteriorScan(captureDetail.protocolName)"
        />
      </div>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { toDateString } from "xe-utils";
import { WATERMAKER_DATETIME_FORMAT } from "@/utils/constant";
import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { useAdvancedSegStoreHook } from "@/views/analysis/posterior/advancedSeg/store/advancedSeg";
import { useLineScanStoreHook } from "@/views/analysis/lineScan/single/store/index";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { ContainerNameEnum, AxisDirectionEnum, OculusTypeEnum } from "@/enums";
import { useAngioLayerStoreHook } from "@/views/analysis/posterior/angio/components/store/angioLayer";
import { useStructuralProjStoreHook } from "@/views/analysis/structuralProj/store";
import { useMultipleLineScanStoreHook } from "@/views/analysis/lineScan/multiple/store";
import {
  useAnalysisMultipleCommonStoreHook,
  CaptureDetailWithKey
} from "@/views/analysis/store/analysisMultipleCommon";
import { useSaveImageStoreHook } from "./store/index";
import { getCaptureDataDepth } from "@/utils/tools/screenshot";
import {
  isSingleLineScanProtocol,
  isStarScanData,
  isCubeScan,
  isAnteriorScan,
  isICLScan2DProtocol
} from "@/utils/protocol";
import { PageRoute } from "@/utils/route";
import router from "@/router";

interface Props {
  sloWidth?: number;
  bscanWidth?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  sloWidth: 800,
  bscanWidth: 600,
  height: 800
});

const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStoreHook();
const angioStore = useAngioStoreHook();
const advancedSegStore = useAdvancedSegStoreHook();
const lineScanStore = useLineScanStoreHook();
const angioLayerStore = useAngioLayerStoreHook();
const saveImageStore = useSaveImageStoreHook();
const structuralProjStore = useStructuralProjStoreHook();
const multipleLineScanStore = useMultipleLineScanStoreHook();
const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();

const { sloRect: angioSlo, octRect: angioOct } = storeToRefs(angioStore);
const { sloRect: advancedSegSlo, octRect: advancedSegOct } =
  storeToRefs(advancedSegStore);
const { sloRect: structuralProjSlo, octRect: structuralProjOct } =
  storeToRefs(structuralProjStore);

// useArrowKeysListener(angioStore.commitCrosshairPosition);

const isAS = computed(() => isAnteriorScan(analysisCommonStore.protocolName));

const captureDataDepth = computed(() => getCaptureDataDepth());

const aspectRatioFactor = computed(() =>
  isAnteriorScan(analysisCommonStore.protocolName) ? 1 : 0.4
);

const isStarScan = computed(() =>
  isStarScanData(analysisCommonStore.protocolName)
);

const isSingleLineScan = computed(
  () =>
    isSingleLineScanProtocol(analysisCommonStore.protocolName) ||
    isICLScan2DProtocol(analysisCommonStore.protocolName)
);

const isCubeData = computed(() => isCubeScan(analysisCommonStore.protocolName));

const activeIndex = computed(() => {
  if (router.currentRoute.value.path === PageRoute.LineScan) {
    const index = isSingleLineScan.value ? 0 : lineScanStore.activeSlice;
    analysisCommonStore.setLineActiveSliceIndex(index);
    return index;
  } else if (router.currentRoute.value.path === PageRoute.MultipleLineScan) {
    return (item: CaptureDetailWithKey) =>
      isSingleLineScan.value ? 0 : item.activeSlice;
  }
});

const captureDetail = computed(() => {
  return analysisMultipleCommonStore.activeCaptureCard!;
});

const currentStore = computed(() => {
  const path = router.currentRoute.value.path;
  let currStore;
  switch (path) {
    case PageRoute.AdvancedSeg:
      currStore = advancedSegStore;
      break;
    case PageRoute.Angiography:
    case PageRoute.AngioRetinaEnhanced:
      currStore = angioStore;
      break;
    case PageRoute.StructuralProjection:
      currStore = structuralProjStore;
      break;
  }
  return currStore;
});
</script>
<style lang="scss" scoped>
.slo-bscan-container {
  // display: block;
  position: absolute;
  top: 0;
  z-index: -1;
}

.row {
  width: 100%;
}

.images {
  height: 100%;
}

.water-mark {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 120px;
  padding: 0 20px;
  font-size: 27px;
  background-color: #000;
}
</style>
