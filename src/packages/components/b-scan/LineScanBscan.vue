<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="bscanType"
    :smart-bc="smartBc"
  >
    <canvas class="bscan" ref="bscanRef"></canvas>
    <svg
      class="crosshair"
      :width="width"
      :height="height"
      ref="crosshairRef"
    ></svg>
    <teleport v-if="showTeleport" :to="teleportTarget">
      <div class="bscan-index-info">
        <brightness-contrast-card
          v-if="smartBc === 0"
          :brightness="brightness"
          :contrast="contrast"
          :isBscan="true"
          @handleResetBc="handleResetBc"
        />
        <div class="shadow-info">
          {{ $t("analysis.average") }}:
          {{ averagedFramesPerSlice[Math.floor(index)] }}/{{ repeat }}
        </div>
        <div class="shadow-info">
          {{ $t("analysis.index") }}:
          {{ sum === 1 ? 1 : Math.floor(index + 1) }}/{{ sum }}
        </div>
        <bscan-direction
          :oculusType="oculusType"
          :deg="isStarScan ? -90 + (index * 180) / sum : rotate"
        />
      </div>
      <div
        class="bscan-zoom-info"
        :style="`height:${bscanZoomRulerHeight}px;width:${bscanZoomRulerWidth}px`"
      >
        <span class="zoom-ratio shadow-info">{{ zoomRatio }} μm</span>
      </div>
    </teleport>
  </view-port>
</template>

<script lang="ts" setup>
import {
  ContainerNameEnum,
  ContextmenuTypeEnum,
  MeasureViewTypeEnum
} from "@/enums";
import { ELViewPort } from "../../types";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
// import { autoResize } from "../viewport/viewport";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import {
  handleBscanTransform,
  initialSize,
  transform,
  loadImage,
  processImage
} from "../../utils/handleImage";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
import { autoResize } from "@/utils/autoResize/asyncResize";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import useArrowKeysListener from "@/packages/utils/arrowDownUpListenerHook";
import { useLineScanStore } from "@/views/analysis/lineScan/single/store/index";
import { initCrossHair } from "@/utils/tools/lineBscanCrosshair";
import { setCustomTagName } from "@/utils/customElementAttr";
import { AS_SURFACE_LIST } from "@/utils/constant";
import {
  getAsSegmentPointsByIndex,
  drawSurface
} from "@/utils/tools/asSegmentation";
import { changeBscanMeasureDraw } from "@/utils/tools/measureTools/index";
import { drawMeasureData } from "@/utils/tools/measureTools/index";
import { PageRoute } from "@/utils/route";
import router from "@/router";
import { throttle } from "xe-utils";

const emits = defineEmits(["updateActiveSlice"]);

defineOptions({
  name: "LineScanBscan"
});

const lineScanStore = useLineScanStore();
const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);
let moveVerticalLine: (pos: number) => void;
interface Props {
  src: string; // 图片路径
  width?: number;
  height?: number;
  index: number;
  aspectRatioFactor?: number;
  transform?: number[];
  processorsType?:
    | ContextmenuTypeEnum.Gray
    | ContextmenuTypeEnum.Inverse
    | ContextmenuTypeEnum.Classic; // 图片处理器，接收一个mat,返回一个mat,可选
  smartBc: number;
  repeat: number;
  averagedFramesPerSlice: number[];
  sum: number;
  oculusType: string;
  isStarScan: boolean;
  rotate: number;
  cols: number;
  downBoundary: number;
  spacingZ_um?: number;
  isAS?: boolean;
  activeSlice: number;
  currentReferencePos: number;
  referencePosSet: number[];
  setReferencePos: () => void;
  captureKey?: string;
  measureLoading?: boolean;
  brightness: number;
  contrast: number;
  zoomRatio: number;
  bscanZoomRulerHeight: number;
  bscanZoomRulerWidth: number;
  bscanZoomRuler?: ({
    innerContainerDom,
    componentName
  }: {
    innerContainerDom?: HTMLElement;
    componentName?: string;
  }) => void;
  setBrightnessContrast: ({
    captureKey,
    bscanB,
    bscanC
  }: {
    captureKey?: string;
    bscanB?: number;
    bscanC?: number;
  }) => void;
  bscanType?: ContainerNameEnum;
}
const props = withDefaults(defineProps<Props>(), {
  src: "",
  aspectRatioFactor: 0.4,
  transform: () => [],
  downBoundary: 0,
  brightness: 0,
  contrast: 0,
  bscanType: ContainerNameEnum.LineScanBscan
});

