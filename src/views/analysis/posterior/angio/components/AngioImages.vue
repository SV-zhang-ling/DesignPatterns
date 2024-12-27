<template>
  <div class="angio-images" ref="angioImagesGridRef">
    <el-row class="angio-images-row top" :gutter="8">
      <el-col :span="12">
        <AnalysisCaptureInfoBox
          :oculus="captureStore.activeCaptureData?.Oculus"
          :protocol="captureStore.activeCaptureData?.Protocol"
          :ssi="captureStore.activeCaptureData?.SSI"
          :comment="captureStore.activeCaptureData?.Comment"
          :capture-time="analysisCommonStore.captureTime"
          @edit="handleEditCapture"
        >
          <proj-viewer
            v-bind="angioStore.projRect"
            :processorsType="angioStore.angioProcessorTypeVal"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :brightness="angioStore.angioBrightness"
            :contrast="angioStore.angioContrast"
            :enfaceIndexName="angioLayerStore.activeAngioLayerName"
            :commitCrosshairPosition="angioStore.commitCrosshairPosition"
            :setBrightnessContrast="angioStore.setBrightnessContrast"
            :smart-bc="angioStore.angioSmartBC"
            @smartBcChange="angioStore.updateSmartBC"
          />
        </AnalysisCaptureInfoBox>
      </el-col>
      <el-col :span="12">
        <div class="image-rect">
          <slo-oct
            :slo="sloRect"
            :oct="octRect"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :spacing="[
              analysisCommonStore.spacingX_um,
              analysisCommonStore.spacingY_um
            ]"
            :processorsType="angioStore.octProcessorType"
            :sloBrightness="angioStore.sloBrightness"
            :sloContrast="angioStore.sloContrast"
            :octBrightness="angioStore.octBrightness"
            :octContrast="angioStore.octContrast"
            :commitCrosshairPosition="angioStore.commitCrosshairPosition"
            :setBrightnessContrast="angioStore.setBrightnessContrast"
            :smart-bc="angioStore.sloSmartBC"
            @smartBcChange="angioStore.updateSmartBC"
          />
        </div>
      </el-col>
    </el-row>
    <el-row class="angio-images-row bottom" :gutter="8">
      <el-col :span="12">
        <div class="image-rect slow-bscan">
          <slow-bscan
            v-if="angioStore.bscanSmooth"
            v-bind="angioStore.slowRect"
            :bscan-type="ContainerNameEnum.SlowBScanMain"
            :aspectRatioFactor="0.4"
            :showAngio="angioStore.showAngio"
            :direction="AxisDirectionEnum.SLOW"
            :index="analysisCommonStore.y"
            :sum="analysisCommonStore.dim_slow"
            :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
            :repeat="analysisCommonStore.repeat"
            :zoomRatio="angioStore.slowBscanMainZoomRatio"
            :bscanZoomRulerHeight="angioStore.slowBscanMainZoomRulerHeight"
            :bscanZoomRulerWidth="angioStore.slowBscanMainZoomRulerWidth"
            :bscanZoomRuler="angioStore.bscanZoomRuler"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :surfaceLoading="angioStore.surfaceLoading"
            :processorsType="angioStore.bscanProcessorType"
            :ceilingSurfPoints="angioStore.slowCeilingSurfPoints"
            :floorSurfPoints="angioStore.slowFloorSurfPoints"
            :brightness="angioStore.slowBscanBrightness"
            :contrast="angioStore.slowBscanContrast"
            :setBrightnessContrast="angioStore.setBrightnessContrast"
            :commitCrosshairPosition="angioStore.commitCrosshairPosition"
            :dragCeilSurfaceDistance="angioStore.dragCeilSurfaceDistance"
            :dragFloorSurfaceDistance="angioStore.dragFloorSurfaceDistance"
            :oculusType="analysisCommonStore.oculusType"
            :smart-bc="angioStore.slowBscanMainSmartBC"
            @smartBcChange="angioStore.updateSmartBC"
          />
        </div>
      </el-col>
      <el-col :span="12">
        <div v-if="angioStore.showFastBscan" class="image-rect fast-bscan">
          <fast-bscan
            v-if="angioStore.bscanSmooth"
            v-bind="angioStore.fastRect"
            :aspectRatioFactor="0.4"
            :showAngio="angioStore.showAngio"
            :index="analysisCommonStore.x"
            :sum="analysisCommonStore.dim_fast"
            :zoomRatio="angioStore.fastBscanZoomRatio"
            :bscanZoomRulerHeight="angioStore.fastBscanZoomRulerHeight"
            :bscanZoomRulerWidth="angioStore.fastBscanZoomRulerWidth"
            :bscanZoomRuler="angioStore.bscanZoomRuler"
            :y="analysisCommonStore.y"
            :x="analysisCommonStore.x"
            :showFastBscan="angioStore.showFastBscan"
            :processorsType="angioStore.bscanProcessorType"
            :surfaceLoading="angioStore.surfaceLoading"
            :ceilingSurfPoints="angioStore.fastCeilingSurfPoints"
            :floorSurfPoints="angioStore.fastFloorSurfPoints"
            :brightness="angioStore.fastBscanBrightness"
            :contrast="angioStore.fastBscanContrast"
            :setBrightnessContrast="angioStore.setBrightnessContrast"
            :commitCrosshairPosition="angioStore.commitCrosshairPosition"
            :dragCeilSurfaceDistance="angioStore.dragCeilSurfaceDistance"
            :dragFloorSurfaceDistance="angioStore.dragFloorSurfaceDistance"
            :oculusType="analysisCommonStore.oculusType"
            :smart-bc="angioStore.fastBscanSmartBC"
            @smartBcChange="angioStore.updateSmartBC"
          />
        </div>
        <div v-else class="image-rect slow-bscan">
          <slow-bscan
            v-if="angioStore.bscanSmooth"
            v-bind="angioStore.slowRectAttach"
            :bscan-type="ContainerNameEnum.SlowBScanAttach"
            :aspectRatioFactor="0.4"
            :showAngio="false"
            :index="analysisCommonStore.y"
            :sum="analysisCommonStore.dim_slow"
            :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
            :repeat="analysisCommonStore.repeat"
            :showFastBscan="angioStore.showFastBscan"
            :zoomRatio="angioStore.slowBscanAttachZoomRatio"
            :bscanZoomRulerHeight="angioStore.slowBscanAttachZoomRulerHeight"
            :bscanZoomRulerWidth="angioStore.slowBscanAttachZoomRulerWidth"
            :bscanZoomRuler="angioStore.bscanZoomRuler"
            :processorsType="angioStore.bscanProcessorType"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :surfaceLoading="angioStore.surfaceLoading"
            :ceilingSurfPoints="angioStore.slowCeilingSurfPoints"
            :floorSurfPoints="angioStore.slowFloorSurfPoints"
            :brightness="angioStore.fastBscanBrightness"
            :contrast="angioStore.fastBscanContrast"
            :setBrightnessContrast="angioStore.setBrightnessContrast"
            :commitCrosshairPosition="angioStore.commitCrosshairPosition"
            :dragCeilSurfaceDistance="angioStore.dragCeilSurfaceDistance"
            :dragFloorSurfaceDistance="angioStore.dragFloorSurfaceDistance"
            :oculusType="analysisCommonStore.oculusType"
            :smart-bc="angioStore.slowBscanAttachSmartBC"
            @smartBcChange="angioStore.updateSmartBC"
          />
        </div>
      </el-col>
    </el-row>
  </div>
  <ModifyCaptureDialog
    :visible="modifyCaptureDlgVisible"
    :record="captureStore.activeCaptureData"
    @ok="handleModifyCaptureOK"
    @cancel="handleModifyCaptureCancel"
  />
