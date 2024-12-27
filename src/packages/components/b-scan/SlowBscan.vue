<template>
  <view-port
    ref="viewportRef"
    :image-type="bscanType"
    :smart-bc="smartBc"
    :captureKey="captureKey"
  >
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
          {{ $t("analysis.average") }}:
          {{ averagedFramesPerSlice[Math.floor(index)] }}/{{ repeat }}
        </div>
        <div class="shadow-info">
          {{ $t("analysis.index") }}: {{ Math.floor(index + 1) }}/{{ sum }}
        </div>
        <bscan-direction :oculusType="oculusType" :deg="0" />
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
  AxisDirectionEnum,
  MeasureViewTypeEnum
} from "@/enums";
import { setCustomTagName } from "@/utils/customElementAttr";
import { ELViewPort } from "../../types";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
import { initCrossHair } from "@/utils/tools/bscanCrosshair";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import useBrightnessContrastListener, {
  setBcAdjust
} from "@/packages/utils/brightnessContrastHook";
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
import { autoResize } from "@/utils/autoResize/asyncResize";
import { throttle, debounce } from "xe-utils";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import { loadImageByXhr } from "../../utils/loadImageByXhr";
import { PageRoute } from "@/utils/route";
import router from "@/router";
import { CaptureDetailWithKey } from "@/views/analysis/store/analysisMultipleCommon";
import { changeBscanMeasureDraw } from "@/utils/tools/measureTools/index";
import { drawMeasureData } from "@/utils/tools/measureTools/index";

