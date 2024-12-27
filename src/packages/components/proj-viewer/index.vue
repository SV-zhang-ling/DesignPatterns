<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="imageType"
    :smart-bc="smartBc"
  >
    <canvas ref="projViewerRef" />
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
import {
  ContainerNameEnum,
  ContextmenuTypeEnum,
  MeasureViewTypeEnum
} from "@/enums";
import { setCustomTagName } from "@/utils/customElementAttr";
import { ELViewPort } from "../../types";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
import { initCrossHair } from "@/utils/tools/crosshair";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
import {
  initialSize,
  transform,
  processImage,
  loadImage
} from "../../utils/handleImage";
import { loadImageByXhr } from "../../utils/loadImageByXhr";
import { drawMeasureData } from "@/utils/tools/measureTools/index";
import { changeLayerMeasureDraw } from "@/utils/tools/measureTools/index";
import { PageRoute } from "@/utils/route";
import router from "@/router";
import { throttle } from "xe-utils";

defineOptions({
  name: "ProjViewer"
});
interface Props {
  src: string; // 图片路径
  width: number;
  height: number;
  processorsType?: ContextmenuTypeEnum; // 图片处理器，接收一个mat,返回一个mat,可选
  transform?: number[];
  spacing?: number[];
  x: number;
  y: number;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  smartBc: number;
  captureKey?: string;
  enfaceIndexName?: string;
  measureLoading?: boolean;
  imageType?: ContainerNameEnum;
  brightness: number;
  contrast: number;
  setBrightnessContrast: ({
    captureKey,
    angioB,
    angioC
  }: {
    captureKey?: string;
    angioB?: number;
    angioC?: number;
  }) => void;
}
const props = withDefaults(defineProps<Props>(), {
  src: "",
  width: 0,
  height: 0,
  processorsType: ContextmenuTypeEnum.Gray,
  transform: () => [],
  spacing: () => [],
  x: 0,
  y: 0,
  enfaceIndexName: "",
  imageType: ContainerNameEnum.AngioProj,
  brightness: 0,
  contrast: 0
});

const projViewerRef = ref<HTMLCanvasElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const loading = ref<boolean>(false);
const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);

const showBcInfo = computed(
  () =>
    Math.abs(Number(props.brightness.toFixed(0))) !== 0 ||
    Math.abs(Number(props.contrast.toFixed(0))) !== 0
);

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
const getBcAdjustCallback = () => {
  return {
    smartBc: props.smartBc,
    brightness: props.brightness,
    contrast: props.contrast
  };
};
const setBcAdjustCallback = throttle(
  async ({ b, c }: { b: number; c: number }) => {
    const projViewerDom = projViewerRef?.value as HTMLCanvasElement;
    if (!projViewerDom) return;
    const { brightness, contrast }: any = await setBcAdjust({
      dom: projViewerDom,
      src: props.src,
      b,
      c,
      processorsType: props.processorsType
    });
    const params: any = {
      angioB: Number(brightness.toFixed(0)),
      angioC: Number(contrast.toFixed(0))
    };
    router.currentRoute.value.path === PageRoute.MultipleAngio &&
      (params.captureKey = props.captureKey);
    props.setBrightnessContrast(params);
  },
  100
);
useMouseWheelListener({
  target: viewportRef,
  downCallback,
  upCallback
});
useDoubleClick({
  target: viewportRef,
  componentName: props.imageType,
  cols: props.width,
  rows: props.height,
  spacing: props.spacing,
  dblClickCallback
});
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

