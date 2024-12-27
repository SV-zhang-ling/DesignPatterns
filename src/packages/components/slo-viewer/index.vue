<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="imageType"
    :smart-bc="smartBc"
  >
    <canvas class="slo" ref="sloRef"></canvas>
    <svg
      class="enface"
      :width="enface.width"
      :height="enface.height"
      ref="enfaceRef"
    ></svg>
    <teleport v-if="showTeleport" :to="teleportTarget">
      <brightness-contrast-card
        v-if="smartBc === 0"
        :brightness="brightness"
        :contrast="contrast"
        @handleResetBc="handleResetBc"
      />
      <div class="oculus-direction" v-if="showDirection">
        <div class="direction top">90 (S)</div>
        <div class="direction right">
          <div>0</div>
          <div>{{ `(${oculusType === OculusTypeEnum.OD ? "N" : "T"})` }}</div>
        </div>
        <div class="direction bottom">270 (I)</div>
        <div class="direction left">
          <div>180</div>
          <div>{{ `(${oculusType === OculusTypeEnum.OD ? "T" : "N"})` }}</div>
        </div>
      </div>
    </teleport>
  </view-port>
</template>

<script lang="ts" setup>
import {
  ContainerNameEnum,
  OculusTypeEnum,
  MeasureViewTypeEnum
} from "@/enums";
import { ELViewPort } from "../../types";
import { drawLine } from "./drawLine";
import { handleOctScopeBoundings } from "../../utils/handleNodesBoundings";
// import { autoResize } from "../viewport/viewport";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import { initialSize, loadImage, transform } from "../../utils/handleImage";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
import { autoResize } from "@/utils/autoResize/asyncResize";
import { setCustomTagName } from "@/utils/customElementAttr";
import { drawMeasureData } from "@/utils/tools/measureTools/index";
import { PageRoute } from "@/utils/route";
import router from "@/router";
import { throttle } from "xe-utils";

const emits = defineEmits(["updateActiveSlice"]);

defineOptions({
  name: "SloViewer"
});

interface BaseRect {
  width: number;
  height: number;
  transform: number[];
}
interface EnfaceParamsType extends BaseRect {
  spacingX: number;
  spacingY: number;
  rotate: number;
  n: number;
}
interface imageParamsType extends BaseRect {
  src: string;
}
interface Props {
  smartBc: number;
  slo: imageParamsType;
  enface: EnfaceParamsType;
  isStarScan: boolean;
  isCubeData?: boolean;
  showDirection?: boolean;
  oculusType?: string;
  arrowDeg?: number;
  activeSlice: number;
  currentReferencePos: number;
  showBscanPosOnActiveLine: boolean;
  imageType?: ContainerNameEnum;
  measureLoading?: boolean;
  captureKey?: string;
  brightness: number;
  contrast: number;
  setBrightnessContrast: ({
    captureKey,
    sloB,
    sloC
  }: {
    captureKey?: string;
    sloB?: number;
    sloC?: number;
  }) => void;
}
const props = withDefaults(defineProps<Props>(), {
  slo: () => ({
    transform: [],
    src: "",
    width: 0,
    height: 0
  }),
  enface: () => ({
    transform: [],
    width: 0,
    height: 0,
    n: 0,
    spacingX: 0,
    spacingY: 0,
    rotate: 0
  }),
  isStarScan: false,
  imageType: ContainerNameEnum.LineScanSLO,
  brightness: 0,
  contrast: 0
});

const sloRef = ref<HTMLCanvasElement | null>(null);
const enfaceRef = ref<SVGElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const loading = ref<boolean>(false);
const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);
const showBcInfo = computed(
  () =>
    Math.abs(Number(props.brightness.toFixed(0))) !== 0 ||
    Math.abs(Number(props.contrast.toFixed(0))) !== 0
);

