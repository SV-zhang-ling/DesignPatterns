<template>
  <view-port ref="viewportRef" :image-type="bscanType" :smart-bc="smartBc">
    <canvas class="bscan" ref="bscanRef" />
    <canvas class="angio" ref="angioRef" />
    <svg
      class="crosshair"
      :width="width"
      :height="height"
      ref="crosshairRef"
      :class="`${direction}-crosshair-svg`"
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
          {{ $t("analysis.index") }}: {{ Math.floor(index + 1) }}/{{ sum }}
        </div>
        <bscan-direction :oculusType="oculusType" :deg="-90" />
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
  ContextmenuTypeEnum,
  ContainerNameEnum,
  MeasureViewTypeEnum,
  AxisDirectionEnum
} from "@/enums";
import { setCustomTagName } from "@/utils/customElementAttr";
import { ELViewPort } from "../../types";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
import { initCrossHair } from "@/utils/tools/bscanCrosshair";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
import { autoResize } from "@/utils/autoResize/asyncResize";
import {
  handleBscanTransform,
  initialSize,
  transform,
  processImage,
  loadImage
} from "../../utils/handleImage";
import {
  drawLayer,
  getSegmentPointsByIndex
} from "@/utils/tools/segmentation/index";
import {
  getAsSegmentPointsByIndex,
  drawSurface
} from "@/utils/tools/asSegmentation";
import { throttle, debounce } from "xe-utils";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import { loadImageByXhr } from "../../utils/loadImageByXhr";
import { doLogout } from "@/utils/auth";
import { changeBscanMeasureDraw } from "@/utils/tools/measureTools/index";
import { drawMeasureData } from "@/utils/tools/measureTools/index";
import { PageRoute } from "@/utils/route";
import router from "@/router";

defineOptions({
  name: "FastBscan"
});
const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);
interface Props {
  src: string; // 图片路径
  angio?: string;
  width: number;
  height: number;
  processorsType?: ContextmenuTypeEnum.Gray | ContextmenuTypeEnum.Inverse; // 图片处理器，接收一个mat,返回一个mat,可选
  aspectRatioFactor: number;
  transform?: number[];
  showAngio: boolean;
  showFastBscan?: boolean;
  index: number;
  sum: number;
  averagedFramesPerSlice: number[];
  repeat?: number;
  zoomRatio: number;
  bscanZoomRulerHeight: number;
  bscanZoomRulerWidth: number;
  bscanZoomRuler: ({
    innerContainerDom,
    componentName
  }: {
    innerContainerDom?: HTMLElement;
    componentName?: string;
  }) => void;
  x: number;
  y: number;
  direction?: AxisDirectionEnum.FAST | AxisDirectionEnum.SLOW;
  surfaceLoading: boolean;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  dragCeilSurfaceDistance?: number;
  dragFloorSurfaceDistance?: number;
  oculusType: string;
  smartBc: number;
  bscanType?: ContainerNameEnum; // 标识是左侧bacan还是右侧bscan
  spacingZ_um?: number;
  isAsBscan?: boolean;
  ceilingShift?: number;
  floorShift?: number;
  downBoundary: number;
  brightness: number;
  contrast: number;
  setBrightnessContrast: ({
    fastBscanB,
    fastBscanC
  }: {
    fastBscanB?: number;
    fastBscanC?: number;
  }) => void;
  cscanLayerType?: string;
  isHorizontal?: boolean;
  isSmart?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  src: "",
  angio: "",
  width: 0,
  height: 0,
  processorsType: ContextmenuTypeEnum.Gray,
  aspectRatioFactor: 1,
  showAngio: true,
  showFastBscan: false,
  transform: () => [],
  index: 0,
  sum: 0,
  averagedFramesPerSlice: () => [],
  zoomRatio: 10,
  surfaceLoading: true,
  dragCeilSurfaceDistance: 0,
  dragFloorSurfaceDistance: 0,
  oculusType: "",
  direction: AxisDirectionEnum.FAST,
  bscanType: ContainerNameEnum.FastBScan,
  isAsBscan: false,
  brightness: 0,
  contrast: 0
});

