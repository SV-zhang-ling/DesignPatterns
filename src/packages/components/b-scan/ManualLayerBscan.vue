<template>
  <view-port
    v-loading="loading"
    ref="viewportRef"
    :image-type="ContainerNameEnum.ManualBscan"
    :smart-bc="smartBc"
  >
    <canvas class="bscan" ref="bscanRef"></canvas>
    <teleport v-if="showTeleport" :to="teleportTarget">
      <div class="edited-sign" v-if="editLayersStore.editedTipsVisible">
        <span>{{ $t("common.edited") }}</span>
        <i class="status"></i>
      </div>
      <div class="bscan-index-info">
        <div class="shadow-info">
          {{ $t("analysis.average") }}:
          {{ averagedFramesPerSlice[Math.floor(index)] }}/{{ repeat }}
        </div>
        <div class="shadow-info">
          {{ $t("analysis.index") }}:
          {{ sum === 1 ? 1 : Math.floor(index + 1) }}/{{ sum }}
        </div>
        <bscan-direction :oculusType="oculusType" :deg="bscanDeg" />
      </div>
    </teleport>
  </view-port>
</template>

<script lang="ts" setup>
import { throttle, debounce } from "xe-utils";
import { ContainerNameEnum, ContextmenuTypeEnum } from "@/enums";
import { ELViewPort } from "../../types";
import useMouseWheelListener from "@/packages/utils/mouseWheelListenerHook";
import { handleNodesBoundings } from "@/packages/utils/handleNodesBoundings";
import {
  handleBscanTransform,
  initialSize,
  transform,
  loadImage,
  processImage
} from "../../utils/handleImage";
import { autoResize } from "@/utils/autoResize/asyncResize";
import {
  initSegmentation,
  drawAllSlowPosteriorSurface,
  deleteAnchor,
  stashEditSurface
} from "@/utils/tools/segmentation/manualLayer";
import * as Protocol from "@/utils/protocol";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { setCustomTagName } from "@/utils/customElementAttr";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import { refreshSurface } from "@/utils/tools/segmentation/manualLayer";

defineOptions({
  name: "ManualLayerBscan"
});

const analysisCommonStore = useAnalysisCommonStoreHook();
const editLayersStore = useEditLayersStoreHook();
const isPosteriorLineScan = computed(
  () =>
    !Protocol.isAnteriorScan(analysisCommonStore.protocolName) &&
    Protocol.isLineScanProtocol(analysisCommonStore.protocolName)
);
const showTeleport = ref(false);
const teleportTarget = ref<null | Element | undefined>(null);
interface Props {
  src: string; // 图片路径
  width?: number;
  height?: number;
  index: number;
  y: number;
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
  downBoundary: number;
  spacingZ_um?: number;
  captureKey?: string;
  isStarScan: boolean;
  rotate: number;
  isAS?: boolean;
  isAsLineScan?: boolean;
  commitCrosshairPosition: ({ x, y }: { x?: number; y?: number }) => void;
}
const props = withDefaults(defineProps<Props>(), {
  src: "",
  aspectRatioFactor: 0.4,
  transform: () => [],
  downBoundary: 0
});

const bscanDeg = computed(() =>
  props.isStarScan ? -90 + (props.index * 180) / props.sum : props.rotate
);

const stashCurrentEdit = async () => {
  if (window.anchors.length > 0 || editLayersStore.isAsBorderEdit) {
    await stashEditSurface();
  }
};

const downCallback = async () => {
  if (props.y < props.sum - 1) {
    await stashCurrentEdit();
    if (isPosteriorLineScan.value || props.isAsLineScan) {
      editLayersStore.setActiveBscanSlice(props.y + 1);
    } else {
      props.commitCrosshairPosition({ y: props.y + 1 });
    }
  }
};
const upCallback = async () => {
  if (props.y > 0) {
    await stashCurrentEdit();
    if (isPosteriorLineScan.value || props.isAsLineScan) {
      editLayersStore.setActiveBscanSlice(props.y - 1);
    } else {
      props.commitCrosshairPosition({ y: props.y - 1 });
    }
  }
};
const bscanRef = ref<HTMLCanvasElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const loading = ref<boolean>(false);
useMouseWheelListener({
  target: viewportRef,
  downCallback,
  upCallback
});

const no_throttle_commit_status = async () => {
  // 首先绘制分层线
  drawAllSlowPosteriorSurface();

  const bscanDom = bscanRef?.value as HTMLCanvasElement;
  const bscanImage = await loadImage(props.src);
  let bscanMat = cv.imread(bscanImage);
  if (props.processorsType) {
    // 接收外部processor传来的处理过后的mat
    let dst = processImage(bscanMat, props.processorsType);
    cv.imshow(bscanDom, dst);
    dst.delete();
  } else {
    // 外部没有传入processor 则以原图模式渲染
    cv.imshow(bscanDom, bscanMat);
  }
  bscanMat.delete();
};

const throttle_commit_status = throttle(no_throttle_commit_status, 100);
const debounce_commit_status = debounce(no_throttle_commit_status, 100);
watch(
  [() => props.src, () => props.processorsType],
  (currentParams, lastParams) => {
    throttle_commit_status(currentParams, lastParams);
    debounce_commit_status(currentParams, lastParams);
  }
);
onMounted(async () => {
  // loading.value = true;
  const bscanDom = bscanRef?.value as HTMLCanvasElement;
  const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
  const innerContainerDom = viewportRef.value?.getInnerContainerRef();
  setCustomTagName(innerContainerDom, ContainerNameEnum.ManualBscan);

  // setCustomTagName(innerContainerDom, ContainerNameEnum.LineScanBscan);
  // 4.加载图片
  const bscanImage = await loadImage(props.src);
  // loading.value = false;

  const width = bscanImage.width;
  const height = bscanImage.height;
  initialSize(bscanDom, width, height);

  const bscanTransform = handleBscanTransform(
    props.transform,
    props.aspectRatioFactor
  );
  transform(bscanDom, bscanTransform);

  // 1.完成dom元素初始化

  const offsetX = 10000,
    offsetY = 10000;
  const captureKey = "";

  // 2.计算boundings
  const { innerWidth, innerHeight } = handleNodesBoundings(
    [bscanDom],
    innerContainerDom,
    viewportDom,
    ContainerNameEnum.LineScanBscan,
    captureKey,
    offsetX,
    offsetY
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
  if (props.processorsType) {
    // 接收外部processor传来的处理过后的mat
    let dst = processImage(bscanMat, props.processorsType);
    cv.imshow(bscanDom, dst);
    dst.delete();
  } else {
    // 外部没有传入processor 则以原图模式渲染
    cv.imshow(bscanDom, bscanMat);
  }
  bscanMat.delete();
  const svgDom = innerContainerDom.querySelector(".coordinates") as SVGElement;
  initSegmentation(svgDom, width, height, props.isAS);

  showTeleport.value = true;
  teleportTarget.value = viewportDom;
  window.addEventListener("keydown", handleKeyDown);
  if (isPosteriorLineScan.value || props.isAsLineScan) {
    refreshSurface();
  }
});
const handleKeyDown = (event: KeyboardEvent) => {
  if (["Backspace", "Delete"].includes(event.key)) {
    deleteAnchor();
  }
};

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.edited-sign {
  position: absolute;
  top: 8px;
  right: 10px;
  font-size: 14px;
  color: #fff;

  .status {
    position: relative;
    top: -3px;
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-left: 5px;
    background-color: #ff5151;
    border-radius: 50%;
  }
}

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

:deep(.inner-container) {
  overflow: visible !important;
}
</style>
