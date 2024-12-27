<template>
  <section class="advanceSeg-image-actions">
    <capture-info-card
      class="advanceSeg-image-actions__left"
      :oculus="captureStore.activeCaptureData?.Oculus"
      :protocol="captureStore.activeCaptureData?.Protocol"
      :ssi="captureStore.activeCaptureData?.SSI"
      :comment="captureStore.activeCaptureData?.Comment"
      :capture-time="captureStore.activeCaptureData?.Time"
      @edit="handleEditCapture"
    />
    <AdvanceSegSettings class="advanceSeg-image-actions__right" />
  </section>
  <div class="advanceSeg-images" ref="advanceSegImagesGridRef">
    <el-row class="advanceSeg-images-row left" :gutter="8">
      <el-col :span="12">
        <div class="image-rect top">
          <slo-oct
            :slo="sloRect"
            :oct="octRect"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :spacing="[
              analysisCommonStore.spacingX_um,
              analysisCommonStore.spacingY_um
            ]"
            :sloBrightness="advancedSegStore.sloBrightness"
            :sloContrast="advancedSegStore.sloContrast"
            :octBrightness="advancedSegStore.octBrightness"
            :octContrast="advancedSegStore.octContrast"
            :processorsType="advancedSegStore.octProcessorType"
            :commitCrosshairPosition="advancedSegStore.commitCrosshairPosition"
            :setBrightnessContrast="advancedSegStore.setBrightnessContrast"
            :smart-bc="advancedSegStore.sloSmartBC"
            @smartBcChange="advancedSegStore.updateSmartBC"
          />
        </div>
        <div class="image-rect slow-bscan bottom">
          <advanced-seg-bscan
            v-loading="advancedSegStore.surfaceLoading"
            v-bind="advancedSegStore.bscanRect"
            :aspectRatioFactor="0.4"
            :showRecogonizedContent="advancedSegStore.showRecogonizedContent"
            :index="analysisCommonStore.y"
            :repeat="analysisCommonStore.repeat"
            :sum="analysisCommonStore.dim_slow"
            :zoomRatio="advancedSegStore.bscanZoomRatio"
            :bscanZoomRulerHeight="advancedSegStore.bscanZoomRulerHeight"
            :bscanZoomRulerWidth="advancedSegStore.bscanZoomRulerWidth"
            :bscanZoomRuler="advancedSegStore.bscanZoomRuler"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :brightness="advancedSegStore.bscanBrightness"
            :contrast="advancedSegStore.bscanContrast"
            :setBrightnessContrast="advancedSegStore.setBrightnessContrast"
            :surfaceLoading="advancedSegStore.surfaceLoading"
            :ceilingSurfPoints="advancedSegStore.ceilingSurfPoints"
            :floorSurfPoints="advancedSegStore.floorSurfPoints"
            :commitCrosshairPosition="advancedSegStore.commitCrosshairPosition"
            :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
            :oculusType="analysisCommonStore.oculusType"
            :processorsType="advancedSegStore.bscanProcessorType"
            :smart-bc="advancedSegStore.bscanSmartBC"
            @smartBcChange="advancedSegStore.updateSmartBC"
          />
        </div>
      </el-col>
      <el-col :span="12">
        <advanced-seg-quantize
          :algorithm="advancedSegStore.algorithm"
          :oct="octRect"
          :quantizeBrightness="advancedSegStore.quantizeBrightness"
          :quantizeContrast="advancedSegStore.quantizeContrast"
          :setBrightnessContrast="advancedSegStore.setBrightnessContrast"
          :quantize="quantizeRect"
          :quantizeIndexName="advancedSegStore.quantizeIndexName"
          :x="analysisCommonStore.x"
          :y="analysisCommonStore.y"
          :commitCrosshairPosition="advancedSegStore.commitCrosshairPosition"
        />
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
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { autoResize } from "@/utils/autoResize";
import { useModifyCapture } from "@/hooks/useModifyCapture";
import { useAdvancedSegStoreHook } from "../store/advancedSeg";
import useArrowKeysListener from "@/packages/utils/arrowKeysListenerHook";
import ModifyCaptureDialog from "@/views/components/ModifyCaptureDialog.vue";
import AdvanceSegSettings from "./AdvanceSegSettings.vue";

defineOptions({
  name: "AdvanceSegImages"
});

const advanceSegImagesGridRef = ref<HTMLDivElement | null>(null);
const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStoreHook();
const advancedSegStore = useAdvancedSegStoreHook();

const { quantizeRect, sloRect, octRect } = storeToRefs(advancedSegStore);

const {
  modifyCaptureDlgVisible,
  handleEditCapture,
  handleModifyCaptureOK,
  handleModifyCaptureCancel
} = useModifyCapture();

useArrowKeysListener(advancedSegStore.commitCrosshairPosition);

onMounted(async () => {
  autoResize(advanceSegImagesGridRef.value as HTMLDivElement);
  window.floorSurfMat = [];
  window.ceilingSurfMat = [];
  await advancedSegStore.getPosteriorSurface();
});

onUnmounted(() => {
  advancedSegStore.cancelFullscreen();
});
</script>
<style lang="scss" scoped>
.advanceSeg-image-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid $border-color-dark;

  .advanceSeg-image-actions__left {
    width: 50%;
    border-right: 1px solid $border-color-dark;
  }
}

.advanceSeg-images {
  height: calc(100% - 40px);
}

.advanceSeg-images-row {
  border: 1px solid $divide-light-color;

  &.left {
    height: 100%;
  }
}

.image-rect {
  border: 1px solid $divide-light-color;

  &.top {
    height: 60%;
  }

  &.bottom {
    height: calc(40% - 8px);
    margin-top: 8px;
  }

  &.slow-bscan {
    padding: 1px;
    border-color: $image-green;
  }
}
</style>