const bscanRef = ref<HTMLCanvasElement | null>(null);
const angioRef = ref<HTMLCanvasElement | null>(null);
const crosshairRef = ref<SVGElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const currentIndex = ref(0);
const showBcInfo = computed(
  () =>
    Math.abs(Number(props.brightness.toFixed(0))) !== 0 ||
    Math.abs(Number(props.contrast.toFixed(0))) !== 0
);
const downCallback = () => {
  if (props.x < props.sum - 1) {
    props.commitCrosshairPosition({ x: props.x + 1 });
  }
};
const upCallback = () => {
  if (props.x > 0) {
    props.commitCrosshairPosition({ x: props.x - 1 });
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
    const bscanDom = bscanRef?.value as HTMLCanvasElement;
    if (!bscanDom) return;
    const { brightness, contrast }: any = await setBcAdjust({
      dom: bscanDom,
      src: props.src,
      b,
      c,
      processorsType: props.processorsType
    });
    props.setBrightnessContrast({
      fastBscanB: Number(brightness.toFixed(0)),
      fastBscanC: Number(contrast.toFixed(0))
    });
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
  componentName: props.bscanType
});
useBrightnessContrastListener({
  target: viewportRef,
  componentName: props.bscanType,
  smartBc: props.smartBc,
  getBcAdjustCallback,
  setBcAdjustCallback
});
const showImageByMat = (
  dom: HTMLCanvasElement,
  mat: Mat,
  processorsType?: ContextmenuTypeEnum.Gray | ContextmenuTypeEnum.Inverse
) => {
  if (props.smartBc === 0 && showBcInfo.value) {
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  } else {
    if (processorsType && processorsType !== ContextmenuTypeEnum.Gray) {
      // 接收外部processor传来的处理过后的mat
      let dst = processImage(mat, processorsType);
      cv.imshow(dom, dst);
      dst.delete();
    } else {
      // 外部没有传入processor 则以原图模式渲染
      cv.imshow(dom, mat);
    }
  }
  !mat.isDeleted() && mat.delete();
};

const drawBscanSurfaces = (
  ceilingSurfMat: Mat,
  floorSurfMat: Mat,
  svgDom: SVGElement
) => {
  if (!ceilingSurfMat && !floorSurfMat) return;

  if (props.isAsBscan) {
    const svgDomWidth = Number(svgDom.getAttribute("width"));
    const ceilingSurfPoints = getAsSegmentPointsByIndex(
      props.x,
      ceilingSurfMat,
      AxisDirectionEnum.FAST
    );
    const floorSurfPoints = getAsSegmentPointsByIndex(
      props.x,
      floorSurfMat,
      AxisDirectionEnum.FAST
    );
    if (!ceilingSurfPoints || !floorSurfPoints) return;
    drawSurface({
      svgDom,
      surfPointArr: [ceilingSurfPoints, floorSurfPoints],
      width: svgDomWidth,
      cols: props.height,
      spacingZ_um: props.spacingZ_um,
      ceilingShift: props.ceilingShift,
      floorShift: props.floorShift
    });
    return;
  }

  const ceilingSurfPoints =
    ceilingSurfMat &&
    getSegmentPointsByIndex(
      props.x,
      ceilingSurfMat,
      props.width,
      props.height,
      props.direction,
      props.isHorizontal
    );
  const floorSurfPoints =
    floorSurfMat &&
    getSegmentPointsByIndex(
      props.x,
      floorSurfMat,
      props.width,
      props.height,
      props.direction,
      props.isHorizontal
    );
  const translateSurface = drawLayer({
    svgDom,
    ceilingSurfPoints,
    floorSurfPoints,
    cols: props.width,
    rows: props.height,
    direction: props.direction,
    item: null
  });
  if (!ceilingSurfPoints && !floorSurfPoints) return;
  translateCeilSurface = translateSurface?.translateCeilSurface;
  translatefloorSurface = translateSurface?.translatefloorSurface;
};

const no_throttle_commit_status = ([
  src,
  angio,
  x,
  processorsType,
  showAngio
]) => {
  const bscanDom = bscanRef?.value as HTMLCanvasElement;
  const angioDom = angioRef?.value as HTMLCanvasElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  const svgDom = innerContainerDom?.querySelector(".coordinates") as SVGElement;

  const requestArr = showAngio
    ? [
        loadImageByXhr(src, x, props.bscanType),
        loadImageByXhr(angio, x, props.bscanType)
      ]
    : [loadImageByXhr(src, x, props.bscanType)];
  // 同步血流和bscan
  Promise.all(requestArr)
    .then(([bscanMat, angioMat]) => {
      if (!bscanMat) return;

      showImageByMat(bscanDom, bscanMat, processorsType);
      angioDom.style.display = showAngio ? "block" : "none";
      showAngio && showImageByMat(angioDom, angioMat);
      currentIndex.value = x;
      if (!window.ceilingSurfMat && !window.floorSurfMat) return;
      drawBscanSurfaces(
        window.ceilingSurfMat?.[1],
        window.floorSurfMat?.[1],
        svgDom
      );
    })
    .catch(error => {
      console.error(error);
      // doLogout();
    });
};
const throttle_commit_status = throttle(no_throttle_commit_status, 100);
const debounce_commit_status = debounce(no_throttle_commit_status, 100);
let moveVerticalLine: (y: number) => void;
let translateCeilSurface, translatefloorSurface;
watch(
  () => props.dragCeilSurfaceDistance,
  deltaY => {
    translateCeilSurface && translateCeilSurface(deltaY);
  }
);
watch(
  () => props.dragFloorSurfaceDistance,
  deltaY => {
    translatefloorSurface && translatefloorSurface(deltaY);
  }
);
watch(
  () => props.surfaceLoading,
  async surfaceLoading => {
    if (surfaceLoading === false) {
      await nextTick();
      const innerContainerDom = viewportRef.value?.getInnerContainerRef();
      const svgDom = innerContainerDom.querySelector(
        ".coordinates"
      ) as SVGElement;
      drawBscanSurfaces(
        window.ceilingSurfMat?.[1],
        window.floorSurfMat?.[1],
        svgDom
      );
    }
  },
  { immediate: true, flush: "post" }
);

