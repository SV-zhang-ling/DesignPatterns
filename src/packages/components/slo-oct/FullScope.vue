<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="imageType"
    :smart-bc="smartBc"
    :showSmartBc="showSmartBc"
  >
    <canvas class="slo" ref="sloRef" />
    <canvas class="oct" ref="octRef" />
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

<script setup lang="ts">
import {
  ContextmenuTypeEnum,
  ContainerNameEnum,
  MeasureViewTypeEnum
} from "@/enums";
import { setCustomTagName } from "@/utils/customElementAttr";
import { ELViewPort } from "../../types";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
import { initCrossHair } from "@/utils/tools/crosshair";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
import {
  initialSize,
  transform,
  loadImage,
  processImage
} from "../../utils/handleImage";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import { changeOctMeasureDraw } from "@/utils/tools/measureTools/index";
import { drawMeasureData } from "@/utils/tools/measureTools/index";
import { throttle } from "xe-utils";

defineOptions({
  name: "FullScope"
});

const sloRef = ref<HTMLCanvasElement | null>(null);
const octRef = ref<HTMLCanvasElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const loading = ref<boolean>(false);
const offsetX = ref<number>(0);
const offsetY = ref<number>(0);
const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);

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
  const [spaceX, spaceY] = props.spacing;
  const newX = x - parseInt(offsetX.value / spaceX);
  const newY = y - parseInt(offsetY.value / spaceY);
  if (
    newX >= 0 &&
    newX <= props.oct.width &&
    newY >= 0 &&
    newY <= props.oct.height
  ) {
    props.commitCrosshairPosition({ x: newX, y: newY });
  }
};
useMouseWheelListener({
  target: viewportRef,
  downCallback,
  upCallback
});

interface imageParamsType {
  transform: number[];
  src: string;
  width: number;
  height: number;
}
interface Props {
  slo: imageParamsType;
  oct: imageParamsType;
  x: number;
  y: number;
  spacing: number[];
  processorsType?: ContextmenuTypeEnum.Gray | ContextmenuTypeEnum.Inverse; // 图片处理器，接收一个mat,返回一个mat,可选
  opacity: number;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  smartBc: number;
  showSmartBc?: boolean;
  imageType?: ContainerNameEnum;
  brightness: number;
  contrast: number;
  setBrightnessContrast: ({
    sloB,
    sloC
  }: {
    sloB?: number;
    sloC?: number;
  }) => void;
}

const props = withDefaults(defineProps<Props>(), {
  slo: () => ({ transform: [], src: "", width: 0, height: 0 }),
  oct: () => ({ transform: [], src: "", width: 0, height: 0 }),
  processorsType: ContextmenuTypeEnum.Gray,
  x: 0,
  y: 0,
  spacing: () => [],
  opacity: 0,
  showSmartBc: true,
  imageType: ContainerNameEnum.FullScope,
  brightness: 0,
  contrast: 0
});
const showBcInfo = computed(
  () =>
    Math.abs(Number(props.brightness.toFixed(0))) !== 0 ||
    Math.abs(Number(props.contrast.toFixed(0))) !== 0
);

const updateOpacity = () => {
  const octDom = octRef?.value as HTMLCanvasElement;
  if (!octDom) return;
  octDom.style.opacity = `${props.opacity}`;
};

watch(
  () => props.opacity,
  () => {
    updateOpacity();
  },
  { immediate: true }
);

watch(
  () => props.slo.src,
  async () => {
    // 4.加载图片
    const sloDom = sloRef?.value as HTMLCanvasElement;
    const sloImage = await loadImage(props.slo.src);
    let sloMat = cv.imread(sloImage);

    cv.imshow(sloDom, sloMat);
    sloMat.delete();
    console.log(props.smartBc === 0 && showBcInfo.value);
    props.smartBc === 0 &&
      showBcInfo.value &&
      setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  },
  { deep: true, flush: "post" /**确保副作用产生之后执行 */ }
);

