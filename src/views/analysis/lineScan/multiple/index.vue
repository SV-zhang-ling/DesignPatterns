<template>
  <el-container class="analysis-container">
    <el-main class="line-images">
      <template v-if="route.query.m == AnalysisModeEnum.OU">
        <OUContent />
      </template>
      <template v-else>
        <ChangeContent />
      </template>
    </el-main>
    <el-footer class="image-action-container" height="36px">
      <ImageActions
        :showNavigation="!isAS"
        :defaultShowNav="false"
        :showLayerOnBscan="isAS"
        :disableLayerOnBscan="!multipleLineScanStore.corrected"
        :show-scan-line-action="!isCubeData"
        :show-scan-line="!isStarScan && !isSingleLineScan"
        :show-star-line="isStarScan && !isSingleLineScan"
        @change="handleChange"
      />
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useBeforeRouteLeave } from "@/hooks/useBeforeRouteLeave";
import ImageActions from "../../components/ImageActions.vue";
import OUContent from "./components/OUContent.vue";
import ChangeContent from "./components/ChangeContent.vue";
import {
  AnalysisModeEnum,
  ImageActionEnum,
  ContextmenuTypeEnum
} from "@/enums";
import {
  isSingleLineScanProtocol,
  isStarScanData,
  isCubeScan,
  isAnteriorScan,
  isICLScan2DProtocol
} from "@/utils/protocol";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
import { useAnalysisCommonStoreHook } from "../../store/analysisCommon";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { useMultipleLineScanStoreHook } from "./store";
import { useImageActions } from "@/hooks/useImageActions";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { useImageActionStoreHook } from "../../components/store/imageAction";
import { disconnectResizeObserver } from "@/utils/autoResize/asyncResize";
import { changeOuChangeMeasureDraw } from "@/utils/tools/measureTools/index";

const { handleScanLineVisible, handleNavLineVisible, handleLayerVisible } =
  useImageActions();
const route = useRoute();

const contextmenuStore = useContextmenuStoreHook();
const analysisCommonStore = useAnalysisCommonStoreHook();
const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
const multipleLineScanStore = useMultipleLineScanStoreHook();
const imageActionStore = useImageActionStoreHook();

const isAS = computed(() => isAnteriorScan(analysisCommonStore.protocolName));

const isCubeData = computed(() => isCubeScan(analysisCommonStore.protocolName));

const isSingleLineScan = computed(
  () =>
    isSingleLineScanProtocol(analysisCommonStore.protocolName) ||
    isICLScan2DProtocol(analysisCommonStore.protocolName)
);

const isStarScan = computed(() =>
  isStarScanData(analysisCommonStore.protocolName)
);

analysisMultipleCommonStore.initPageInfo(true);

const handleNavLineControl = (visible: boolean) => {
  handleNavLineVisible(visible);
  multipleLineScanStore.showBscanPosOnActiveLine = visible;
};

const operationMaps: Operation = {
  [ImageActionEnum.Navigation]: handleNavLineControl,
  [ImageActionEnum.ScanLine]: handleScanLineVisible,
  [ImageActionEnum.LayerOnBscan]: handleLayerVisible
};

// image action change
const handleChange = (type: string, status: boolean) => {
  operationMaps[type](status);
};

watch(
  () => route.query,
  () => {
    // 重置底部控制
    imageActionStore.setNavigationStatus(false);
    imageActionStore.setLayerOnBscan(true);
    imageActionStore.setScanLine(true);
    // 重置右键菜单激活项
    contextmenuStore.resetActiveMenu();
    contextmenuStore.$reset();
    multipleLineScanStore.resetBscanProcessorType(ContextmenuTypeEnum.Gray);

    changeOuChangeMeasureDraw();

    disconnectResizeObserver();
  },
  { immediate: true }
);

onUnmounted(() => {
  multipleLineScanStore.$reset();
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

  .image-action-container {
    background-color: $image-bg-color;
    border-top: 1px solid $divide-light-color;
  }

  .line-image {
    padding: 0 5px;
  }
}

.line-images {
  padding: 0;
  overflow: hidden;

  .line-images__row {
    height: 100%;
  }
}
</style>
