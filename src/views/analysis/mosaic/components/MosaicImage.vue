<template>
  <section class="mosaic-image-actions">
    <capture-info-card
      class="mosaic-image-actions__left"
      :oculus="captureStore.activeCaptureData?.Oculus"
      :protocol="captureStore.activeCaptureData?.Protocol"
      :ssi="captureStore.activeCaptureData?.SSI"
      :comment="captureStore.activeCaptureData?.Comment"
      :capture-time="captureStore.activeCaptureData?.Time"
      @edit="handleEditCapture"
    />
    <MosaicImageSettings class="mosaic-image-actions__right" v-if="isAngio" />
  </section>
  <section class="mosaic-image">
    <advanced-image-viewer
      :src="imageSrc"
      :image-type="imageType"
      :brightness="mosaicStore.mosaicBrightness"
      :contrast="mosaicStore.mosaicContrast"
      :setBrightnessContrast="mosaicStore.setBrightnessContrast"
      :mosaicIndexName="mosaicStore.activeLayerTypeName"
      :smart-bc="mosaicStore.smartBC"
      @smartBcChange="mosaicStore.updateSmartBC"
    />
  </section>
  <ModifyCaptureDialog
    :visible="modifyCaptureDlgVisible"
    :record="captureStore.activeCaptureData"
    @ok="handleModifyCaptureOK"
    @cancel="handleModifyCaptureCancel"
  />
</template>
<script lang="ts" setup>
import ModifyCaptureDialog from "@/views/components/ModifyCaptureDialog.vue";
import MosaicImageSettings from "./MosaicImageSettings.vue";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
// import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useMosaicStoreHook } from "../store/mosaic";
import { useModifyCapture } from "@/hooks/useModifyCapture";
import { ContainerNameEnum } from "@/enums";

defineOptions({
  name: "MosaicImage"
});

interface Props {
  isAngio?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isAngio: true
});

const captureStore = useCaptureStoreHook();
const mosaicStore = useMosaicStoreHook();
// const analysisCommonStore = useAnalysisCommonStoreHook();

const imageSrc = computed(() =>
  props.isAngio ? mosaicStore.mosaicSrc : mosaicStore.mosaicOctSrc
);

const imageType = computed(() =>
  props.isAngio ? ContainerNameEnum.MosaicProj : ContainerNameEnum.MosaicOctProj
);

const {
  modifyCaptureDlgVisible,
  handleEditCapture,
  handleModifyCaptureOK,
  handleModifyCaptureCancel
} = useModifyCapture();
</script>
<style lang="scss" scoped>
.mosaic-image-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid $border-color-dark;

  .mosaic-image-actions__left {
    width: 550px;
    border-right: 1px solid $border-color-dark;
  }
}

.mosaic-image {
  flex: 1;
}
</style>