watch(
  [() => props.oct.src, () => props.processorsType],
  async () => {
    // 4.加载图片
    const octDom = octRef?.value as HTMLCanvasElement;
    const octImage = await loadImage(props.oct.src);
    let octMat = cv.imread(octImage);

    if (props.processorsType) {
      // 接收外部processor传来的处理过后的mat
      let dst = processImage(octMat, props.processorsType);
      cv.imshow(octDom, dst);
      dst.delete();
    } else {
      // 外部没有传入processor 则以原图模式渲染
      cv.imshow(octDom, octMat);
    }
    octMat.delete();
  },
  { deep: true, flush: "post" } // , flush: "post" /**确保副作用产生之后执行 */
);
const setBcAdjustCallback = throttle(
  async ({ b, c }: { b: number; c: number }) => {
    const sloDom = sloRef?.value as HTMLCanvasElement;
    if (!sloDom) return;
    const { brightness, contrast }: any = await setBcAdjust({
      dom: sloDom,
      src: props.slo.src,
      b,
      c
    });
    props.setBrightnessContrast({
      sloB: Number(brightness.toFixed(0)),
      sloC: Number(contrast.toFixed(0))
    });
  },
  100
);
const getBcAdjustCallback = () => {
  return {
    smartBc: props.smartBc,
    brightness: props.brightness,
    contrast: props.contrast
  };
};

useDoubleClick({
  target: viewportRef,
  componentName: props.imageType,
  offsetX: offsetX.value,
  offsetY: offsetY.value,
  cols: props.oct.width,
  rows: props.oct.height,
  spacing: props.spacing,
  dblClickCallback
});
useBrightnessContrastListener({
  target: viewportRef,
  componentName: ContainerNameEnum.FullScope,
  smartBc: props.smartBc,
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
onMounted(async () => {
  ContainerNameEnum.SaveSlo !== props.imageType && (loading.value = true);
  const sloDom = sloRef?.value as HTMLCanvasElement;
  const octDom = octRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  setCustomTagName(innerContainerDom, props.imageType);
  updateOpacity();
  initialSize(sloDom, props.slo.width, props.slo.height);
  initialSize(octDom, props.oct.width, props.oct.height);
  transform(sloDom, props.slo.transform);
  transform(octDom, props.oct.transform);
  handleNodesBoundings(
    [octDom, sloDom],
    innerContainerDom,
    viewportDom,
    props.imageType
  );
  // 4.加载图片
  const sloImage = await loadImage(props.slo.src);
  const octImage = await loadImage(props.oct.src);
  loading.value = false;
  let sloMat = cv.imread(sloImage);
  let octMat = cv.imread(octImage);

  cv.imshow(sloDom, sloMat);
  if (props.processorsType) {
    // 接收外部processor传来的处理过后的mat
    let dst = processImage(octMat, props.processorsType);
    cv.imshow(octDom, dst);
    dst.delete();
  } else {
    // 外部没有传入processor 则以原图模式渲染
    cv.imshow(octDom, octMat);
  }
  sloMat.delete();
  octMat.delete();
  props.smartBc === 0 &&
    showBcInfo.value &&
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  /**
   * 获取坐标偏移量
   */
  const top = parseFloat(window.getComputedStyle(octDom).top);
  const left = parseFloat(window.getComputedStyle(octDom).left);
  const [a, b, tx, d, c, ty] = props.oct.transform;
  offsetX.value = tx + left;
  offsetY.value = ty + top;
  const methods = initCrossHair({
    svgDom,
    x: props.x,
    y: props.y,
    offsetX: offsetX.value,
    offsetY: offsetY.value,
    cols: props.oct.width,
    rows: props.oct.height,
    spacing: props.spacing,
    commitCrosshairPosition: props.commitCrosshairPosition
  });
  moveCrosshair = methods.moveCrosshair;
  moveVerticalLine = methods.moveVerticalLine;
  moveHorizontalLine = methods.moveHorizontalLine;
  // 加载初始化位置
  moveCrosshair(props.x, props.y);
  showTeleport.value = true;
  teleportTarget.value = viewportDom;
  // 加载ruler
  drawMeasureData({
    viewportDom,
    viewerType: MeasureViewTypeEnum.CSSO,
    componentName: props.imageType
  });
  changeOctMeasureDraw(viewportDom);
});
const handleResetBc = () => setBcAdjustCallback({ b: 0, c: 0 });
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
</style>