onMounted(async () => {
  ContainerNameEnum.SaveAngioProj !== props.imageType && (loading.value = true);
  const projViewerDom = projViewerRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  setCustomTagName(innerContainerDom, props.imageType);
  initialSize(projViewerDom, props.width, props.height);
  transform(projViewerDom, props.transform);

  // 1.完成dom元素初始化
  // 2.计算boundings,  当projViewer设置了transform之后，获取 transform后的独立渲染块BFC的宽和高
  handleNodesBoundings(
    [projViewerDom],
    innerContainerDom,
    viewportDom,
    props.imageType,
    props.captureKey
  );
  // 4.加载图片
  // const image = await loadImage(props.src);
  let mat = await loadImageByXhr(props.src);
  loading.value = false;

  if (!mat) return;
  if (props.smartBc === 0 && showBcInfo.value) {
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  } else {
    // let mat = cv.imread(image);
    if (props.processorsType) {
      // 接收外部processor传来的处理过后的mat
      let dst = processImage(mat, props.processorsType);
      cv.imshow(projViewerDom, dst);
      dst.delete();
    } else {
      // 外部没有传入processor 则以原图模式渲染
      cv.imshow(projViewerDom, mat);
    }
  }
  !mat.isDeleted() && mat.delete();
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  const methods = initCrossHair({
    svgDom,
    x: props.x,
    y: props.y,
    cols: props.width,
    rows: props.height,
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
  ([PageRoute.Angiography, PageRoute.AngioRetinaEnhanced].includes(
    router.currentRoute.value.path
  ) ||
    (PageRoute.MultipleAngio === router.currentRoute.value.path &&
      props.imageType === ContainerNameEnum.SaveAngioProj)) &&
    drawMeasureData({
      viewportDom,
      viewerType: MeasureViewTypeEnum.Enface,
      componentName: props.imageType
    });
});
watch(
  [() => props.src, () => props.processorsType],
  async ([src, processorsType]) => {
    window.noLoadingMask = true;
    const projViewerDom = projViewerRef?.value as HTMLCanvasElement;
    if (!projViewerDom) return;

    // 4.加载图片
    let mat = await loadImageByXhr(props.src);
    if (!mat) return;

    if (props.smartBc === 0 && showBcInfo.value) {
      setBcAdjustCallback({ b: props.brightness, c: props.contrast });
    } else {
      if (processorsType) {
        // 接收外部processor传来的处理过后的mat
        let dst = processImage(mat, processorsType);
        cv.imshow(projViewerDom, dst);
        dst.delete();
      } else {
        // 外部没有传入processor 则以原图模式渲染
        cv.imshow(projViewerDom, mat);
      }
    }
    mat.delete();

    nextTick(() => {
      window.noLoadingMask = false;
    });
  }
);

watch(
  () => props.enfaceIndexName,
  (newVal, oldVal) => {
    if (window.isSaveImages) return;
    const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
    changeLayerMeasureDraw({
      viewportDom,
      viewerType: MeasureViewTypeEnum.Enface,
      componentName: props.imageType,
      index: oldVal
    });
  },
  { deep: true }
);
watch(
  () => props.measureLoading,
  val => {
    const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
    !val &&
      setTimeout(() => {
        drawMeasureData({
          viewportDom,
          viewerType: MeasureViewTypeEnum.Enface,
          componentName: props.imageType
        });
      }, 500);
  },
  { deep: true }
);
const handleResetBc = () => setBcAdjustCallback({ b: 0, c: 0 });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
canvas {
  position: absolute;
  transform-origin: left top;
}

.crosshair {
  position: absolute;
  transform-origin: left top;
}

.projViewer-index-info,
.projViewer-zoom-info {
  position: absolute;
  bottom: 8px;
  color: #fff;
  // 设置user-select样式属性为none来避免文字被选中
  user-select: none;
}

.projViewer-index-info {
  right: 8px;
  width: 176px;
  height: 54px;
  font-size: 15px;
  font-weight: normal;
  line-height: 18px;
  text-align: right;
}

.projViewer-zoom-info {
  left: 8px;
  width: 30px;
  height: 60px;
  padding-left: 5px;
  font-size: 12px;
  border-bottom: 2px solid white;
  border-left: 2px solid white;

  .zoom-ratio {
    position: absolute;
    bottom: 4px;
    left: 4px;
    width: 50px;
  }
}
</style>
