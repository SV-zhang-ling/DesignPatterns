<template>
  <view-port v-loading="loading" ref="viewportRef" :showSmartBc="false">
    <canvas class="bscan" ref="bscanRef"></canvas>
  </view-port>
</template>

<script lang="ts" setup>
import { ContainerNameEnum } from "@/enums";
import { ELViewPort } from "../../types";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
// import { autoResize } from "../viewport/viewport";
import {
  handleBscanTransform,
  initialSize,
  transform,
  loadImage
} from "../../utils/handleImage";

defineOptions({
  name: "ScanThumbnail"
});

interface Props {
  src: string; // 图片路径
  width?: number;
  height?: number;
  aspectRatioFactor: number;
  transform: number[];
}
const props = withDefaults(defineProps<Props>(), {
  src: "",
  aspectRatioFactor: 0.4,
  transform: () => [0, 11.741682974559687, 0, 3.1595618724823, 0, 0]
});
let resizeObserver: ResizeObserver | null = null;
const bscanRef = ref<HTMLCanvasElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const loading = ref<boolean>(false);

onMounted(async () => {
  loading.value = true;
  const bscanDom = bscanRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();

  // 4.加载图片
  const bscanImage = await loadImage(props.src);
  loading.value = false;

  const width = bscanImage.width;
  const height = bscanImage.height;
  initialSize(bscanDom, width, height);

  const bscanTransform = handleBscanTransform(
    props.transform,
    props.aspectRatioFactor
  );
  transform(bscanDom, bscanTransform);

  // 1.完成dom元素初始化

  // 2.计算boundings
  handleNodesBoundings(
    [bscanDom],
    innerContainerDom,
    viewportDom,
    ContainerNameEnum.FastBScan
  );
  // 3.监听 autoSize
  if (resizeObserver) {
    // 每次innerContainer宽高动态变化都要取消上一次对viewPort的监听
    resizeObserver?.unobserve(viewportDom);
  }
  let bscanMat = cv.imread(bscanImage);
  cv.imshow(bscanDom, bscanMat);
  bscanMat.delete();
});

// onUnmounted(() => {
//   resizeObserver?.disconnect();
// });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
canvas {
  position: absolute;
  transform-origin: left top;
}

:deep(.inner-container) {
  transition: transform 200ms !important;
}
</style>
