<template>
  <div class="main-images">
    <el-row class="cube-row" :gutter="cubeStore.showCScan ? 8 : 0">
      <el-col class="cube-col" :span="cubeStore.showCScan ? 12 : 24">
        <el-row class="capture-card-row">
          <capture-info-card
            class="advanceSeg-image-actions__left"
            :oculus="captureStore.activeCaptureData?.Oculus"
            :protocol="captureStore.activeCaptureData?.Protocol"
            :ssi="captureStore.activeCaptureData?.SSI"
            :comment="captureStore.activeCaptureData?.Comment"
            :capture-time="captureStore.activeCaptureData?.Time"
            @edit="handleEditCapture"
          />
        </el-row>
        <el-row class="cube-content-row">
          <CubePly
            :transparency="cubeStore.structTransparency"
            :needReset="cubeStore.reset"
            :screenshotTaking="cubeStore.screenshotTaking"
            @reset="handleReset"
            @screenshot="handleScreenshot"
          />
        </el-row>
      </el-col>
      <el-col
        :span="12"
        v-if="cubeStore.showCScan && !cubeStore.surfaceLoading"
      >
        <CscanSelector
          :options="CSCAN_SURFACE_LIST"
          :defaultSelected="cubeStore.layerType"
          @change="handleChange"
        />
        <CscanViewer
          class="cscan-viewer"
          v-bind="cubeStore.cscanRect"
          :imageType="ContainerNameEnum.CubeCscan"
          :x="analysisCommonStore.x"
          :y="analysisCommonStore.y"
          :commitCrosshairPosition="cubeStore.commitCrosshairPosition"
          :smart-bc="cubeStore.cscanSmartBC"
          :brightness="cubeStore.cscanBrightness"
          :cscanIndexName="cubeStore.layerTypeName"
          :contrast="cubeStore.cscanContrast"
          :setBrightnessContrast="cubeStore.setBrightnessContrast"
          @smartBcChange="cubeStore.updateSmartBC"
        />
      </el-col>
    </el-row>
    <el-row class="bscan-row" :gutter="8">
      <el-col :span="12">
        <div class="image-rect slow-bscan">
          <slow-bscan
            v-bind="cubeStore.slowRect"
            :isAsBscan="cubeStore.isAsCube"
            :bscan-type="ContainerNameEnum.CubeSlowBscan"
            :aspectRatioFactor="ratioFactor"
            :showAngio="false"
            :direction="AxisDirectionEnum.SLOW"
            :index="analysisCommonStore.y"
            :sum="analysisCommonStore.dim_slow"
            :spacingZ_um="analysisCommonStore.spacingZ_um"
            :zoomRatio="cubeStore.slowBscanZoomRatio"
            :bscanZoomRulerHeight="cubeStore.slowBscanZoomRulerHeight"
            :bscanZoomRulerWidth="cubeStore.slowBscanZoomRulerWidth"
            :bscanZoomRuler="cubeStore.bscanZoomRuler"
            :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
            :repeat="analysisCommonStore.repeat"
            :x="analysisCommonStore.x"
            :y="analysisCommonStore.y"
            :downBoundary="analysisCommonStore.downBoundary"
            :processorsType="cubeStore.bscanProcessorType"
            :brightness="cubeStore.slowBscanBrightness"
            :contrast="cubeStore.slowBscanContrast"
            :setBrightnessContrast="cubeStore.setBrightnessContrast"
            :commitCrosshairPosition="cubeStore.commitCrosshairPosition"
            :oculusType="analysisCommonStore.oculusType"
            :smart-bc="cubeStore.slowBscanSmartBC"
            @smartBcChange="cubeStore.updateSmartBC"
            :surfaceLoading="cubeStore.surfaceLoading"
            :cscanLayerType="cubeStore.layerType"
            :floorShift="cubeStore.surfShift"
            :dragFloorSurfaceDistance="cubeStore.dragSurfaceDistance"
            :isHorizontal="cubeStore.isHorizontal"
            :isSmart="cubeStore.isSmart"
          />
        </div>
      </el-col>
      <el-col :span="12">
        <div class="image-rect fast-bscan">
          <fast-bscan
            v-bind="cubeStore.fastRect"
            :isAsBscan="cubeStore.isAsCube"
            :bscan-type="ContainerNameEnum.CubeFastBscan"
            :aspectRatioFactor="ratioFactor"
            :showAngio="false"
            :index="analysisCommonStore.x"
            :sum="analysisCommonStore.dim_fast"
            :spacingZ_um="analysisCommonStore.spacingZ_um"
            :zoomRatio="cubeStore.fastBscanZoomRatio"
            :bscanZoomRulerHeight="cubeStore.fastBscanZoomRulerHeight"
            :bscanZoomRulerWidth="cubeStore.fastBscanZoomRulerWidth"
            :bscanZoomRuler="cubeStore.bscanZoomRuler"
            :y="analysisCommonStore.y"
            :x="analysisCommonStore.x"
            :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
            :downBoundary="analysisCommonStore.downBoundary"
            :processorsType="cubeStore.bscanProcessorType"
            :brightness="cubeStore.fastBscanBrightness"
            :contrast="cubeStore.fastBscanContrast"
            :setBrightnessContrast="cubeStore.setBrightnessContrast"
            :commitCrosshairPosition="cubeStore.commitCrosshairPosition"
            :oculusType="analysisCommonStore.oculusType"
            :smart-bc="cubeStore.fastBscanSmartBC"
            @smartBcChange="cubeStore.updateSmartBC"
            :surfaceLoading="cubeStore.surfaceLoading"
            :cscanLayerType="cubeStore.layerType"
            :floorShift="cubeStore.surfShift"
            :dragFloorSurfaceDistance="cubeStore.dragSurfaceDistance"
            :isHorizontal="cubeStore.isHorizontal"
            :isSmart="cubeStore.isSmart"
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

