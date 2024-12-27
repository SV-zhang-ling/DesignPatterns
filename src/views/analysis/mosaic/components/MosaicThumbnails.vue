<template>
  <section class="thumbnail-list">
    <AngioLayerThumbnailCard
      v-for="layer in thumbnailList"
      :class="layerCardClass(layer)"
      :key="layer.value"
      :layer-type="layer.value"
      :src="layerSrc(layer)"
      :layer-label="$t(layer.labelKey)"
      @select="() => handleLayerSelect(layer)"
      @imageError="handleImageLoadError"
    />
  </section>
</template>
<script lang="ts" setup>
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useMosaicStoreHook } from "../store/mosaic";
import { buildQueryString } from "@/utils";
import { CAPTURE_URL_PRE } from "@/utils/constant";

defineOptions({
  name: "MosaicThumbnails"
});

interface Props {
  thumbnailList: LabelKeyValueType[];
  isAngio?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isAngio: true
});

const mosaicStore = useMosaicStoreHook();
const analysisCommon = useAnalysisCommonStoreHook();

const layerCardClass = computed(() => {
  return (item: LabelKeyValueType) => [
    "layer-card",
    `${item.value === mosaicStore.activeLayerType ? "active" : ""}`
  ];
});

const layerSrc = computed(() => {
  return (item: LabelKeyValueType) => {
    const params: {
      captureKey: string;
      enhance?: number;
      isMosaic: number;
      isThumb: number;
      angioLayer?: string;
      octLayer?: string;
    } = {
      captureKey: analysisCommon.captureKey,
      enhance: mosaicStore.enhance ? 1 : 0,
      isMosaic: 1,
      isThumb: 1
    };
    if (props.isAngio) {
      params.enhance = mosaicStore.enhance ? 1 : 0;
      params.angioLayer = item.value;
    } else {
      params.octLayer = item.value;
    }
    return `${CAPTURE_URL_PRE}/${
      props.isAngio ? "angio" : "oct"
    }/projection?${buildQueryString(params)}`;
  };
});

// handle layer selected
const handleLayerSelect = (layer: LabelKeyValueType) => {
  if (layer.value === mosaicStore.activeLayerType) return;
  const layerItem = props.thumbnailList.find(x => x.value === layer.value);

  mosaicStore.setActiveLayerType(layer.value);
  mosaicStore.setActiveLayerTypeName(layerItem?.name);
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
