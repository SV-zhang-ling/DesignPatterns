<template>
  <div class="left-images" v-if="isPosteriorLineScan">
    <div class="image-rect top">
      <span class="image-rect-title">{{ $t("analysis.location") }}</span>
      <slo-viewer
        :imageType="ContainerNameEnum.ManualSLO"
        :slo="editLayersStore.sloRect"
        :enface="editLayersStore.enfaceRect"
        :surfaceLoading="editLayersStore.surfaceLoading"
        :activeSlice="editLayersStore.activeSlice"
        :currentReferencePos="editLayersStore.currentReferencePos"
        :showBscanPosOnActiveLine="editLayersStore.showBscanPosOnActiveLine"
        :smart-bc="editLayersStore.sloSmartBC"
        :isStarScan="isStarScan"
        :oculusType="analysisCommonStore.oculusType"
        :arrowDeg="
          analysisCommonStore.oculusType === OculusTypeEnum.OD ? 0 : 180
        "
        @smartBcChange="editLayersStore.updateSmartBC"
        @updateActiveSlice="editLayersStore.setActiveBscanSlice"
      />
    </div>
  </div>
  <div class="left-images" ref="LayersLeftRef" v-else>
    <div class="image-rect top">
      <span class="image-rect-title">{{ $t("analysis.thicknessMap") }}</span>
      <ThicknessMap
        v-bind="editLayersStore.mapRect"
        :surfaceLoading="editLayersStore.surfaceLoading"
        :x="editLayersStore.x"
        :y="editLayersStore.y"
        :processorsType="editLayersStore.thicknessMapColorType"
        :commitCrosshairPosition="editLayersStore.commitCrosshairPosition"
      />
    </div>
    <div class="image-rect middle">
      <span class="image-rect-title">{{ $t("analysis.structuralProj") }}</span>
      <OctViewer
        v-bind="editLayersStore.octRect"
        :surfaceLoading="editLayersStore.surfaceLoading"
        :x="editLayersStore.x"
        :y="editLayersStore.y"
        :processorsType="editLayersStore.octProcessorType"
        :commitCrosshairPosition="editLayersStore.commitCrosshairPosition"
        :smart-bc="editLayersStore.octSmartBC"
        @smartBcChange="editLayersStore.updateSmartBC"
      />
    </div>
    <div class="image-rect bottom">
      <ManualLayerFastBscan
        v-bind="editLayersStore.fastRect"
        :aspectRatioFactor="aspectRatioFactor"
        :rotate="analysisCommonStore.rotation_deg"
        :index="editLayersStore.x"
        :sum="analysisCommonStore.dim_fast"
        :zoomRatio="20"
        :x="editLayersStore.x"
        :y="editLayersStore.y"
        :downBoundary="analysisCommonStore.downBoundary"
        :processorsType="editLayersStore.bscanProcessorType"
        :surfaceLoading="editLayersStore.surfaceLoading"
        :commitCrosshairPosition="editLayersStore.commitCrosshairPosition"
        :oculusType="analysisCommonStore.oculusType"
        :smart-bc="editLayersStore.fastBscanSmartBC"
        :isAS="isAS"
        @smartBcChange="editLayersStore.updateSmartBC"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useEditLayersStoreHook } from "../store/editLayers";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import * as Protocol from "@/utils/protocol";
import { OculusTypeEnum, ContainerNameEnum } from "@/enums";
import { isStarScanData } from "@/utils/protocol";

interface Props {
  aspectRatioFactor?: number;
  isAS?: boolean;
}

defineProps<Props>();

const editLayersStore = useEditLayersStoreHook();
const analysisCommonStore = useAnalysisCommonStoreHook();

const LayersLeftRef = ref<HTMLDivElement | null>(null);

const isPosteriorLineScan = computed(
  () =>
    Protocol.isLineScanProtocol(analysisCommonStore.protocolName) ||
    Protocol.isBiometryProtocol(analysisCommonStore.protocolName)
);
const isStarScan = computed(() =>
  isStarScanData(analysisCommonStore.protocolName)
);
</script>

<style lang="scss" scoped>
.left-images {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .image-rect {
    display: flex;
    flex-direction: column;
    height: calc(100% / 3);
    border: 1px solid $divide-dark-color;

    &.bottom {
      border: 1px solid #f0f;
    }
  }

  .image-rect-title {
    display: inline-block;
    height: 36px;
    padding: 0 8px;
    line-height: 36px;
    color: $font-main-color;
  }
}
</style>