const bscanRef = ref<HTMLCanvasElement | null>(null);
const crosshairRef = ref<SVGElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const loading = ref<boolean>(false);
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
    const bscanDom = bscanRef?.value as HTMLCanvasElement;
    if (!bscanDom) return;
    const { brightness, contrast }: any = await setBcAdjust({
      dom: bscanDom,
      src: props.src,
      b,
      c,
      processorsType: props.processorsType
    });
    const params: any = {
      bscanB: Number(brightness.toFixed(0)),
      bscanC: Number(contrast.toFixed(0))
    };
    router.currentRoute.value.path === PageRoute.MultipleLineScan &&
      (params.captureKey = props.captureKey);
    props.setBrightnessContrast(params);
  },
  100
);

useDoubleClick({
  target: viewportRef,
  componentName: props.bscanType
});
useBrightnessContrastListener({
  target: viewportRef,
  componentName: props.bscanType,
  smartBc: props.smartBc,
  getBcAdjustCallback,
  setBcAdjustCallback
});

const updateSliceIndex = (idx: number) => {
  emits("updateActiveSlice", idx);
};

const downCallback = () => {
  if (props.activeSlice < props.sum - 1)
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
useMouseWheelListener({
  target: viewportRef,
  downCallback,
  upCallback
});
useArrowKeysListener(downCallback, upCallback, props.captureKey);

const getASSurfacePoints = () => {
  return new Promise((resolve, reject) => {
    try {
      const surfPointArr = AS_SURFACE_LIST.map(
        (item: { value: string; surfType: string }) => {
          /* eslint-disable */
          // @ts-ignore
          return getAsSegmentPointsByIndex(props.index, window[item.surfType]);
        }
      );
      resolve(surfPointArr);
    } catch (err) {
      reject(err);
    }
  });
};

watch(
  [
    () => props.src,
    () => props.processorsType,
    () => lineScanStore.surfLoading
  ],
  async ([src, processorsType, surfLoading]) => {
    // const svgDom = crosshairRef?.value as SVGElement;
    const innerContainerDom = viewportRef.value?.getInnerContainerRef();
    const svgDom = innerContainerDom.querySelector(
      ".coordinates"
    ) as SVGElement;
    const bscanDom = bscanRef?.value as HTMLCanvasElement;
    const svgDomWidth = Number(svgDom.getAttribute("width"));

    if (!svgDomWidth) return;

    const requestArr =
      props.isAS && lineScanStore.corrected && !surfLoading
        ? [loadImage(src), getASSurfacePoints()]
        : [loadImage(src)];
    Promise.all([...requestArr]).then(([image, surfPointArr]) => {
      const mat = cv.imread(image);
      if (props.smartBc === 0 && showBcInfo.value) {
        setBcAdjustCallback({ b: props.brightness, c: props.contrast });
      } else {
        if (processorsType) {
          // 接收外部processor传来的处理过后的mat
          let dst = processImage(mat, processorsType);
          cv.imshow(bscanDom, dst);
          dst.delete();
        } else {
          // 外部没有传入processor 则以原图模式渲染
          cv.imshow(bscanDom, mat);
        }
      }
      mat.delete();

      surfPointArr &&
        drawSurface({
          svgDom,
          surfPointArr,
          width: svgDomWidth,
          cols: props.cols,
          spacingZ_um: props.spacingZ_um
        });
    });
  }
);

watch(
  () => props.currentReferencePos,
  (pos: number) => {
    moveVerticalLine && moveVerticalLine(pos);
  }
);
watch(
  () => props.index,
  async (newIndex, oldIndex) => {
    if (oldIndex === -1) return;
    const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
    changeBscanMeasureDraw({
      viewportDom,
      viewerType: MeasureViewTypeEnum.SlowBScan,
      newIndex,
      oldIndex
    });
  }
);

onMounted(async () => {
  ContainerNameEnum.SaveLineScanBscan !== props.bscanType &&
    (loading.value = true);
  const bscanDom = bscanRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();

  setCustomTagName(innerContainerDom, props.bscanType);
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
  const [a, b, c, d, e, f] = bscanTransform;
  transform(bscanDom, bscanTransform);

  // 1.完成dom元素初始化

  // 2.计算boundings
  const { innerWidth, innerHeight } = handleNodesBoundings(
    [bscanDom],
    innerContainerDom,
    viewportDom,
    props.bscanType
  );
  autoResize({
    viewportDom,
    innerContainerDom,
    innerWidth,
    innerHeight,
    downBoundary: props.downBoundary,
    rows: width
  });
  let bscanMat = cv.imread(bscanImage);
  if (props.smartBc === 0 && showBcInfo.value) {
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  } else {
    if (props.processorsType) {
      // 接收外部processor传来的处理过后的mat
      let dst = processImage(bscanMat, props.processorsType);
      cv.imshow(bscanDom, dst);
      dst.delete();
    } else {
      // 外部没有传入processor 则以原图模式渲染
      cv.imshow(bscanDom, bscanMat);
    }
  }
  bscanMat.delete();
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  moveVerticalLine = initCrossHair({
    svgDom,
    width: innerWidth,
    height: innerHeight,
    cols: props.cols,
    referenceActivePos: props.referencePosSet[props.index],
    setReferencePos: props.setReferencePos
  });
  showTeleport.value = true;
  teleportTarget.value = viewportDom;

  // draw as surface
  if (props.isAS) {
    const surfPointArr = await getASSurfacePoints();
    drawSurface({
      svgDom,
      surfPointArr,
      width: innerWidth,
      cols: props.cols,
      spacingZ_um: props.spacingZ_um
    });
  }

  (router.currentRoute.value.path === PageRoute.LineScan ||
    (props.bscanType === ContainerNameEnum.SaveLineScanBscan &&
      router.currentRoute.value.path === PageRoute.MultipleLineScan)) &&
    drawMeasureData({
      viewportDom,
      viewerType: MeasureViewTypeEnum.SlowBScan,
      componentName: props.bscanType,
      sliceIndex: props.index
    });
  props.bscanZoomRuler &&
    props.bscanZoomRuler({
      innerContainerDom,
      componentName: props.bscanType
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
          viewerType: MeasureViewTypeEnum.SlowBScan,
          componentName: props.bscanType,
          sliceIndex: props.index
        });
      }, 500);
  },
  { deep: true }
);
const handleResetBc = () => setBcAdjustCallback({ b: 0, c: 0 });
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
canvas,
.crosshair {
  position: absolute;
  transform-origin: left top;
}

.bscan-index-info {
  right: 8px;
  width: 176px;
  font-size: 15px;
  font-weight: normal;
  line-height: 18px;
  text-align: right;
}

.bscan-index-info,
.bscan-zoom-info {
  position: absolute;
  bottom: 8px;
  color: #fff;
  // 设置user-select样式属性为none来避免文字被选中
  user-select: none;
}

.shadow-info {
  text-shadow: 2px 1px $border-color-dark;
}

:deep(.bscan-direction) {
  justify-content: flex-end;
}

.bscan-zoom-info {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 30px;
  height: 60px;
  padding-left: 5px;
  font-size: 12px;
  color: #fff;
  // 设置user-select样式属性为none来避免文字被选中
  user-select: none;
  border-bottom: 2px solid white;
  border-left: 2px solid white;

  .zoom-ratio {
    position: absolute;
    bottom: 4px;
    left: 4px;
    width: 50px;
  }
}

// :deep(.inner-container) {
//   transition: transform 10ms !important;
// }
</style>