<script setup lang="ts">
import ModifyCaptureDialog from "@/views/components/ModifyCaptureDialog.vue";
import CubePly from "@/views/analysis/components/3d/CubePly.vue";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { CSCAN_SELECTION_TYPE, useCubeStoreHook } from "../store";
import { AxisDirectionEnum, ContainerNameEnum } from "@/enums";
import { CSCAN_SURFACE_LIST } from "@/utils/constant";
import { useModifyCapture } from "@/hooks/useModifyCapture";
import { useImageActions } from "@/hooks/useImageActions";

const {
  modifyCaptureDlgVisible,
  handleEditCapture,
  handleModifyCaptureOK,
  handleModifyCaptureCancel
} = useModifyCapture();

const { handleLayerVisible } = useImageActions();

const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStoreHook();
const cubeStore = useCubeStoreHook();

const ratioFactor = computed(() => (cubeStore.isAsCube ? 1 : 0.4));

onMounted(async () => {
  if (!cubeStore.isAsCube) {
    cubeStore.surfShift = 0;
    cubeStore.dragSurfaceDistance = 0;
    window.floorSurfMat = [];
  }
});

watch(
  () => cubeStore.layerType,
  async (layerType: string) => {
    if (cubeStore.isAsCube) return;

    cubeStore.dragSurfaceDistance = 0;
    cubeStore.surfShift = 0;
    cubeStore.setCurrSurfMat();
    if (layerType === CSCAN_SELECTION_TYPE.Smart) {
      cubeStore.smartShift = 0;
      cubeStore.smartSurface = "10";
      cubeStore.bellowSurfType = "8";
      cubeStore.abovePercent = 0;
      cubeStore.smartPosX = analysisCommonStore.dim_slow / 2;
      cubeStore.smartPosY = analysisCommonStore.dim_fast / 2;
      cubeStore.setCurrSurfPoints();
    }
  }
);

watch(
  () => cubeStore.showCScan,
  async (show: boolean) => {
    handleLayerVisible(show);

    if (cubeStore.isAsCube || cubeStore.surfaceMat[1]) return;

    await cubeStore.getAllSurfaces();
  }
);

watch(
  () => analysisCommonStore.x,
  () => {
    for (let layerType in cubeStore.surfaceMat) {
      cubeStore.getFastSurfPoints(
        Number(layerType),
        toRaw(cubeStore.surfaceMat[layerType])
      );
    }
  }
);

watch(
  () => analysisCommonStore.y,
  () => {
    for (let layerType in cubeStore.surfaceMat) {
      cubeStore.getSlowSurfPoints(
        Number(layerType),
        toRaw(cubeStore.surfaceMat[layerType])
      );
    }
  }
);

const handleReset = () => {
  cubeStore.reset = false;
};

const handleScreenshot = () => {
  cubeStore.screenshotTaking = false;
};

const handleChange = (layerType: string) => {
  const layer = CSCAN_SURFACE_LIST.find(x => x.value === layerType);
  cubeStore.layerType = layerType;
  cubeStore.layerTypeName = layer?.name;
};
</script>
<style lang="scss" scoped>
.main-images {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.cube-row {
  height: 65%;
  margin-bottom: 2px;

  .cube-col {
    height: 100%;
  }

  .capture-card-row {
    display: block;
  }

  .cube-content-row {
    height: calc(100% - 38px);
  }

  .cscan-viewer {
    height: calc(100% - 36px);
    border: 1px solid #00e5fe;
  }
}

.bscan-row {
  height: 35%;
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
