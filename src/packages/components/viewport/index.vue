<template>
  <div class="viewport" ref="viewportRef" v-cxt="imageType">
    <icon-svg
      v-show="showSmartBc"
      :name="enhanceName"
      class="icon-enhance"
      @click="handleImageSmartBCChange"
      @dblclick.stop="handleImageSmartBCChange"
    />
    <div class="inner-container" ref="innerContainerRef">
      <slot></slot>
      <svg class="coordinates" ref="innerSvgRef"></svg>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { drag, zoom } from "./viewport";
import { ContainerNameEnum } from "@/enums";

defineOptions({
  name: "ViewPort"
});

interface Props {
  showSmartBc?: boolean;
  innerHeight?: number;
  innerWidth?: number;
  imageType?: ContainerNameEnum;
  smartBc?: number;
  draggable?: boolean;
  zoomable?: boolean;
  captureKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showSmartBc: true,
  draggable: true,
  zoomable: true
});
const viewportRef = ref<Element | null>(null);
const innerContainerRef = ref<Element | null>(null);
const innerSvgRef = ref<Element | null>(null);

const enhanceName = computed(() =>
  props.smartBc === 1 ? "image-enhanced" : "image-enhance"
);

const getViewportDom = () => viewportRef.value;
const getInnerContainerRef = () => innerContainerRef.value;

defineExpose({
  getViewportDom,
  getInnerContainerRef
});

onMounted(() => {
  const dom = innerContainerRef?.value as HTMLDivElement;
  props.draggable && drag(dom);
  props.zoomable && zoom(dom, props.imageType, props.captureKey);
});

const emit = defineEmits(["smartBcChange"]);
const handleImageSmartBCChange = () => {
  const smartBC = props.smartBc === 1 ? 0 : 1;
  emit("smartBcChange", { imageType: props.imageType, smartBC });
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: black;

  .inner-container {
    position: absolute;
    overflow: hidden;
    cursor: pointer;
    // transition: transform 100ms;

    svg {
      position: absolute;
      z-index: 1;
      width: 100%;
      height: 100%;
      transform-origin: left top; // 控制缩放中心点为左上，避免多余BFC占位
    }
  }

  .icon-enhance {
    position: absolute;
    top: 5px;
    left: 5px;
    z-index: 99;
    cursor: pointer;
  }
}
</style>
