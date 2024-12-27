<template>
  <section class="thumbnail-list">
    <AngioLayerThumbnailCard
      v-for="layer in layers"
      :class="layerCardClass(layer)"
      :key="layer.value"
      :layer-type="layer.value"
      :src="octLayerSrc(layer)"
      :layer-label="$t(layer.labelKey)"
      @select="() => handleLayerSelect(layer)"
      @imageError="handleImageLoadError"
    />
  </section>
</template>
<script lang="ts" setup>
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { useAnalysisCommonStoreHook } from "../../store/analysisCommon";
import { useOCTLayerStoreHook } from "./store/octLayer";
import { useStructuralProjStoreHook } from "../store/index";
import { CAPTURE_URL_PRE } from "@/utils/constant";

const OCT_LAYER_THUMBNAIL_URL_PRE = `${CAPTURE_URL_PRE}/oct/projection?isThumb=1`;

defineOptions({
  name: "OCTLayerThumbnailList"
});

interface Props {
  layers: Array<LabelKeyValueType>;
  timeStamp?: number;
}
const props = withDefaults(defineProps<Props>(), {
  timeStamp: 0
});

const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStoreHook();
const octLayerStore = useOCTLayerStoreHook();
const structuralProjStore = useStructuralProjStoreHook();

const layerCardClass = computed(() => {
  return (item: LabelKeyValueType) => [
    "layer-card",
    `${item.value === octLayerStore.activeLayerType ? "active" : ""}`
  ];
});

const octLayerSrc = computed(() => {
  return (item: LabelKeyValueType) =>
    `${OCT_LAYER_THUMBNAIL_URL_PRE}&captureKey=${captureStore.activeCaptureData.captureKey}&octLayer=${item.value}&projType=${structuralProjStore.projType}&timeStamp=${props.timeStamp}&timestamp=${analysisCommonStore.manualLayerTimestamp}`;
});

watch(
  () => captureStore.activeCaptureData?.Time,
  () => {
    props.layers && octLayerStore.setLayerType(props.layers[0].value);
    props.layers && octLayerStore.setLayerName(props.layers[0].name);
  },
  { immediate: true }
);

// handle layer selected
const handleLayerSelect = (layer: LabelKeyValueType) => {
  if (layer.value === octLayerStore.activeLayerType) return;

  octLayerStore.setLayerType(layer.value);
  octLayerStore.setLayerName(layer.name);
  structuralProjStore.getSurfaces();
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
