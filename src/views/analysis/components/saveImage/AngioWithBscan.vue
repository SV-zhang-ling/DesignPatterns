<template>
  <div
    v-if="saveImageStore.showAngioBscan"
    class="angio-bscan-container"
    :style="{
      width: `${saveImageStore.bscanHeight + saveImageStore.bscanWidth}px`,
      height: `${saveImageStore.bscanHeight}px`
    }"
  >
    <el-row class="row images">
      <div :style="{ width: `${saveImageStore.bscanHeight}px` }">
        <proj-viewer
          v-if="router.currentRoute.value.path === PageRoute.MultipleAngio"
          :image-type="ContainerNameEnum.SaveAngioProj"
          :showSmartBc="false"
          v-bind="multipleAngioStore.projRect(captureDetail)"
          :processorsType="captureDetail.angioProcessorType"
          :enfaceIndexName="enfaceLayerName"
          :x="captureDetail.x"
          :y="captureDetail.y"
          :brightness="captureDetail.angioBrightness"
          :contrast="captureDetail.angioContrast"
          :smart-bc="captureDetail.angioSmartBC"
        />
        <proj-viewer
          v-else
          :image-type="ContainerNameEnum.SaveAngioProj"
          :showSmartBc="false"
          v-bind="angioStore.projRect"
          :processorsType="angioStore.angioProcessorTypeVal"
          :x="analysisCommonStore.x"
          :y="analysisCommonStore.y"
          :brightness="angioStore.angioBrightness"
          :contrast="angioStore.angioContrast"
          :smart-bc="angioStore.angioSmartBC"
          :enfaceIndexName="angioLayerStore.activeAngioLayerName"
        />
      </div>
      <div :style="{ width: `${saveImageStore.bscanWidth}px` }">
        <slow-bscan
          v-if="
            router.currentRoute.value.path === PageRoute.MultipleAngio &&
            saveImageStore.targetName === ContainerNameEnum.SaveSlowBScanMain
          "
          :showSmartBc="false"
          v-bind="multipleAngioStore.slowBscanRect(captureDetail)"
          :captureDetail="captureDetail"
          :bscan-type="ContainerNameEnum.SaveSlowBScanMain"
          :aspectRatioFactor="0.4"
          :showAngio="multipleAngioStore.showAngio"
          :direction="AxisDirectionEnum.SLOW"
          :index="captureDetail.y"
          :sum="captureDetail.dim_slow"
          :averagedFramesPerSlice="captureDetail.averagedFramesPerSlice"
          :repeat="captureDetail.repeat"
          :zoomRatio="saveImageStore.bscanZoomRatio"
          :bscanZoomRulerHeight="saveImageStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="saveImageStore.bscanZoomRulerWidth"
          :x="captureDetail.x"
          :y="captureDetail.y"
          :brightness="captureDetail.slowBscanBrightness"
          :contrast="captureDetail.slowBscanContrast"
          :processorsType="captureDetail.bscanProcessorType"
          :surfaceLoading="multipleAngioStore.surfaceLoading"
          :ceilingSurfPoints="captureDetail.slowCeilingSurfPoints"
          :floorSurfPoints="captureDetail.slowFloorSurfPoints"
          :oculusType="captureDetail.oculusType"
          :smart-bc="captureDetail.slowBscanMainSmartBC"
        />
        <slow-bscan
          v-if="
            router.currentRoute.value.path !== PageRoute.MultipleAngio &&
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
      </div>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { toDateString } from "xe-utils";
import { WATERMAKER_DATETIME_FORMAT } from "@/utils/constant";
import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import {
  ContainerNameEnum,
  AxisDirectionEnum,
  AnalysisModeEnum
} from "@/enums";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { useMultipleAngioStoreHook } from "@/views/analysis/posterior/angio/multiple/store";
import { useAngioLayerStoreHook } from "@/views/analysis/posterior/angio/components/store/angioLayer";
import { useSaveImageStoreHook } from "./store/index";
import { getCaptureDataDepth } from "@/utils/tools/screenshot";
import { PageRoute } from "@/utils/route";
import router from "@/router";

interface Props {
  angioWidth?: number;
  bscanWidth?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  angioWidth: 800,
  bscanWidth: 600,
  height: 1000
});

const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStoreHook();
const angioStore = useAngioStoreHook();
const angioLayerStore = useAngioLayerStoreHook();
const saveImageStore = useSaveImageStoreHook();
const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();

const multipleAngioStore = useMultipleAngioStoreHook();

// useArrowKeysListener(angioStore.commitCrosshairPosition);

const captureDataDepth = computed(() => getCaptureDataDepth());

const captureDetail = computed(() => {
  return analysisMultipleCommonStore.activeCaptureCard!;
});

const enfaceLayerName = computed(() =>
  router.currentRoute.value.query.m === AnalysisModeEnum.OU
    ? multipleAngioStore.ouActiveLayerName
    : multipleAngioStore.changeActiveLayerName
);
</script>
<style lang="scss" scoped>
.angio-bscan-container {
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