defineOptions({
  name: "SlowBscan"
});
const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);
interface Props {
  bscanType: ContainerNameEnum; // 标识是左侧bacan还是右侧bscan
  src: string; // 图片路径
  angio?: string;
  width?: number;
  height?: number;
  processorsType?: ContextmenuTypeEnum.Gray | ContextmenuTypeEnum.Inverse; // 图片处理器，接收一个mat,返回一个mat,可选
  aspectRatioFactor: number;
  transform?: number[];
  direction?: AxisDirectionEnum.FAST | AxisDirectionEnum.SLOW;
  showAngio: boolean;
  index: number;
  sum: number;
  averagedFramesPerSlice: number[];
  repeat: number;
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
  dragCeilSurfaceDistance?: number;
  dragFloorSurfaceDistance?: number;
  surfaceLoading?: boolean;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  oculusType: string;
  smartBc: number;
  captureKey?: string;
  captureDetail?: CaptureDetailWithKey;
  spacingZ_um?: number;
  isAsBscan?: boolean;
  ceilingShift?: number;
  floorShift?: number;
  measureLoading?: boolean;
  showUserinput?: boolean;
  brightness: number;
  contrast: number;
  downBoundary: number;
  setBrightnessContrast: ({
    captureKey,
    slowBscanB,
    slowBscanC,
    fastBscanB,
    fastBscanC
  }: {
    captureKey?: string;
    slowBscanB?: number;
    slowBscanC?: number;
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
  aspectRatioFactor: 1,
  direction: AxisDirectionEnum.SLOW,
  showAngio: true,
  transform: () => [],
  index: 0,
  sum: 0,
  averagedFramesPerSlice: () => [],
  zoomRatio: 10,
  surfaceLoading: true,
  dragCeilSurfaceDistance: 0,
  dragFloorSurfaceDistance: 0,
  oculusType: "",
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
  if (props.y < props.sum - 1) {
    props.commitCrosshairPosition({ y: props.y + 1 });
  }
};
const upCallback = () => {
  if (props.y > 0) {
    props.commitCrosshairPosition({ y: props.y - 1 });
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
    props.bscanType === ContainerNameEnum.SlowBScanAttach &&
      props.setBrightnessContrast({
        fastBscanB: Number(brightness.toFixed(0)),
        fastBscanC: Number(contrast.toFixed(0))
      });
    if (
      [
        ContainerNameEnum.SlowBScanMain,
        ContainerNameEnum.OctSlowBscan,
        ContainerNameEnum.CubeSlowBscan
      ].includes(props.bscanType)
    ) {
      const params: any = {
        slowBscanB: Number(brightness.toFixed(0)),
        slowBscanC: Number(contrast.toFixed(0))
      };
      router.currentRoute.value.path === PageRoute.MultipleAngio &&
        (params.captureKey = props.captureKey);
      props.setBrightnessContrast(params);
    }
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
      props.y,
      ceilingSurfMat
    );
    const floorSurfPoints = getAsSegmentPointsByIndex(props.y, floorSurfMat);
    if (!ceilingSurfPoints && !floorSurfPoints) return;
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
      props.y,
      ceilingSurfMat,
      props.width,
      props.height,
      undefined,
      props.isHorizontal
    );
  const floorSurfPoints =
    floorSurfMat &&
    getSegmentPointsByIndex(
      props.y,
      floorSurfMat,
      props.width,
      props.height,
      undefined,
      props.isHorizontal
    );
  if (!ceilingSurfPoints && !floorSurfPoints) return;
  const translateSurface = drawLayer({
    svgDom,
    ceilingSurfPoints,
    floorSurfPoints,
    cols: props.width,
    rows: props.height,
    direction: props.direction,
    item:
      router.currentRoute.value.path === PageRoute.MultipleAngio
        ? props.captureDetail
        : null
  });
  translateCeilSurface = translateSurface?.translateCeilSurface;
  translatefloorSurface = translateSurface?.translatefloorSurface;
};

const no_throttle_commit_status = ([
  src,
  angio,
  y,
  processorsType,
  showAngio
]) => {
  const bscanDom = bscanRef?.value as HTMLCanvasElement;
  const angioDom = angioRef?.value as HTMLCanvasElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  const svgDom = innerContainerDom?.querySelector(".coordinates") as SVGElement;

  const requestArr = showAngio
    ? [
        loadImageByXhr(src, y, props.bscanType),
        loadImageByXhr(angio, y, props.bscanType)
      ]
    : [loadImageByXhr(src, y, props.bscanType)];
  // 同步血流和bscan
  Promise.all(requestArr)
    .then(([bscanMat, angioMat]) => {
      if (!bscanMat) return;
      showImageByMat(bscanDom, bscanMat, processorsType);
      angioDom.style.display = showAngio ? "block" : "none";
      showAngio && showImageByMat(angioDom, angioMat);
      currentIndex.value = y;
      const currWindow =
        props.bscanType === ContainerNameEnum.SaveSlowBScanMain &&
        router.currentRoute.value.path === PageRoute.MultipleAngio
          ? window[props.captureDetail?.captureKey]
          : window[props.captureKey];
      let ceilingSurfMat, floorSurfMat;
      if (router.currentRoute.value.path === PageRoute.MultipleAngio) {
        ceilingSurfMat = currWindow?.ceilingSurfMat[0];
        floorSurfMat = currWindow?.floorSurfMat[0];
      } else {
        if (window.ceilingSurfMat) {
          ceilingSurfMat = window.ceilingSurfMat[0];
        }
        if (window.floorSurfMat) {
          floorSurfMat = window.floorSurfMat[0];
        }
      }
      drawBscanSurfaces(ceilingSurfMat, floorSurfMat, svgDom);
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
    // console.log(props.dragCeilSurfaceDistance, "dragCeilSurfaceDistance");
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
  async val => {
    if (val === false) {
      await nextTick();
      setTimeout(() => {
        const innerContainerDom = viewportRef.value?.getInnerContainerRef();
        const svgDom = innerContainerDom?.querySelector(
          ".coordinates"
        ) as SVGElement;
        const currWindow =
          props.bscanType === ContainerNameEnum.SaveSlowBScanMain &&
          router.currentRoute.value.path === PageRoute.MultipleAngio
            ? window[props.captureDetail?.captureKey]
            : window[props.captureKey];
        if (
          router.currentRoute.value.path === PageRoute.MultipleAngio &&
          !currWindow
        )
          return;
        const ceilingSurfMat =
          router.currentRoute.value.path === PageRoute.MultipleAngio
            ? currWindow?.ceilingSurfMat[0]
            : window.ceilingSurfMat?.[0];
        const floorSurfMat =
          router.currentRoute.value.path === PageRoute.MultipleAngio
            ? currWindow?.floorSurfMat[0]
            : window.floorSurfMat?.[0];
        drawBscanSurfaces(ceilingSurfMat, floorSurfMat, svgDom);
      }, 500);
    }
  },
  { immediate: true, flush: "post" }
);

// cube cscan bscan surfaces
watch(
  () => props.cscanLayerType,
  async () => {
    await nextTick();

    const innerContainerDom = viewportRef.value?.getInnerContainerRef();
    const svgDom = innerContainerDom?.querySelector(
      ".coordinates"
    ) as SVGElement;
    const floorSurfMat = window.floorSurfMat?.[0];
    drawBscanSurfaces(undefined, floorSurfMat, svgDom);
  }
);

watch(
  [
    () => props.src,
    () => props.angio,
    () => props.y,
    () => props.processorsType,
    () => props.showAngio
  ],
  (currentParams, lastParams) => {
    moveVerticalLine && moveVerticalLine(props.x);
    throttle_commit_status(currentParams, lastParams);
    // 每次mousemove 额外添加一个当前帧的请求用宏任务包裹，超时设置为100ms
    // 如果鼠标mousemove停顿或者 mouseup超过100ms则取消上次mousemove的宏任务
    // 如果不超过则取消上次的宏任务，避免网络开销，不影响主线程帧的请求和渲染
    // 仍然有个小缺点，如果是点击或者滚轮，keyup 这些非拖拽行为，也会额外增加一次宏任务请求
    // 不过影响不大，后面再标记这些行为，根据具体的action决定是否额外添加宏任务
    debounce_commit_status(currentParams, lastParams);
  }
);
watch(
  () => props.x,
  () => {
    moveVerticalLine && moveVerticalLine(props.x);
  }
);
watch(
  () => props.index,
  async (newIndex, oldIndex) => {
    if (
      [
        ContainerNameEnum.SlowBScanMain,
        ContainerNameEnum.OctSlowBscan
      ].includes(props.bscanType)
    ) {
      const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
      changeBscanMeasureDraw({
        viewportDom,
        viewerType: MeasureViewTypeEnum.SlowBScan,
        newIndex,
        oldIndex
      });
    }
  }
);
onMounted(async () => {
  currentIndex.value = props.y;
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
    props.bscanType,
    props.captureKey
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
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  const methods = initCrossHair({
    svgDom,
    rows: props.height,
    direction: props.direction,
    commitCrosshairPosition: props.commitCrosshairPosition
  });
  moveVerticalLine = methods.moveVerticalLine;
  moveVerticalLine(props.x);
  // bscan 挂载后才能显示Teleport组件，否则将无法将teleport包裹的Vnode传送挂载到view-prot组件上
  showTeleport.value = true;
  teleportTarget.value = viewportDom;
  if (props.showAngio) {
    const angioMat = await loadImageByXhr(props.angio);
    if (!angioMat) return;
    cv.imshow(angioDom, angioMat);
    angioMat.delete();
  }
  // 加载ruler
  (([
    ContainerNameEnum.SlowBScanMain,
    ContainerNameEnum.OctSlowBscan,
    ContainerNameEnum.SaveSlowBScanMain,
    ContainerNameEnum.SaveSlowBScanAttach,
    ContainerNameEnum.SaveOctSlowBscan,
    ContainerNameEnum.CubeSlowBscan
  ].includes(props.bscanType) &&
    router.currentRoute.value.path !== PageRoute.MultipleAngio) ||
    (props.bscanType === ContainerNameEnum.SaveSlowBScanMain &&
      router.currentRoute.value.path === PageRoute.MultipleAngio)) &&
    drawMeasureData({
      viewportDom,
      viewerType: MeasureViewTypeEnum.SlowBScan,
      componentName: props.bscanType,
      sliceIndex: props.index
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

.shadow-info {
  text-shadow: 2px 1px $border-color-dark;
}

:deep(.bscan-direction) {
  justify-content: flex-end;
}
</style>
