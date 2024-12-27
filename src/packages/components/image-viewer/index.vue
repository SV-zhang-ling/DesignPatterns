<template>
  <canvas class="image-viewer" ref="imageViewer" v-bind="$attrs" />
</template>

<script lang="ts" setup>
import { loadImage } from "../../utils/handleImage";
import { ProcessorFnType } from "../../types";
defineOptions({
  name: "ImageViewer"
});

interface Props {
  src: string; // 图片路径
  processor?: ProcessorFnType; // 图片处理器，接收一个mat,返回一个mat,可选
  transform?: number[];
}
const props = defineProps<Props>();
const emit = defineEmits(["update:size"]);
const imageViewer = ref<Element | null>(null);

const getCanvasDom = () => imageViewer.value;
// 对后台返回的仿射矩阵调整顺序适配web css3 Matrix
const reverseMatrix = ([a, b, c, d, e, f]: number[]) => [a, d, b, e, c, f];
// defineExpose 暴露实时canvas dom获取方法以便外部父组件动态获取内部canvas dom进行控制
defineExpose({
  getCanvasDom
});

watch(
  [
    /*组合监听src和图片处理器processor变更，为image的onload和processor做自动debounce功能，避免分别监听带来的重复渲染和重复fetch问题*/
    () => props.src,
    () => props.processor,
    () => props.transform
  ],
  async ([src, processor, transform], [oldSrc, oldProcessor, oldTransform]) => {
    await nextTick();
    // 确保 nextTick Dom挂载后 否则拿不到canvas和image dom
    const canvas = imageViewer.value as HTMLCanvasElement;
    const image = await loadImage(src);
    const { width, height } = image;
    canvas.width = width;
    canvas.height = height;
    if (transform && transform !== oldTransform) {
      canvas.style.transform =
        "matrix(" + reverseMatrix(transform).join(", ") + ")";
      // 当bscan设置了transform之后，获取 transform后的独立渲染块BFC的宽和高
      const { width, height } = canvas.getBoundingClientRect();
      // /**1 */ 这里有个闪屏优化点后续优化 debugger;
      /**3 是个异步微任务 */ emit("update:size", { width, height });
      // /**2 */ debugger;
    }
    let mat = cv.imread(image);
    if (processor) {
      // 接收外部processor传来的处理过后的mat
      let dst = processor(mat);
      const canvas = imageViewer.value as HTMLCanvasElement;
      cv.imshow(canvas, dst);
      dst.delete();
    } else {
      // 外部没有传入processor 则以原图模式渲染
      const canvas = imageViewer.value as HTMLCanvasElement;
      cv.imshow(canvas, mat);
    }
    mat.delete();
  },
  { deep: true, immediate: true }
);
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
canvas {
  position: absolute;
  // 设置canvas图像边缘平滑，避免transform之后边缘很强的锯齿割裂感
  image-rendering: optimize-contrast; /* Safari */
  image-rendering: pixelated; /* Other browsers */
  transform-origin: left top;
}
</style>
