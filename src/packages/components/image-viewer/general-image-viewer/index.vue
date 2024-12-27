<template>
  <div
    v-loading="loading"
    class="general-image-viewer"
    ref="generalImageViewerRef"
    :style="`width:${width}px;height:${height}px`"
    v-bind="$attrs"
  >
    <!-- 容器标签slot占位，允许自定义标签内容 -->
    <slot></slot>
    <div v-show="loadingFail" class="loading-fail-tip">
      <img src="@/packages/assets/icons/no_data.svg" width="60" />
      <span>{{ $t("common.noData") }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

defineOptions({
  name: "GeneralImageViewer"
});

type sizeType = number | string;
interface Props {
  src: string;
  width?: sizeType;
  height?: sizeType;
}

const generalImageViewerRef = ref<Element | null>(null);
const props = withDefaults(defineProps<Props>(), {
  src: ""
});
const loading = ref<boolean>(false);
const loadingFail = ref<boolean>(false);

const emit = defineEmits(["loaded", "error"]);

watch(
  () => props.src,
  async value => {
    loadingFail.value = false;
    await nextTick();
    loading.value = true;
    let image: HTMLImageElement | null = new Image();
    image.src = value;
    // let count = 0;
    image.onload = () => {
      loading.value = false;
      const generalImageViewerDom =
        generalImageViewerRef.value as HTMLDivElement;
      if (!generalImageViewerDom) {
        return;
      }
      generalImageViewerDom.style.backgroundImage = `url(${props.src})`;
      emit("loaded");
      image = null;
    };

    image.onerror = () => {
      let newImage: HTMLImageElement | null = new Image();
      const src = value + `&timestamp=${new Date().getTime()}`;

      newImage.src = src;
      newImage.onload = () => {
        loading.value = false;
        const generalImageViewerDom =
          generalImageViewerRef.value as HTMLDivElement;
        if (!generalImageViewerDom) {
          return;
        }
        generalImageViewerDom.style.backgroundImage = `url(${src})`;
        newImage = null;
        emit("loaded");
      };
      newImage.onerror = () => {
        console.log("加载失败");
        loading.value = false;
        loadingFail.value = true;
        const generalImageViewerDom =
          generalImageViewerRef.value as HTMLDivElement;
        generalImageViewerDom &&
          (generalImageViewerDom.style.backgroundImage = "");
        newImage = null;
        // emit("error");
      };
    };
  },
  { deep: true, immediate: true }
);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.general-image-viewer {
  position: relative;
  // 默认宽高 都是100%,可通过外部原生属性透传更改css样式
  width: 100%;
  height: 100%;
  background-color: #000;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  border: 1px solid #000;
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
