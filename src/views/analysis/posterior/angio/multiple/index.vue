<template>
  <el-container class="analysis-container">
    <el-container>
      <el-main class="image-container">
        <template v-if="route.query.m == AnalysisModeEnum.OU">
          <OUContent />
        </template>
        <template v-else>
          <ChangeContent />
        </template>
      </el-main>
      <el-aside class="image-setting-container" width="219px">
        <ImageSettingsPanel />
      </el-aside>
    </el-container>
    <el-footer class="image-action-container" height="36px">
      <ImageActions
        :showNavigation="true"
        :showLayerOnBscan="true"
        :showAngioColor="true"
        @change="handleChange"
      />
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import ImageActions from "@/views/analysis/components/ImageActions.vue";
import ImageSettingsPanel from "./components/ImageSettingsPanel.vue";
import OUContent from "./components/OUContent.vue";
import ChangeContent from "./components/ChangeContent.vue";
import { useBeforeRouteLeave } from "@/hooks/useBeforeRouteLeave";
import { initResizeObserver } from "@/utils/autoResize/index";
import { useRoute } from "vue-router";
import {
  ImageActionEnum,
  AnalysisModeEnum,
  ContextmenuTypeEnum
} from "@/enums";
import { useMultipleAngioStoreHook } from "./store";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { useImageActionStoreHook } from "@/views/analysis/components/store/imageAction";
import { useImageActions } from "@/hooks/useImageActions";
import { freeMemeory } from "@/utils/tools/segmentation";
import { changeOuChangeMeasureDraw } from "@/utils/tools/measureTools/index";

const { handleNavLineVisible, handleLayerVisible } = useImageActions();

const route = useRoute();
const contextmenuStore = useContextmenuStoreHook();
const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
const multipleAngioStore = useMultipleAngioStoreHook();
const imageActionStore = useImageActionStoreHook();

analysisMultipleCommonStore.initPageInfo(true);

watch(
  () => route.query,
  () => {
    // 重置底部控制
    imageActionStore.setNavigationStatus(true);
    imageActionStore.setAngioColor(true);
    multipleAngioStore.showAngio = true;
    changeOuChangeMeasureDraw();
    // 重置右键菜单激活项
    contextmenuStore.resetActiveMenu();
    contextmenuStore.$reset();
    multipleAngioStore.resetProcessorType(ContextmenuTypeEnum.Gray);
    // disconnectResizeObserver();
  },
  { immediate: true }
);

const handleAngioColorVisible = (visible: boolean) => {
  multipleAngioStore.showAngio = visible;
};

const operationMaps: Operation = {
  [ImageActionEnum.Navigation]: handleNavLineVisible,
  [ImageActionEnum.LayerOnBscan]: handleLayerVisible,
  [ImageActionEnum.AngioColor]: handleAngioColorVisible
};
// image action change
const handleChange = (type: string, status: boolean) => {
  operationMaps[type](status);
};

onBeforeMount(() => {
  initResizeObserver();
});

onUnmounted(() => {
  multipleAngioStore.$reset();
  analysisMultipleCommonStore.resetWin();
  freeMemeory();
});

useBeforeRouteLeave();
</script>

<style lang="scss" scoped>
* {
  user-select: none;
}

.analysis-container {
  overflow: hidden;
}

.image-container {
  padding: 0;
  overflow: hidden;
}

.images__row {
  height: 100%;
}

.image-action-container {
  background-color: $image-bg-color;
  border-top: 1px solid $divide-light-color;
}
</style>