useDoubleClick({
  target: viewportRef,
  componentName: props.imageType
});
const downCallback = () => {
  if (props.activeSlice < props.enface.n - 1)
    updateSliceIndex(props.activeSlice + 1);
  // 1.切换高亮线
  // 2.切换bscan
  // 3.缩略图
};
const upCallback = () => {
  if (props.activeSlice > 0) {
    updateSliceIndex(props.activeSlice - 1);
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
    const sloDom = sloRef?.value as HTMLCanvasElement;
    if (!sloDom) return;
    const { brightness, contrast }: any = await setBcAdjust({
      dom: sloDom,
      src: props.slo.src,
      b,
      c
    });
    const params: any = {
      sloB: Number(brightness.toFixed(0)),
      sloC: Number(contrast.toFixed(0))
    };
    router.currentRoute.value.path === PageRoute.MultipleLineScan &&
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

useBrightnessContrastListener({
  target: viewportRef,
  componentName: props.imageType,
  smartBc: props.smartBc,
  getBcAdjustCallback,
  setBcAdjustCallback
});

const updateSliceIndex = (idx: number) => {
  emits("updateActiveSlice", idx);
};

const drawLineWithParams = () => {
  drawLine({
    scanner: enfaceRef,
    width: props.enface.width * props.enface.spacingX,
    height: props.enface.height * props.enface.spacingY,
    spacingY: props.enface.spacingY,
    n: props.enface.height === 1 ? 1 : props.enface.height + 1,
    selected: props.activeSlice,
    cols: props.enface.width,
    divideCol: props.currentReferencePos,
    isStarScan: props.isStarScan,
    showBscanPosOnActiveLine: props.showBscanPosOnActiveLine,
    isCubeData: props.isCubeData,
    updateSliceIndex: updateSliceIndex
  });
};
watch(
  [
    () => props.activeSlice,
    () => props.currentReferencePos,
    () => props.showBscanPosOnActiveLine
  ],
  () => {
    drawLineWithParams();
  }
);
watch(
  () => props.slo.src,
  async src => {
    const sloDom = sloRef?.value as HTMLCanvasElement;
    if (!sloDom) return;
    const sloImage = await loadImage(src);
    let sloMat = cv.imread(sloImage);
    if (props.smartBc === 0 && showBcInfo.value) {
      setBcAdjustCallback({ b: props.brightness, c: props.contrast });
    } else {
      cv.imshow(sloDom, sloMat);
    }
    sloMat.delete();
  }
);
onMounted(async () => {
  ContainerNameEnum.SaveLineScanBscan !== props.imageType &&
    (loading.value = true);
  // 1.完成dom元素初始化
  const sloDom = sloRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const enfaceDom = enfaceRef?.value as SVGElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();

  setCustomTagName(innerContainerDom, props.imageType);
  initialSize(sloDom, props.slo.width, props.slo.height);
  transform(sloDom, props.slo.transform);
  const [a, b, c, d, e, f] = props.enface.transform;
  enfaceDom.style.transform = `translate(${c}px, ${
    props.isStarScan ? f - (props.enface.width * props.enface.spacingX) / 2 : f
  }px) rotate(${props.enface.rotate}deg) scaleY(${a / e > 0 ? 1 : -1})`;
  enfaceDom.style.width = `${props.enface.width * props.enface.spacingX}px`;

  if (props.isStarScan) {
    enfaceDom.style.height = `${props.enface.width * props.enface.spacingX}px`;
  } else {
    enfaceDom.style.height = `${
      props.enface.height === 1
        ? 1
        : props.enface.height * props.enface.spacingY
    }px`;
  }
  // 2.计算boundings
  const { innerWidth, innerHeight } = handleOctScopeBoundings(
    [sloDom, enfaceDom],
    innerContainerDom,
    viewportDom,
    props.imageType,
    true
  );
  // 4.加载图片
  const sloImage = await loadImage(props.slo.src);
  loading.value = false;
  autoResize({
    viewportDom,
    innerContainerDom,
    innerWidth,
    innerHeight
  });
  let sloMat = cv.imread(sloImage);
  if (props.smartBc === 0 && showBcInfo.value) {
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  } else {
    cv.imshow(sloDom, sloMat);
  }
  sloMat.delete();
  drawLineWithParams();
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  svgDom.style.display = "block";
  showTeleport.value = true;
  teleportTarget.value = viewportDom;

  // 加载ruler
  (router.currentRoute.value.path === PageRoute.LineScan ||
    (props.imageType === ContainerNameEnum.SaveLineScanSLO &&
      router.currentRoute.value.path === PageRoute.MultipleLineScan)) &&
    !window.isAllSaveImages &&
    drawMeasureData({
      viewportDom,
      viewerType: MeasureViewTypeEnum.CSSO,
      componentName: props.imageType
    });
});
watch(
  () => props.measureLoading,
  val => {
    const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
    !val &&
      setTimeout(() => {
        drawMeasureData({
          viewportDom,
          viewerType: MeasureViewTypeEnum.CSSO,
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

.enface {
  // border: 20px solid red;
  position: absolute;
  overflow: visible;
  transform-origin: left top;
  // will-change: transform;
}

:deep(.inner-container) {
  overflow: visible !important;
}

:deep(.coordinates) {
  display: none; // 临时更改
}

.oculus-direction {
  font-size: 15px;
  line-height: 18px;
  color: #fff;

  .direction {
    position: absolute;
    padding: 3px 5px;
    text-align: center;
    background: rgb(124 124 124 / 40%);
  }

  .top {
    top: 0;
    left: calc(50% - 25px);
  }

  .right {
    top: calc(50% - 17px);
    right: 0;
  }

  .bottom {
    bottom: 0;
    left: calc(50% - 27px);
  }

  .left {
    top: calc(50% - 17px);
    left: 0;
  }
}
</style>