watch(
  () => props.cscanLayerType,
  async () => {
    await nextTick();

    const innerContainerDom = viewportRef.value?.getInnerContainerRef();
    const svgDom = innerContainerDom?.querySelector(
      ".coordinates"
    ) as SVGElement;
    const floorSurfMat = window.floorSurfMat?.[1];
    drawBscanSurfaces(undefined, floorSurfMat, svgDom);
  }
);

watch(
  [
    () => props.src,
    () => props.angio,
    () => props.x,
    () => props.processorsType,
    () => props.showAngio
  ],
  (currentParams, lastParams) => {
    moveVerticalLine && moveVerticalLine(props.y);
    throttle_commit_status(currentParams, lastParams);
    debounce_commit_status(currentParams, lastParams);
  }
);
watch(
  () => props.y,
  () => {
    moveVerticalLine && moveVerticalLine(props.y);
  }
);
watch(
  () => props.index,
  async (newIndex, oldIndex) => {
    const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
    changeBscanMeasureDraw({
      viewportDom,
      viewerType: MeasureViewTypeEnum.FastBScan,
      newIndex,
      oldIndex
    });
  }
);
onMounted(async () => {
  currentIndex.value = props.x;
  const bscanDom = bscanRef?.value as HTMLCanvasElement;
  const angioDom = angioRef?.value as HTMLCanvasElement;
  const crosshairDom = crosshairRef?.value as SVGElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  setCustomTagName(innerContainerDom, props.bscanType);
  initialSize(bscanDom, props.width, props.height);
  initialSize(angioDom, props.width, props.height);
  const bscanTransform = handleBscanTransform(
    props.transform,
    props.aspectRatioFactor
  );
  transform(bscanDom, bscanTransform);

  transform(angioDom, bscanTransform);
  transform(crosshairDom, bscanTransform);

  // 1.完成dom元素初始化
  // await nextTick();
  // 2.计算boundings
  const { innerWidth, innerHeight } = handleNodesBoundings(
    [bscanDom, angioDom, crosshairDom],
    innerContainerDom,
    viewportDom,
    props.bscanType
  );
  if (
    [PageRoute.Cube, PageRoute.AsCube].includes(
      router.currentRoute.value.path
    ) ||
    window.isSaveImages
  ) {
    const bscanImage = await loadImage(props.src);
    autoResize({
      viewportDom,
      innerContainerDom,
      innerWidth,
      innerHeight,
      downBoundary: props.downBoundary,
      rows: bscanImage.width
    });
  }

  // 4.加载图片
  const bscanMat = await loadImageByXhr(props.src);
  if (!bscanMat) return;
  if (props.smartBc === 0 && showBcInfo.value) {
    setBcAdjustCallback({ b: props.brightness, c: props.contrast });
  } else {
    if (props.processorsType !== ContextmenuTypeEnum.Gray) {
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

  if (props.showAngio === true) {
    const angioMat = await loadImageByXhr(props.angio);
    if (!angioMat) return;
    cv.imshow(angioDom, angioMat);
    angioMat.delete();
  }
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  const methods = initCrossHair({
    svgDom,
    rows: props.height,
    direction: props.direction,
    commitCrosshairPosition: props.commitCrosshairPosition
  });
  moveVerticalLine = methods.moveVerticalLine;
  moveVerticalLine(props.y);
  // bscan 挂载后才能显示Teleport组件，否则将无法将teleport包裹的Vnode传送挂载到view-prot组件上
  showTeleport.value = true;
  teleportTarget.value = viewportDom;

  // 加载ruler
  drawMeasureData({
    viewportDom,
    viewerType: MeasureViewTypeEnum.FastBScan,
    componentName: props.bscanType,
    sliceIndex: props.index
  });
});
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

.bscan-index-info,
.bscan-zoom-info {
  position: absolute;
  bottom: 8px;
  color: #fff;
  // 设置user-select样式属性为none来避免文字被选中
  user-select: none;
}

.bscan-index-info {
  right: 8px;
  width: 176px;
  font-size: 15px;
  font-weight: normal;
  line-height: 18px;
  text-align: right;
}

.bscan-zoom-info {
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

:deep(.bscan-direction) {
  justify-content: flex-end;
}
</style>
