<template>
  <el-container class="analysis-container">
    <el-container class="main-contents">
      <el-main class="images-container">
        <MainImages />
      </el-main>
      <el-aside class="image-setting-container" width="219px">
        <ImageSettingsPanel />
      </el-aside>
    </el-container>
    <el-footer class="image-action-container" height="36px">
      <ImageActions
        :showNavigation="true"
        :showLayerEdit="false"
        @change="handleChange"
      />
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { useBeforeRouteLeave } from "@/hooks/useBeforeRouteLeave";
import MainImages from "./components/MainImages.vue";
import ImageActions from "@/views/analysis/components/ImageActions.vue";
import ImageSettingsPanel from "./components/ImageSettingsPanel.vue";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useCubeStoreHook } from "./store";
import { ImageActionEnum } from "@/enums";
import { useImageActions } from "@/hooks/useImageActions";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import { freeMemeory } from "@/utils/tools/segmentation";
import { useResizeObserver } from "@/hooks/useResizeObserver";

const { handleNavLineVisible } = useImageActions();

const analysisCommonStore = useAnalysisCommonStoreHook();
const cubeStore = useCubeStoreHook();
const measureCommonStore = useMeasureCommonStore();

// 获取基本图像参数,通过设定await 为
// 激活异步组件 Suspense,所有的数据必须等到拿到初始化数据后才能加载血流主页面
await analysisCommonStore.initPageInfo();
await measureCommonStore.getMeasureData();

const operationMaps: Operation = {
  [ImageActionEnum.Navigation]: handleNavLineVisible
};
// image action change
const handleChange = (type: string, status: boolean) => {
  operationMaps[type](status);
};

onUnmounted(() => {
  cubeStore.$reset();
  freeMemeory();
});

useResizeObserver();
useBeforeRouteLeave();
</script>

<style lang="scss" scoped>
* {
  user-select: none;
}

.analysis-container {
  overflow: hidden;

  .main-contents {
    height: 100%;
  }

  .images-container {
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }

  .image-action-container {
    padding: 0 5px;
    background-color: $image-bg-color;
    border-top: 1px solid $divide-light-color;
  }
}
</style>
