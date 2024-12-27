<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="ContainerNameEnum.OCTScope"
    :smart-bc="0"
    :showSmartBc="false"
  >
    <canvas class="slo" ref="sloRef" />
    <canvas class="oct" ref="octRef" />
    <teleport v-if="showTeleport" :to="teleportTarget">
      <brightness-contrast-card
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
import { handleOctScopeBoundings } from "../../utils/handleNodesBoundings";
import { initCrossHair } from "@/utils/tools/crosshair";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
import {
  initialSize,
  transform,
  loadImage,
  processImage
} from "../../utils/handleImage";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import { changeOctMeasureDraw } from "@/utils/tools/measureTools/index";
import { drawMeasureData } from "@/utils/tools/measureTools/index";
import { throttle } from "xe-utils";

defineOptions({
  name: "OctScope"
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
  if (x >= 0 && x <= props.oct.width && y >= 0 && y <= props.oct.height) {
    props.commitCrosshairPosition({ x, y });
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
  smartBc?: number;
  brightness: number;
  contrast: number;
  setBrightnessContrast: ({
    octB,
    octC
  }: {
    octB?: number;
    octC?: number;
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
  brightness: 0,
  contrast: 0
});
const showBcInfo = computed(
  () =>
    Math.abs(Number(props.brightness.toFixed(0))) !== 0 ||
    Math.abs(Number(props.contrast.toFixed(0))) !== 0
);
useDoubleClick({
  target: viewportRef,
  componentName: ContainerNameEnum.OCTScope,
  offsetX: offsetX.value,
  offsetY: offsetY.value,
  cols: props.oct.width,
  rows: props.oct.height,
  spacing: props.spacing,
  dblClickCallback
});
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

    if (showBcInfo.value) {
      setBcAdjustCallback({ b: props.brightness, c: props.contrast });
    } else {
      if (props.processorsType) {
        // 接收外部processor传来的处理过后的mat
        let dst = processImage(octMat, props.processorsType);
        cv.imshow(octDom, dst);
        dst.delete();
      } else {
        // 外部没有传入processor 则以原图模式渲染
        cv.imshow(octDom, octMat);
      }
    }

    octMat.delete();
  },
  { deep: true, flush: "post" /**确保副作用产生之后执行 */ }
);
const setBcAdjustCallback = throttle(
  async ({ b, c }: { b: number; c: number }) => {
    const octDom = octRef?.value as HTMLCanvasElement;
    if (!octDom) return;
    const { brightness, contrast }: any = await setBcAdjust({
      dom: octDom,
      src: props.oct.src,
      b,
      c,
      processorsType: props.processorsType
    });
    props.setBrightnessContrast({
      octB: Number(brightness.toFixed(0)),
      octC: Number(contrast.toFixed(0))
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

useBrightnessContrastListener({
  target: viewportRef,
  componentName: ContainerNameEnum.OCTScope,
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
onMounted(async () => {
  loading.value = true;
  const sloDom = sloRef?.value as HTMLCanvasElement;
  const octDom = octRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  setCustomTagName(innerContainerDom, ContainerNameEnum.OCTScope);
  updateOpacity();
  initialSize(sloDom, props.slo.width, props.slo.height);
  initialSize(octDom, props.oct.width, props.oct.height);
  transform(sloDom, props.slo.transform);
  transform(octDom, props.oct.transform);
  handleOctScopeBoundings(
    [octDom, sloDom],
    innerContainerDom,
    viewportDom,
    ContainerNameEnum.OCTScope
  );
  // 4.加载图片
  const sloImage = await loadImage(props.slo.src);
  const octImage = await loadImage(props.oct.src);
  loading.value = false;
  let sloMat = cv.imread(sloImage);
  let octMat = cv.imread(octImage);
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  /**
   * 获取坐标偏移量
   */
  const top = parseFloat(window.getComputedStyle(octDom).top);
  const left = parseFloat(window.getComputedStyle(octDom).left);
  const [a, b, tx, d, c, ty] = props.oct.transform;
  offsetX.value = tx + left;
  offsetY.value = ty + top;
  cv.imshow(sloDom, sloMat);

  if (showBcInfo.value) {
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  } else {
    if (props.processorsType) {
      // 接收外部processor传来的处理过后的mat
      let dst = processImage(octMat, props.processorsType);
      cv.imshow(octDom, dst);
      dst.delete();
    } else {
      // 外部没有传入processor 则以原图模式渲染
      cv.imshow(octDom, octMat);
    }
  }
  sloMat.delete();
  octMat.delete();
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
    componentName: ContainerNameEnum.OCTScope
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
  z-index: 200;
  transform-origin: left top;
}
</style>
