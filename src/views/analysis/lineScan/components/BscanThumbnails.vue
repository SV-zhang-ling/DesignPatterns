<template>
  <section class="thumbnail-list">
    <BscanThumbnailCard
      v-for="idx in BSCAN_INDEX_ARR"
      :key="idx"
      :index="idx"
      :src="src(idx)"
      :oculusType="captureDetail.oculusType"
      :is-star="isStarScan"
      :arrow-deg="arrowDeg"
      :class="bscanClass(idx)"
      :width="captureDetail.dim_fast"
      :height="captureDetail.dim_slow"
      :transform="captureDetail.xform_slow"
      @select="handleBscanSelect"
    />
  </section>
</template>
<script lang="ts" setup>
// import { useAnalysisCommonStoreHook } from "../../store/analysisCommon";
import { buildQueryString, intToArray } from "@/utils";
import { CaptureDetailWithKey } from "../../store/analysisMultipleCommon";
import router from "@/router";
import { PageRoute } from "@/utils/route";

defineOptions({
  name: "BscamThumbnails"
});

interface Props {
  captureDetail: CaptureDetailWithKey;
  isStarScan: boolean;
  activeSlice: number;
  bscanSmartBC: number;
  syncSlowBscanIndex: number;
}

const props = defineProps<Props>();

// const analysisCommonStore = useAnalysisCommonStoreHook();

const BSCAN_INDEX_ARR = ref<number[]>([]);

const emits = defineEmits(["updateActiveSlice"]);

const src = computed(() => {
  const { VUE_APP_BASE_API_URL, VUE_APP_VANGOGH_VERSION } = process.env;
  const urlParams = buildQueryString({
    isThumb: 1,
    captureKey: props.captureDetail.captureKey, // analysisCommonStore.captureKey,
    encoder: "jpg",
    axis: 0,
    smooth: 0,
    quality: 10,
    smartBC: props.bscanSmartBC
  });
  return (idx: number) =>
    `${VUE_APP_BASE_API_URL}${VUE_APP_VANGOGH_VERSION}/capture/oct/bscan?${urlParams}&slice=${idx}`;
});

const bscanClass = computed(() => {
  return (idx: number) => (idx === props.activeSlice ? "active" : "");
});

const arrowDeg = computed(() =>
  props.isStarScan
    ? 180 / props.captureDetail.dim_slow
    : props.captureDetail.rotation_deg
);

// scroll active bscan into view
const scrollActiveBscanIntoView = async () => {
  await nextTick();
  const activeBscan = document.querySelectorAll(".bscan-thumbnail-card.active");
  activeBscan &&
    [...activeBscan].forEach((activethumbnailBscan: Element) => {
      activethumbnailBscan?.scrollIntoView(false);
    });
};

// init bscan index array
const initBscanIndexArr = () => {
  BSCAN_INDEX_ARR.value = intToArray(props.captureDetail.dim_slow);
};

// init default active bscan
const initActiveBscan = () => {
  if (router.currentRoute.value.path === PageRoute.MultipleLineScan) return;
  const slice =
    props.syncSlowBscanIndex === -1
      ? parseInt(props.captureDetail.dim_slow / 2)
      : props.syncSlowBscanIndex;
  emits("updateActiveSlice", slice, props.captureDetail);
};

watch(
  () => props.activeSlice,
  () => {
    scrollActiveBscanIntoView();
    !window.isSaveImages && (window.originSlice = props.activeSlice);
  }
);

onMounted(() => {
  initBscanIndexArr();
  initActiveBscan();
});

// handle bscan clicked
const handleBscanSelect = (slice: number) => {
  emits("updateActiveSlice", slice, props.captureDetail);
};
</script>
<style lang="scss" scoped>
$card-header-bg-color: #3d3d3d;

.thumbnail-list {
  padding-left: 4px;
  overflow: auto;
}

.bscan-thumbnail-card {
  z-index: 1;
  float: left;
  padding: 1px;
  margin: 0 5px 5px 0;
}
</style>