</template>
<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useAngioStoreHook } from "../store/angiography";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import ModifyCaptureDialog from "@/views/components/ModifyCaptureDialog.vue";
import { ContainerNameEnum, AxisDirectionEnum } from "@/enums";
import useArrowKeysListener from "@/packages/utils/arrowKeysListenerHook";
import { autoResize } from "@/utils/autoResize";
import { useModifyCapture } from "@/hooks/useModifyCapture";
import { useAngioLayerStoreHook } from "./store/angioLayer";

defineOptions({
  name: "AngioImages"
});

const angioImagesGridRef = ref<HTMLDivElement | null>(null);
const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStoreHook();
const angioStore = useAngioStoreHook();
const angioLayerStore = useAngioLayerStoreHook();

const { sloRect, octRect } = storeToRefs(angioStore);

const {
  modifyCaptureDlgVisible,
  handleEditCapture,
  handleModifyCaptureOK,
  handleModifyCaptureCancel
} = useModifyCapture();

useArrowKeysListener(angioStore.commitCrosshairPosition);

onMounted(async () => {
  autoResize(angioImagesGridRef.value as HTMLDivElement);
  window.floorSurfMat = [];
  window.ceilingSurfMat = [];
  await angioStore.getPosteriorSurface();
});

onUnmounted(() => {
  angioStore.cancelFullscreen();
});
</script>
<style lang="scss" scoped>
.angio-images {
  height: 100%;
}

.angio-images-row {
  &.top {
    height: 65%;
  }

  &.bottom {
    height: calc(35% - 8px);
    margin-top: 8px;
  }
}

.image-rect {
  height: 100%;
  background-color: $image-bg-color;
  border: 1px solid $divide-light-color;

  &.slow-bscan,
  &.fast-bscan {
    padding: 1px;
  }

  &.slow-bscan {
    border-color: $image-green;
  }

  &.fast-bscan {
    border-color: $image-pink;
  }
}
</style>
