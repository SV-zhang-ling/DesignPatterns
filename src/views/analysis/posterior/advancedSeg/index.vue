<template>
  <el-container class="analysis-container">
    <el-main class="advancedSeg-images-container">
      <AdvancedSegImages />
    </el-main>
    <el-footer class="image-action-container" height="36px">
      <ImageActions
        :showNavigation="true"
        :showLayerOnBscan="true"
        :showRecogonized="true"
        :showLayerEdit="true"
        @change="handleChange"
      />
    </el-footer>
  </el-container>
  <EditLayerDialog
    :dlgVisible="editLayersStore.showEditLayerDig"
    :bscan-type="ContainerNameEnum.AdvancedSegBscan"
    @closeDig="handleCloseEditLayerDig"
  />
</template>

<script setup lang="ts">
import { useBeforeRouteLeave } from "@/hooks/useBeforeRouteLeave";
import ImageActions from "@/views/analysis/components/ImageActions.vue";
import AdvancedSegImages from "./components/AdvanceSegImages.vue";
import { initResizeObserver } from "@/utils/autoResize/index";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useAdvancedSegStoreHook } from "./store/advancedSeg";
import { ImageActionEnum, ContainerNameEnum } from "@/enums";
import { useImageActions } from "@/hooks/useImageActions";
import EditLayerDialog from "../../components/layers/components/EditLayerDialog.vue";
import { useEditLayersStoreHook } from "../../components/layers/store/editLayers";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import { freeMemeory } from "@/utils/tools/segmentation";

const { handleNavLineVisible, handleLayerVisible } = useImageActions();

const analysisCommonStore = useAnalysisCommonStoreHook();
const advancedSegStore = useAdvancedSegStoreHook();
const editLayersStore = useEditLayersStoreHook();
const measureCommonStore = useMeasureCommonStore();

// 获取基本图像参数,通过设定await 为
// 激活异步组件 Suspense,所有的数据必须等到拿到初始化数据后才能加载识别内容

await analysisCommonStore.initPageInfo();
await advancedSegStore.setRecogonizeLayerInfo();
await measureCommonStore.getMeasureData();

const handleRecogonizedVisible = (visible: boolean) => {
  advancedSegStore.setRecogonizedContentVisible(visible);
};

const operationMaps: Operation = {
  [ImageActionEnum.Navigation]: handleNavLineVisible,
  [ImageActionEnum.LayerOnBscan]: handleLayerVisible,
  [ImageActionEnum.RecogonizedContent]: handleRecogonizedVisible
};
// image action change
const handleChange = (type: string, status: boolean) => {
  if (type === ImageActionEnum.LayerEdit) {
    editLayersStore.setEditLayerDigVisible(true);
  } else {
    operationMaps[type](status);
  }
};

// edit layer
const handleCloseEditLayerDig = () => {
  editLayersStore.setEditLayerDigVisible(false);
};

onBeforeMount(() => {
  initResizeObserver();
});

onUnmounted(() => {
  // 分析页面离开时，重置相关stroe数据
  advancedSegStore.$reset();
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

  .image-action-container {
    background-color: $image-bg-color;
    border-top: 1px solid $divide-light-color;
  }

  .advancedSeg-images-container {
    height: 100%;
    padding: 0 5px;
  }
}
</style>
