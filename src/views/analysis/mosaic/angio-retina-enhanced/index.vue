<template>
  <el-container class="analysis-container">
    <el-aside class="angio-layer-thumbnail-container" width="363px">
      <MosaicThumbnails :thumbnail-list="thumbnailList" />
    </el-aside>
    <el-container>
      <el-main class="mosaic-images-container">
        <MosaicImage />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ANGIO_RETINA_ENHANCED_THUMBNAIL_LIST } from "@/utils/constant";
import { useBeforeRouteLeave } from "@/hooks/useBeforeRouteLeave";
import MosaicThumbnails from "../components/MosaicThumbnails.vue";
import MosaicImage from "../components/MosaicImage.vue";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useMosaicStoreHook } from "../store/mosaic";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";

const analysisCommonStore = useAnalysisCommonStoreHook();
const mosaicStore = useMosaicStoreHook();
const measureCommonStore = useMeasureCommonStore();

// 获取基本图像参数,通过设定await 为
// 激活异步组件 Suspense,所有的数据必须等到拿到初始化数据后才能加载血流主页面
await analysisCommonStore.initPageInfo();
await measureCommonStore.getMeasureData();

const thumbnailList = computed(() =>
  ANGIO_RETINA_ENHANCED_THUMBNAIL_LIST.slice(0, -1)
);

onUnmounted(() => {
  mosaicStore.$reset();
});

useBeforeRouteLeave();
</script>

<style lang="scss" scoped>
* {
  user-select: none;
}

.analysis-container {
  overflow: hidden;

  .angio-layer-thumbnail-container {
    display: flex;
    padding: 16px 0 0 13px;
    border-right: 1px solid $divide-dark-color;
  }

  .image-action-container {
    background-color: $image-bg-color;
    border-top: 1px solid $divide-light-color;
  }

  .image-setting-container {
    border-left: 1px solid $divide-dark-color;
  }

  .mosaic-images-container {
    display: flex;
    flex-direction: column;
    padding: 0 5px;
  }
}
</style>
