<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="imageType"
    :smart-bc="smartBc"
  >
    <canvas ref="cscanRef"></canvas>
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
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
import { ContainerNameEnum, MeasureViewTypeEnum } from "@/enums";
import { setCustomTagName } from "@/utils/customElementAttr";
import { autoResize } from "@/utils/autoResize/asyncResize";
import { initCrossHair } from "@/utils/tools/crosshair";
import { ELViewPort } from "../../types";
import { initialSize, transform, loadImage } from "../../utils/handleImage";
import { throttle } from "xe-utils";
import { changeLayerMeasureDraw } from "@/utils/tools/measureTools/index";

defineOptions({
  name: "CscanViewer"
});

interface Props {
  src: string; // 图片路径
  width: number;
  height: number;
  transform?: number[];
  spacing: number[];
  x: number;
  y: number;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  smartBc: number;
  surfaceLoading?: boolean;
  imageType?: ContainerNameEnum;
  brightness?: number;
  contrast?: number;
  setBrightnessContrast: ({
    cscanB,
    cscanC
  }: {
    cscanB?: number;
    cscanC?: number;
  }) => void;
  cscanIndexName: string;
}

const props = withDefaults(defineProps<Props>(), {
  src: "",
  width: 0,
  height: 0,
  transform: () => [],
  spacing: () => [],
  x: 0,
  y: 0,
  surfaceLoading: true,
  imageType: ContainerNameEnum.CubeCscan,
  brightness: 0,
  contrast: 0
});
const showBcInfo = computed(
  () =>
    Math.abs(Number(props.brightness.toFixed(0))) !== 0 ||
    Math.abs(Number(props.contrast.toFixed(0))) !== 0
);
const showTeleport = ref<boolean>(false);
const teleportTarget = ref<Element | null>(null);
const loading = ref<boolean>(false);
const cscanRef = ref<HTMLCanvasElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const offsetX = ref<number>(0);
const offsetY = ref<number>(0);

const downCallback = () => {
  if (props.y < props.height - 1) {
    props.commitCrosshairPosition({ y: props.y + 1 });
  }
};
const upCallback = () => {
  if (props.y > 0) {
    props.commitCrosshairPosition({ y: props.y - 1 });
  }
};
const dblClickCallback = ({ x, y }: Point) => {
  if (x >= 0 && x <= props.width && y >= 0 && y <= props.height) {
    props.commitCrosshairPosition({ x, y });
  }
};
useMouseWheelListener({
  target: viewportRef,
  downCallback,
  upCallback
});
useDoubleClick({
  target: viewportRef,
  componentName: props.imageType,
  offsetX: offsetX.value,
  offsetY: offsetY.value,
  cols: props.width,
  rows: props.height,
  spacing: props.spacing,
  dblClickCallback
});

watch(
  [() => props.src, () => props.surfaceLoading],
  async () => {
    // 4.加载图片
    // if (!props.surfaceLoading) {
    const imageDom = cscanRef?.value as HTMLCanvasElement;
    const image = await loadImage(`${props.src}&timestamp=${Date.now()}`);
    let imageMat = cv.imread(image);
    if (props.smartBc === 0 && showBcInfo.value) {
      setBcAdjustCallback({ b: props.brightness, c: props.contrast });
    } else {
      // 外部没有传入processor 则以原图模式渲染
      cv.imshow(imageDom, imageMat);
    }
    !imageMat.isDeleted() && imageMat.delete();
    // }
  },
  { deep: true, flush: "post" /**确保副作用产生之后执行 */ }
);

const setBcAdjustCallback = throttle(
  async ({ b, c }: { b: number; c: number }) => {
    const octDom = cscanRef?.value as HTMLCanvasElement;
    if (!octDom) return;
    const { brightness, contrast }: any = await setBcAdjust({
      dom: octDom,
      src: props.src,
      b,
      c
    });
    props.setBrightnessContrast({
      cscanB: Number(brightness.toFixed(0)),
      cscanC: Number(contrast.toFixed(0))
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

useBrightnessContrastListener({
  target: viewportRef,
  componentName: props.imageType,
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
watch(
  () => props.cscanIndexName,
  (newVal, oldVal) => {
    const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
    changeLayerMeasureDraw({
      viewportDom,
      viewerType: MeasureViewTypeEnum.CubeCscan,
      componentName: props.imageType,
      index: oldVal
    });
  },
  { deep: true }
);

onMounted(async () => {
  loading.value = true;
  const octDom = cscanRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  setCustomTagName(innerContainerDom, props.imageType);
  initialSize(octDom, props.width, props.height);
  transform(octDom, props.transform);
  // 4.加载图片
  const octImage = await loadImage(props.src);
  loading.value = false;

  const { innerWidth, innerHeight } = handleNodesBoundings(
    [octDom],
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
  let octMat = cv.imread(octImage);
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  /**
   * 获取坐标偏移量
   */
  const top = parseFloat(window.getComputedStyle(octDom).top);
  const left = parseFloat(window.getComputedStyle(octDom).left);
  const [a, b, tx, d, c, ty] = props.transform;
  offsetX.value = tx + left;
  offsetY.value = ty + top;
  if (props.smartBc === 0 && showBcInfo.value) {
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  } else {
    // 外部没有传入processor 则以原图模式渲染
    cv.imshow(octDom, octMat);
  }
  !octMat.isDeleted() && octMat.delete();

  const methods = initCrossHair({
    svgDom,
    x: props.x,
    y: props.y,
    cols: props.width,
    rows: props.height,
    spacing: props.spacing,
    commitCrosshairPosition: props.commitCrosshairPosition,
    componentName: props.imageType
  });
  moveCrosshair = methods.moveCrosshair;
  moveVerticalLine = methods.moveVerticalLine;
  moveHorizontalLine = methods.moveHorizontalLine;
  // 加载初始化位置
  moveCrosshair(props.x, props.y);

  showTeleport.value = true;
  teleportTarget.value = viewportDom;
});
const handleResetBc = () => setBcAdjustCallback({ b: 0, c: 0 });
</script>
<style scoped lang="scss">
canvas {
  position: absolute;
  transform-origin: left top;
}
</style>
