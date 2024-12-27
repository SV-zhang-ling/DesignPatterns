<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="ContainerNameEnum.AdvancedSegQuantize"
    :showSmartBc="false"
  >
    <canvas class="oct" ref="octRef" />
    <canvas class="quantize" ref="quantizeRef" />
    <svg
      class="crosshair"
      :width="oct.width"
      :height="oct.height"
      ref="crosshairRef"
    ></svg>
    <teleport v-if="showTeleport" :to="teleportTarget">
      <brightness-contrast-card
        :brightness="brightness"
        :contrast="contrast"
        @handleResetBc="handleResetBc"
      />
    </teleport>
  </view-port>
  <div class="colorbar" ref="colorbarBoxRef">
    <canvas ref="colorbarRef" width="100%" />
  </div>
</template>

<script setup lang="ts">
import { ContainerNameEnum, AlgorithmEnum, MeasureViewTypeEnum } from "@/enums";
import { ELViewPort } from "../../types";
import { setCustomTagName } from "@/utils/customElementAttr";
import { imageParamsType } from "./index.vue";
import { initCrossHair } from "@/utils/tools/crosshair";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
import { initialSize, transform, loadImage } from "../../utils/handleImage";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
import { loadImageByXhr } from "../../utils/loadImageByXhr";
import { throttle } from "xe-utils";
import { changeLayerMeasureDraw } from "@/utils/tools/measureTools/index";

defineOptions({
  name: "QuantizeScope"
});

interface Props {
  algorithm: AlgorithmEnum;
  oct: imageParamsType;
  quantize: imageParamsType;
  x: number;
  y: number;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  index?: number;
  opacity: number;
  brightness: number;
  contrast: number;
  setBrightnessContrast: ({
    quantizeB,
    quantizeC
  }: {
    quantizeB?: number;
    quantizeC?: number;
  }) => void;
  quantizeIndexName: string;
}

const props = withDefaults(defineProps<Props>(), {
  brightness: 0,
  contrast: 0
});
const octRef = ref<HTMLCanvasElement | null>(null);
const quantizeRef = ref<HTMLCanvasElement | null>(null);
const crosshairRef = ref<SVGElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const colorbarBoxRef = ref<HTMLCanvasElement | null>(null);
const colorbarRef = ref<HTMLCanvasElement | null>(null);
const loading = ref<boolean>(false);
const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);

const updateOpacity = () => {
  const quantizeDom = quantizeRef?.value as HTMLCanvasElement;
  if (!quantizeDom) return;
  quantizeDom.style.opacity = `${props.opacity}`;
};
const showBcInfo = computed(
  () =>
    Math.abs(Number(props.brightness.toFixed(0))) !== 0 ||
    Math.abs(Number(props.contrast.toFixed(0))) !== 0
);

watch(
  () => props.opacity,
  () => {
    updateOpacity();
  },
  { immediate: true }
);

watch(
  () => props.oct.src,
  async () => {
    // 更新底层OCT图
    const octDom = octRef?.value as HTMLCanvasElement;
    const octMat = await loadImageByXhr(props.oct.src);
    if (!octMat) return;
    cv.imshow(octDom, octMat);
    octMat.delete();
    showBcInfo.value &&
      setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  },
  { deep: true, flush: "post" /**确保副作用产生之后执行 */ }
);

watch(
  () => props.quantize.src,
  async () => {
    loading.value = true;
    // 更新上层量化图
    const quantizeDom = quantizeRef?.value as HTMLCanvasElement;
    const quantizeMat = await loadImageByXhr(props.quantize.src);
    loading.value = false;
    if (!quantizeMat) return;

    cv.imshow(quantizeDom, quantizeMat);
    quantizeMat.delete();
  },
  { deep: true, flush: "post" /**确保副作用产生之后执行 */ }
);

// update color bar
watch(
  () => props.algorithm,
  async () => {
    await nextTick();
    const colorbarDom = colorbarRef?.value as HTMLCanvasElement;
    const lut = cv.createColorTable(
      props.algorithm === AlgorithmEnum.CHVessel
        ? cv.ColorMap_Gray
        : cv.ColorMap_Rainbow
    );
    const captain = cv.createColorMapBarImage(lut);
    cv.imshow(colorbarDom, captain);
    captain.delete();
  },
  { immediate: true }
);

watch(
  () => props.quantizeIndexName,
  (newVal, oldVal) => {
    const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
    changeLayerMeasureDraw({
      viewportDom,
      viewerType: MeasureViewTypeEnum.Quantize,
      componentName: ContainerNameEnum.AdvancedSegQuantize,
      index: oldVal
    });
  },
  { deep: true }
);

