<template>
  <section class="thumbnail-list">
    <AngioLayerThumbnailCard
      v-for="layer in layers"
      :class="layerCardClass(layer)"
      :key="layer.value"
      :layer-type="layer.value"
      :src="angioLayerSrc(layer)"
      :layer-label="$t(layer.labelKey)"
      @select="() => handleLayerSelect(layer)"
      @imageError="handleImageLoadError"
    />
  </section>
</template>
<script lang="ts" setup>
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useAngioLayerStoreHook } from "./store/angioLayer";
import { useAngioStoreHook } from "../store/angiography";
import { CAPTURE_URL_PRE } from "@/utils/constant";

const ANGIO_LAYER_THUMBNAIL_URL_PRE = `${CAPTURE_URL_PRE}/angio/projection?isThumb=1`;
const ANGIO_ENHANCED_THUMBNAIL_LENGTH = 8;

defineOptions({
  name: "AngioLayerThumbnails"
});
interface Props {
  layers: LabelKeyValueType[];
  timeStamp: number;
}
const props = withDefaults(defineProps<Props>(), {
  timeStamp: 0
});

const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStoreHook();
const angioLayerStore = useAngioLayerStoreHook();
const angioStore = useAngioStoreHook();

const layerCardClass = computed(() => {
  return (item: LabelKeyValueType) => [
    "layer-card",
    `${item.value === angioLayerStore.activeAngioLayerType ? "active" : ""}`
  ];
});

const angioLayerSrc = computed(() => {
  return (item: LabelKeyValueType) =>
    `${ANGIO_LAYER_THUMBNAIL_URL_PRE}&captureKey=${captureStore.activeCaptureData.captureKey}&angioLayer=${item.value}&${angioLayerStore.paramsUrl}&timeStamp=${props.timeStamp}&timestamp=${analysisCommonStore.manualLayerTimestamp}`;
});

watch(
  () => captureStore.activeCaptureData?.Time,
  () => {
    props.layers &&
      angioLayerStore.setAngioLayerType(
        props.layers.length === ANGIO_ENHANCED_THUMBNAIL_LENGTH
          ? props.layers[4].value
          : props.layers[0].value
      );
    props.layers &&
      angioLayerStore.setAngioLayerName(
        props.layers.length === ANGIO_ENHANCED_THUMBNAIL_LENGTH
          ? props.layers[4].name
          : props.layers[0].name
      );
  },
  { immediate: true }
);

// handle layer selected
const handleLayerSelect = (layer: LabelKeyValueType) => {
  if (layer.value === angioLayerStore.activeAngioLayerType) return;
  angioLayerStore.setAngioLayerType(layer.value);
  angioLayerStore.setAngioLayerName(layer.name);
  angioStore.getPosteriorSurface();
};

const handleImageLoadError = () => {
  // TO-DO
};
</script>
<style lang="scss" scoped>
$card-header-bg-color: #3d3d3d;

.thumbnail-list {
  overflow: auto;
}

.angio-layer-thumbnail-card {
  z-index: 1;
  float: left;
}

.layer-card {
  padding: 1px;
  margin: 0 12px 12px 0;
}
</style>
