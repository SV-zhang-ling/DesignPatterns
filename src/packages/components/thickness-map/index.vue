<template>
  <div class="thickness-map">
    <view-port
      v-loading="loading"
      ref="viewportRef"
      :image-type="ContainerNameEnum.ThicknessMap"
      :showSmartBc="false"
    >
      <canvas class="thickness" ref="thicknessRef" />
    </view-port>
    <div class="colorbar" ref="colorbarBoxRef">
      <canvas ref="colorbarRef" width="100%" />
    </div>
  </div>
</template>
<script setup lang="ts">
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import { ContextmenuTypeEnum, ContainerNameEnum } from "@/enums";
import { setCustomTagName } from "@/utils/customElementAttr";
import { autoResize } from "@/utils/autoResize/asyncResize";
import { initCrossHair } from "@/utils/tools/crosshair";
import { ELViewPort } from "../../types";
import {
  initialSize,
  transform,
  loadImage,
  processImage
} from "../../utils/handleImage";

defineOptions({
  name: "ThicknessMap"
});

interface Props {
  src: string; // 图片路径
  width: number;
  height: number;
  transform?: number[];
  spacing: number[];
  x: number;
  y: number;
  processorsType?: ContextmenuTypeEnum;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  surfaceLoading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  src: "",
  width: 0,
  height: 0,
  transform: () => [],
  spacing: () => [],
  processorsType: ContextmenuTypeEnum.Range500,
  x: 0,
  y: 0,
  surfaceLoading: true
});

const loading = ref<boolean>(false);
const thicknessRef = ref<HTMLCanvasElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const colorbarBoxRef = ref<HTMLCanvasElement | null>(null);
const colorbarRef = ref<HTMLCanvasElement | null>(null);
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
  componentName: ContainerNameEnum.ThicknessMap,
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
    if (!props.surfaceLoading) {
      const thicknessDom = thicknessRef?.value as HTMLCanvasElement;
      const thicknessImage = await loadImage(props.src);

      let thicknessMat = cv.imread(thicknessImage);

      if (props.processorsType) {
        // 接收外部processor传来的处理过后的mat
        let dst = processImage(thicknessMat, props.processorsType);
        cv.imshow(thicknessDom, dst);
        !dst.isDeleted() && dst.delete();
      } else {
        // 外部没有传入processor 则以原图模式渲染
        cv.imshow(thicknessDom, thicknessMat);
      }
      !thicknessMat.isDeleted() && thicknessMat.delete();
    }
  },
  { deep: true, flush: "post" /**确保副作用产生之后执行 */ }
);

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
// update color bar
watch(
  () => props.src,
  async () => {
    await nextTick();

    const colorbarDom = colorbarRef?.value as HTMLCanvasElement;
    const lut = cv.createColorTable(cv.ColorMap_Rainbow);
    const captain = cv.createColorMapBarImage(lut);
    cv.imshow(colorbarDom, captain);
    !captain.isDeleted() && captain.delete();
  },
  { immediate: true }
);
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
  const thicknessDom = thicknessRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();

  // add color bar resize observer
  addColorbarObserver();

  setCustomTagName(innerContainerDom, ContainerNameEnum.ThicknessMap);
  initialSize(thicknessDom, props.width, props.height);
  transform(thicknessDom, props.transform);
  // 4.加载图片
  const thicknessImage = await loadImage(props.src);
  loading.value = false;

  const { innerWidth, innerHeight } = handleNodesBoundings(
    [thicknessDom],
    innerContainerDom,
    viewportDom,
    ContainerNameEnum.ThicknessMap
  );

  autoResize({
    viewportDom,
    innerContainerDom,
    innerWidth,
    innerHeight
  });
  let thicknessMat = cv.imread(thicknessImage);
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  /**
   * 获取坐标偏移量
   */
  const top = parseFloat(window.getComputedStyle(thicknessDom).top);
  const left = parseFloat(window.getComputedStyle(thicknessDom).left);
  const [a, b, tx, d, c, ty] = props.transform;
  offsetX.value = tx + left;
  offsetY.value = ty + top;
  if (props.processorsType) {
    // 接收外部processor传来的处理过后的mat
    let dst = processImage(thicknessMat, props.processorsType);
    cv.imshow(thicknessDom, dst);
    !dst.isDeleted() && dst.delete();
  } else {
    // 外部没有传入processor 则以原图模式渲染
    cv.imshow(thicknessDom, thicknessMat);
  }
  !thicknessMat.isDeleted() && thicknessMat.delete();

  const methods = initCrossHair({
    svgDom,
    x: props.x,
    y: props.y,
    cols: props.width,
    rows: props.height,
    spacing: props.spacing,
    commitCrosshairPosition: props.commitCrosshairPosition,
    componentName: ContainerNameEnum.ThicknessMap
  });
  moveCrosshair = methods.moveCrosshair;
  moveVerticalLine = methods.moveVerticalLine;
  moveHorizontalLine = methods.moveHorizontalLine;
  // 加载初始化位置
  moveCrosshair(props.x, props.y);
  // 5.processor
});
onUnmounted(() => {
  colorbarResizeObserver?.disconnect();
});
</script>
<style scoped lang="scss">
.thickness-map {
  display: flex;
  height: 100%;
}

canvas {
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