const downCallback = () => {
  if (props.y < props.oct.height - 1) {
    props.commitCrosshairPosition({ y: props.y + 1 });
  }
};
const upCallback = () => {
  if (props.y > 0) {
    props.commitCrosshairPosition({ y: props.y - 1 });
  }
};
const dblClickCallback = ({ x, y }: Point) => {
  if (x >= 0 && x <= props.oct.width && y >= 0 && y <= props.oct.height) {
    props.commitCrosshairPosition({ x, y });
  }
};
const setBcAdjustCallback = throttle(
  async ({ b, c }: { b: number; c: number }) => {
    const octDom = octRef?.value as HTMLCanvasElement;
    if (!octDom) return;
    const { brightness, contrast }: any = await setBcAdjust({
      dom: octDom,
      src: props.oct.src,
      b,
      c
    });
    props.setBrightnessContrast({
      quantizeB: Number(brightness.toFixed(0)),
      quantizeC: Number(contrast.toFixed(0))
    });
  },
  100
);
const getBcAdjustCallback = () => {
  return {
    smartBc: 0,
    brightness: props.brightness,
    contrast: props.contrast
  };
};
useMouseWheelListener({
  target: viewportRef,
  downCallback,
  upCallback
});
useDoubleClick({
  target: viewportRef,
  componentName: ContainerNameEnum.AdvancedSegQuantize,
  cols: props.quantize.width,
  rows: props.quantize.height,
  spacing: props.quantize?.spacing,
  dblClickCallback
});
useBrightnessContrastListener({
  target: viewportRef,
  componentName: ContainerNameEnum.AdvancedSegQuantize,
  smartBc: 0,
  getBcAdjustCallback,
  setBcAdjustCallback
});

let moveCrosshair: (x: number, y: number) => void,
  moveVerticalLine: (x: number) => void,
  moveHorizontalLine: (y: number) => void;
watch([() => props.x, () => props.y], async ([x, y], [lastX, lastY]) => {
  if (x !== lastX && y === lastY && moveVerticalLine) {
    moveVerticalLine(x);
  } else if (x === lastX && y !== lastY && moveHorizontalLine) {
    moveHorizontalLine(y);
  } else if (moveCrosshair) {
    moveCrosshair(x, y);
  }
});

// color bar resize observer
let colorbarResizeObserver: ResizeObserver;
const resize = (entries: Array<ResizeObserverEntry>) => {
  entries.forEach(entry => {
    const { contentRect } = entry;
    const { height } = contentRect;
    const colorbarDom = colorbarRef?.value as HTMLCanvasElement;
    colorbarDom.style.width = height + "px";
  });
};

const addColorbarObserver = () => {
  const colorbarBoxDom = colorbarBoxRef?.value as HTMLCanvasElement;
  colorbarResizeObserver = new ResizeObserver(resize);
  colorbarResizeObserver?.observe(colorbarBoxDom);
};

onMounted(async () => {
  loading.value = true;
  const octDom = octRef?.value as HTMLCanvasElement;
  const quantizeDom = quantizeRef?.value as HTMLCanvasElement;
  const crosshairDom = crosshairRef?.value as SVGElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();

  // add color bar resize observer
  addColorbarObserver();

  setCustomTagName(innerContainerDom, ContainerNameEnum.AdvancedSegQuantize);

  updateOpacity();
  initialSize(octDom, props.oct.width, props.oct.height);
  initialSize(quantizeDom, props.quantize.width, props.quantize.height);
  transform(octDom, props.oct.transform);
  transform(quantizeDom, props.quantize.transform);
  transform(crosshairDom, props.quantize.transform);
  handleNodesBoundings(
    [octDom, quantizeDom, crosshairDom],
    innerContainerDom,
    viewportDom,
    ContainerNameEnum.AdvancedSegQuantize
  );
  // 4.加载图片
  let octMat = await loadImageByXhr(props.oct.src);
  let quantizeMat = await loadImageByXhr(props.quantize.src);
  loading.value = false;
  if (!octMat || !quantizeMat) return;

  cv.imshow(octDom, octMat);
  cv.imshow(quantizeDom, quantizeMat);
  octMat.delete();
  quantizeMat.delete();
  showBcInfo.value &&
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  const methods = initCrossHair({
    svgDom: svgDom,
    x: props.x,
    y: props.y,
    cols: props.quantize.width,
    rows: props.quantize.height,
    spacing: props.quantize?.spacing,
    commitCrosshairPosition: props.commitCrosshairPosition
  });
  moveCrosshair = methods.moveCrosshair;
  moveVerticalLine = methods.moveVerticalLine;
  moveHorizontalLine = methods.moveHorizontalLine;
  // 加载初始化位置
  moveCrosshair(props.x, props.y);
  showTeleport.value = true;
  teleportTarget.value = viewportDom;

  loading.value = false;
});

const handleResetBc = () => setBcAdjustCallback({ b: 0, c: 0 });

onUnmounted(() => {
  colorbarResizeObserver?.disconnect();
});
</script>
<style scoped lang="scss">
canvas {
  position: absolute;
  transform-origin: left top;
}

.crosshair {
  position: absolute;
  transform-origin: left top;
}

.colorbar {
  position: relative;
  width: 20px;
  height: 100%;
  padding: 0 5px;
  background-color: #000;

  canvas {
    bottom: -6px;
    height: 6px;
    transform: rotate(-90deg);
  }
}
</style>
