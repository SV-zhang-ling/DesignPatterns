<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="ContainerNameEnum.ManualFastBscan"
    :smart-bc="smartBc"
  >
    <canvas class="bscan" ref="bscanRef"></canvas>
    <teleport v-if="showTeleport" :to="teleportTarget">
      <div class="bscan-index-info">
        <div class="shadow-info">
          {{ $t("analysis.index") }}: {{ Math.floor(index + 1) }}/{{ sum }}
        </div>
        <bscan-direction :oculusType="oculusType" :deg="-90" />
      </div>
    </teleport>
  </view-port>
</template>

<script lang="ts" setup>
import {
  initSegmentation,
  drawAllFastPosteriorSurface
} from "@/utils/tools/segmentation/drawAllFastSeg";
import { handleNodesBoundings } from "@/packages/utils/handleNodesBoundings";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import useDoubleClick from "@/packages/utils/doubleClickListenerHook";
import { ContainerNameEnum, ContextmenuTypeEnum } from "@/enums";
import { setCustomTagName } from "@/utils/customElementAttr";
import { initCrossHair } from "@/utils/tools/bscanCrosshair";
import { autoResize } from "@/utils/autoResize/asyncResize";
import { loadImageByXhr } from "../../utils/loadImageByXhr";
import { throttle } from "xe-utils";
import { ELViewPort } from "../../types";
import { doLogout } from "@/utils/auth";
import {
  handleBscanTransform,
  initialSize,
  transform,
  processImage
} from "../../utils/handleImage";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";

defineOptions({
  name: "ManualLayerFastBscan"
});

const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);
const editLayersStore = useEditLayersStoreHook();
interface Props {
  src: string;
  width: number;
  height: number;
  transform?: number[];
  processorsType?: ContextmenuTypeEnum.Gray | ContextmenuTypeEnum.Inverse; // 图片处理器，接收一个mat,返回一个mat,可选
  aspectRatioFactor: number;
  index: number;
  sum: number;
  zoomRatio: number;
  x: number;
  y: number;
  downBoundary: number;
  surfaceLoading: boolean;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
  oculusType: string;
  smartBc: number;
  isAS?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  src: "",
  width: 0,
  height: 0,
  transform: () => [],
  processorsType: ContextmenuTypeEnum.Gray,
  aspectRatioFactor: 1,
  index: 0,
  sum: 0,
  zoomRatio: 10,
  surfaceLoading: true,
  oculusType: "",
  downBoundary: 0
});

const bscanRef = ref<HTMLCanvasElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const loading = ref<boolean>(false);
const currentIndex = ref(0);

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
useMouseWheelListener({
  target: viewportRef,
  downCallback,
  upCallback
});
useDoubleClick({
  target: viewportRef,
  componentName: ContainerNameEnum.ManualFastBscan
});

const showImageByMat = (
  dom: HTMLCanvasElement,
  mat: Mat,
  processorsType?: ContextmenuTypeEnum.Gray | ContextmenuTypeEnum.Inverse
) => {
  if (processorsType && processorsType !== ContextmenuTypeEnum.Gray) {
    // 接收外部processor传来的处理过后的mat
    let dst = processImage(mat, processorsType);
    cv.imshow(dom, dst);
    !dst.isDeleted() && dst.delete();
  } else {
    // 外部没有传入processor 则以原图模式渲染
    cv.imshow(dom, mat);
  }
  !mat.isDeleted() && mat.delete();
};
const no_throttle_commit_status = async ([src, x, processorsType]: [
  string,
  number,
  ContextmenuTypeEnum.Gray | ContextmenuTypeEnum.Inverse
]) => {
  const bscanDom = bscanRef?.value as HTMLCanvasElement;
  try {
    const bscanMat = await loadImageByXhr(
      src,
      x,
      ContainerNameEnum.ManualFastBscan
    );
    if (!bscanMat) return;
    showImageByMat(bscanDom, bscanMat, processorsType);
    currentIndex.value = x;
    drawAllFastPosteriorSurface();
  } catch (err) {
    console.error(err);
    // doLogout();
  }
};

const throttle_commit_status = throttle(no_throttle_commit_status, 100);
let moveVerticalLine: (y: number) => void;
watch(
  [() => props.src, () => props.x, () => props.processorsType],
  (currentParams, lastParams) => {
    throttle_commit_status(currentParams, lastParams);
  }
);
watch(
  () => props.y,
  () => {
    moveVerticalLine && moveVerticalLine(props.y);
  }
);
onMounted(async () => {
  editLayersStore.setDialogLoading(true);
  loading.value = true;
  currentIndex.value = props.x;
  const bscanDom = bscanRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  setCustomTagName(innerContainerDom, ContainerNameEnum.ManualFastBscan);
  // 4.加载图片
  const bscanImage = await loadImageByXhr(props.src);
  loading.value = false;
  initialSize(bscanDom, props.width, props.height);
  const bscanTransform = handleBscanTransform(
    props.transform,
    props.aspectRatioFactor
  );
  const [a, b, c, d, e, f] = bscanTransform;
  transform(bscanDom, bscanTransform);

  // 2.计算boundings
  const { innerWidth, innerHeight } = handleNodesBoundings(
    [bscanDom],
    innerContainerDom,
    viewportDom,
    ContainerNameEnum.ManualFastBscan
  );
  autoResize({
    viewportDom,
    innerContainerDom,
    innerWidth,
    innerHeight,
    downBoundary: props.downBoundary,
    rows: bscanImage.width
  });
  const bscanMat = await loadImageByXhr(props.src);
  if (!bscanMat) return;
  if (props.processorsType !== ContextmenuTypeEnum.Gray) {
    // 接收外部processor传来的处理过后的mat
    let dst = processImage(bscanMat, props.processorsType);
    cv.imshow(bscanDom, dst);
    !dst.isDeleted() && dst.delete();
  } else {
    // 外部没有传入processor 则以原图模式渲染
    cv.imshow(bscanDom, bscanMat);
  }
  !bscanMat.isDeleted() && bscanMat.delete();
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  const methods = initCrossHair({
    svgDom,
    rows: props.height,
    direction: "fast",
    commitCrosshairPosition: props.commitCrosshairPosition,
    componentName: ContainerNameEnum.ManualFastBscan
  });
  moveVerticalLine = methods.moveVerticalLine;
  moveVerticalLine(props.y);
  // bscan 挂载后才能显示Teleport组件，否则将无法将teleport包裹的Vnode传送挂载到view-prot组件上
  showTeleport.value = true;
  teleportTarget.value = viewportDom;
  initSegmentation(svgDom, props.isAS);
});
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
  width: 112px;
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
</style>
