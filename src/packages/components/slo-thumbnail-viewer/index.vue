<template>
  <div v-loading="loading" class="slo-thumbnail-container">
    <view-port
      v-if="slo.src && slo.src !== 'null'"
      ref="viewportRef"
      :draggable="false"
      :zoomable="false"
      :showSmartBc="false"
    >
      <canvas class="slo" ref="sloRef"></canvas>
      <svg class="enface" ref="enfaceRef"></svg>
    </view-port>
    <div v-if="slo.src === 'null'" class="fail-tip-container">
      <div class="loading-fail-tip">
        <img src="@/packages/assets/icons/no_data.svg" width="60" />
        <span>{{ $t("common.noData") }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ContainerNameEnum } from "@/enums";
import { ELViewPort } from "../../types";
import { drawLine } from "./drawLine";
import { handleNodesBoundings } from "../../utils/handleNodesBoundings";
import { loadImage, transform } from "../../utils/handleImage";
import { autoResize } from "@/utils/autoResize/asyncResize";
import { setCustomTagName } from "@/utils/customElementAttr";

defineOptions({
  name: "SLOThumbnailViewer"
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
  selected: number;
}
interface imageParamsType extends BaseRect {
  src: string;
}
interface Props {
  slo: imageParamsType;
  enface: EnfaceParamsType;
  isStarScan: boolean;
  isCubeData?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  slo: () => ({
    src: "",
    transform: [],
    width: 0,
    height: 0
  }),
  enface: () => ({
    transform: [],
    width: 0,
    height: 0,
    spacingX: 0,
    spacingY: 0,
    rotate: 0,
    selected: 0
  }),
  isStarScan: false
});

const sloRef = ref<HTMLCanvasElement | null>(null);
const enfaceRef = ref<SVGElement | null>(null);
const viewportRef: Ref<ELViewPort> = ref(null);
const loading = ref<boolean>(true);

const drawLineWithParams = () => {
  drawLine({
    scanner: enfaceRef,
    width: props.enface.width * props.enface.spacingX,
    height: props.enface.height * props.enface.spacingY,
    n: props.enface.height === 1 ? 1 : props.enface.height + 1,
    selected: props.enface.selected,
    isStarScan: props.isStarScan,
    isCubeData: props.isCubeData
  });
};

watch(
  () => props.slo.src,
  async (sloSrc: string) => {
    loading.value = true;

    if (!sloSrc || sloSrc === "null") {
      sloSrc === "null" && (loading.value = false);
      return;
    }

    await nextTick();

    // 1.完成dom元素初始化
    const sloDom = sloRef?.value as HTMLCanvasElement;
    const viewportDom = viewportRef.value?.getViewportDom() as HTMLDivElement;
    const enfaceDom = enfaceRef?.value as SVGElement;
    const innerContainerDom = viewportRef.value?.getInnerContainerRef();
    innerContainerDom.style.scale = "1";
    innerContainerDom.style.transform = "";
    sloDom.style.left = "0";
    sloDom.style.top = "0";
    enfaceDom.style.left = "0";
    enfaceDom.style.top = "0";

    setCustomTagName(innerContainerDom, ContainerNameEnum.ThumbnailSLO);
    // initialSize(sloDom, props.slo.width, props.slo.height);
    transform(sloDom, props.slo.transform);
    const [a, b, c, d, e, f] = props.enface.transform;
    enfaceDom.style.transform = `translate(${c}px, ${
      props.isStarScan
        ? f - (props.enface.width * props.enface.spacingX) / 2
        : f
    }px) rotate(${props.enface.rotate}deg) scaleY(${a / e > 0 ? 1 : -1})`;
    enfaceDom.style.width = `${props.enface.width * props.enface.spacingX}px`;

    if (props.isStarScan) {
      enfaceDom.style.height = `${
        props.enface.width * props.enface.spacingX
      }px`;
    } else {
      enfaceDom.style.height = `${
        props.enface.height === 1
          ? 1
          : props.enface.height * props.enface.spacingY
      }px`;
    }
    // 4.加载图片
    const sloImage = await loadImage(props.slo.src);
    loading.value = false;

    let sloMat = cv.imread(sloImage);
    cv.imshow(sloDom, sloMat);
    sloMat.delete();

    // 2.计算boundings
    const { innerWidth, innerHeight } = handleNodesBoundings(
      [sloDom, enfaceDom],
      innerContainerDom,
      viewportDom,
      ContainerNameEnum.ThumbnailSLO
    );
    autoResize({
      viewportDom,
      innerContainerDom,
      innerWidth,
      innerHeight
    });

    drawLineWithParams();
  },
  { deep: true, immediate: true }
);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.slo-thumbnail-container {
  width: 100%;
  height: 100%;
}

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

.fail-tip-container {
  width: 100%;
  height: 100%;
}

.loading-fail-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 90%;
  line-height: 20px;
  color: #505050;
}
</style>
