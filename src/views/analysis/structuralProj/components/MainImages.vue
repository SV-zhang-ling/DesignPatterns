<template>
  <div class="main-images" ref="imagesGridRef">
    <el-row class="main-images-row top" :gutter="8">
      <el-col :span="12">
        <AnalysisCaptureInfoBox
          :oculus="captureStore.activeCaptureData?.Oculus"
          :protocol="captureStore.activeCaptureData?.Protocol"
          :ssi="captureStore.activeCaptureData?.SSI"
          :comment="captureStore.activeCaptureData?.Comment"
          :capture-time="analysisCommonStore.captureTime"
          @edit="handleEditCapture"
        >
          <OctViewer
            v-bind="structuralProjStore.octRect"
            :imageType="ContainerNameEnum.StructuralProjOct"
            :surfaceLoading="structuralProjStore.surfaceLoading"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :octIndexName="octLayerStore.activeLayerName"
            :processorsType="structuralProjStore.octProcessorType"
            :brightness="structuralProjStore.octBrightness"
            :contrast="structuralProjStore.octContrast"
            :setBrightnessContrast="structuralProjStore.setBrightnessContrast"
            :commitCrosshairPosition="
              structuralProjStore.commitCrosshairPosition
            "
            :smart-bc="structuralProjStore.octSmartBC"
            @smartBcChange="structuralProjStore.updateSmartBC"
          />
        </AnalysisCaptureInfoBox>
      </el-col>
      <el-col :span="12">
        <div class="image-rect">
          <slo-oct
            :slo="structuralProjStore.sloRect"
            :oct="structuralProjStore.octRectOnSlo"
            :default-opacity="0"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :spacing="[
              analysisCommonStore.spacingX_um,
              analysisCommonStore.spacingY_um
            ]"
            :sloBrightness="structuralProjStore.sloBrightness"
            :sloContrast="structuralProjStore.sloContrast"
            :octBrightness="structuralProjStore.octBrightness"
            :octContrast="structuralProjStore.octContrast"
            :setBrightnessContrast="structuralProjStore.setBrightnessContrast"
            :processorsType="structuralProjStore.octProcessorType"
            :commitCrosshairPosition="
              structuralProjStore.commitCrosshairPosition
            "
            :smart-bc="structuralProjStore.sloSmartBC"
            @smartBcChange="structuralProjStore.updateSmartBC"
          />
        </div>
      </el-col>
    </el-row>
    <el-row class="main-images-row bottom" :gutter="8">
      <el-col :span="12">
        <div class="image-rect slow-bscan">
          <slow-bscan
            v-if="structuralProjStore.bscanSmooth"
            v-bind="structuralProjStore.slowRect"
            :isAsBscan="true"
            :bscan-type="ContainerNameEnum.OctSlowBscan"
            :aspectRatioFactor="ratioFactor"
            :showAngio="false"
            :direction="AxisDirectionEnum.SLOW"
            :index="analysisCommonStore.y"
            :sum="analysisCommonStore.dim_slow"
            :spacingZ_um="analysisCommonStore.spacingZ_um"
            :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
            :repeat="analysisCommonStore.repeat"
            :zoomRatio="structuralProjStore.slowBscanZoomRatio"
            :bscanZoomRulerHeight="structuralProjStore.slowBscanZoomRulerHeight"
            :bscanZoomRulerWidth="structuralProjStore.slowBscanZoomRulerWidth"
            :bscanZoomRuler="structuralProjStore.bscanZoomRuler"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :surfaceLoading="structuralProjStore.surfaceLoading"
            :processorsType="structuralProjStore.bscanProcessorType"
            :ceilingShift="structuralProjStore.ceilingShift"
            :floorShift="structuralProjStore.floorShift"
            :brightness="structuralProjStore.slowBscanBrightness"
            :contrast="structuralProjStore.slowBscanContrast"
            :setBrightnessContrast="structuralProjStore.setBrightnessContrast"
            :commitCrosshairPosition="
              structuralProjStore.commitCrosshairPosition
            "
            :dragCeilSurfaceDistance="
              structuralProjStore.dragCeilSurfaceDistance
            "
            :dragFloorSurfaceDistance="
              structuralProjStore.dragFloorSurfaceDistance
            "
            :oculusType="analysisCommonStore.oculusType"
            :smart-bc="structuralProjStore.slowBscanSmartBC"
            @smartBcChange="structuralProjStore.updateSmartBC"
          />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="image-rect fast-bscan">
          <fast-bscan
            v-if="structuralProjStore.bscanSmooth"
            v-bind="structuralProjStore.fastRect"
            :isAsBscan="true"
            :bscan-type="ContainerNameEnum.OctFastBscan"
            :aspectRatioFactor="ratioFactor"
            :showAngio="false"
            :index="analysisCommonStore.x"
            :sum="analysisCommonStore.dim_fast"
            :spacingZ_um="analysisCommonStore.spacingZ_um"
            :zoomRatio="structuralProjStore.fastBscanZoomRatio"
            :bscanZoomRulerHeight="structuralProjStore.fastBscanZoomRulerHeight"
            :bscanZoomRulerWidth="structuralProjStore.fastBscanZoomRulerWidth"
            :bscanZoomRuler="structuralProjStore.bscanZoomRuler"
            :y="analysisCommonStore.y"
            :x="analysisCommonStore.x"
            :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
            :processorsType="structuralProjStore.bscanProcessorType"
            :surfaceLoading="structuralProjStore.surfaceLoading"
            :ceilingShift="structuralProjStore.ceilingShift"
            :floorShift="structuralProjStore.floorShift"
            :brightness="structuralProjStore.fastBscanBrightness"
            :contrast="structuralProjStore.fastBscanContrast"
            :setBrightnessContrast="structuralProjStore.setBrightnessContrast"
            :commitCrosshairPosition="
              structuralProjStore.commitCrosshairPosition
            "
            :dragCeilSurfaceDistance="
              structuralProjStore.dragCeilSurfaceDistance
            "
            :dragFloorSurfaceDistance="
              structuralProjStore.dragFloorSurfaceDistance
            "
            :oculusType="analysisCommonStore.oculusType"
            :smart-bc="structuralProjStore.fastBscanSmartBC"
            @smartBcChange="structuralProjStore.updateSmartBC"
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
import ModifyCaptureDialog from "@/views/components/ModifyCaptureDialog.vue";
import { ContainerNameEnum, AxisDirectionEnum } from "@/enums";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useModifyCapture } from "@/hooks/useModifyCapture";
import { useStructuralProjStoreHook } from "../store";
import { autoResize } from "@/utils/autoResize";
import useArrowKeysListener from "@/packages/utils/arrowKeysListenerHook";
import { useOCTLayerStoreHook } from "./store/octLayer";

defineOptions({
  name: "MainImages"
});

const imagesGridRef = ref<HTMLDivElement | null>(null);
const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStoreHook();
const structuralProjStore = useStructuralProjStoreHook();

const {
  modifyCaptureDlgVisible,
  handleEditCapture,
  handleModifyCaptureOK,
  handleModifyCaptureCancel
} = useModifyCapture();

const octLayerStore = useOCTLayerStoreHook();

const ratioFactor = computed(() => (structuralProjStore.isAs ? 1 : 0.4));

onMounted(async () => {
  autoResize(imagesGridRef.value as HTMLDivElement);
  window.floorSurfMat = [];
  window.ceilingSurfMat = [];
  await structuralProjStore.getSurfaces();
});

onUnmounted(() => {
  structuralProjStore.cancelFullscreen();
});

useArrowKeysListener(structuralProjStore.commitCrosshairPosition);
</script>
<style lang="scss" scoped>
.main-images {
  height: 100%;
}

.main-images-row {
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
