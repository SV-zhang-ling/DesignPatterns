<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="imageType"
    :smart-bc="smartBc"
  >
    <canvas ref="imageViewerRef"></canvas>
    <teleport v-if="showTeleport" :to="teleportTarget">
      <brightness-contrast-card
        v-if="smartBc === 0"
        :brightness="brightness"
        :contrast="contrast"
        @handleResetBc="handleResetBc"
      />
    </teleport>
  </view-port>
</template>

<script lang="ts" setup>
import { ContainerNameEnum, MeasureViewTypeEnum } from "@/enums";
import { ELViewPort } from "../../types";
import { setCustomTagName } from "@/utils/customElementAttr";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
import {
  initResizeObserver,
  autoResize,
  disconnectResizeObserver
} from "@/utils/autoResize/asyncResize";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
import { initialSize, loadImage } from "../../utils/handleImage";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import { changeLayerMeasureDraw } from "@/utils/tools/measureTools/index";
import { throttle } from "xe-utils";

defineOptions({
  name: "AdvancedImageViewer"
});

interface Props {
  src: string;
  width?: number;
  height?: number;
  imageType: ContainerNameEnum;
  smartBc: number;
  brightness: number;
  contrast: number;
  setBrightnessContrast: ({
    mosaicB,
    mosaicC
  }: {
    mosaicB?: number;
    mosaicC?: number;
  }) => void;
  mosaicIndexName: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: "",
  width: 0,
  height: 0,
  brightness: 0,
  contrast: 0
});
const viewportRef: Ref<ELViewPort> = ref(null);
const imageViewerRef = ref<HTMLCanvasElement | null>(null);
const loading = ref<boolean>(false);
const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);

const showBcInfo = computed(
  () =>
    Math.abs(Number(props.brightness.toFixed(0))) !== 0 ||
    Math.abs(Number(props.contrast.toFixed(0))) !== 0
);

const getBcAdjustCallback = () => {
  return {
    smartBc: props.smartBc,
    brightness: props.brightness,
    contrast: props.contrast
  };
};
const setBcAdjustCallback = throttle(
  async ({ b, c }: { b: number; c: number }) => {
    const imageViewerDom = imageViewerRef?.value as HTMLCanvasElement;
    if (!imageViewerDom) return;
    const { brightness, contrast }: any = await setBcAdjust({
      dom: imageViewerDom,
      src: props.src,
      b,
      c
    });
    props.setBrightnessContrast({
      mosaicB: Number(brightness.toFixed(0)),
      mosaicC: Number(contrast.toFixed(0))
    });
  },
  100
);

useDoubleClick({
  target: viewportRef,
  componentName: props.imageType
});
useBrightnessContrastListener({
  target: viewportRef,
  componentName: props.imageType,
  smartBc: props.smartBc,
  getBcAdjustCallback,
  setBcAdjustCallback
});

onBeforeMount(() => {
  initResizeObserver();
});

onMounted(async () => {
  loading.value = true;
  const imageViewerDom = imageViewerRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  setCustomTagName(innerContainerDom, props.imageType);
  // 加载图片
  const image = await loadImage(props.src);
  loading.value = false;

  const { width, height } = image;
  initialSize(imageViewerDom, width, height);
  const { innerWidth, innerHeight } = handleNodesBoundings(
    [imageViewerDom],
    innerContainerDom,
    viewportDom,
    props.imageType
  );
  autoResize({
    viewportDom,
    innerContainerDom,
    innerWidth,
    innerHeight
  });

  let mat = cv.imread(image);
  cv.imshow(imageViewerDom, mat);
  mat.delete();
  props.smartBc === 0 &&
    showBcInfo.value &&
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  showTeleport.value = true;
  teleportTarget.value = viewportDom;
});

watch(
  () => props.src,
  async src => {
    const imageViewerDom = imageViewerRef?.value as HTMLCanvasElement;
    // 加载图片
    const image = await loadImage(src);
    let mat = cv.imread(image);
    cv.imshow(imageViewerDom, mat);
    mat.delete();
    props.smartBc === 0 &&
      showBcInfo.value &&
      setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  }
);
watch(
  () => props.mosaicIndexName,
  (newVal, oldVal) => {
    const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
    changeLayerMeasureDraw({
      viewportDom,
      viewerType: MeasureViewTypeEnum.Mosaic,
      componentName: props.imageType,
      index: oldVal
    });
  },
  { deep: true }
);

const handleResetBc = () => setBcAdjustCallback({ b: 0, c: 0 });

onUnmounted(() => {
  disconnectResizeObserver();
});
</script>

<style scoped lang="scss">
canvas {
  position: absolute;
  transform-origin: left top;
}

:deep(.inner-container) {
  overflow: visible !important;
}
</style>
