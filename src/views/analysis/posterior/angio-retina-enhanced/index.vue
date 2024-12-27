<template>
  <el-container class="analysis-container" v-if="showContainer">
    <el-aside class="angio-layer-thumbnail-container" width="363px">
      <AngioLayerThumbnails
        :timeStamp="timeStamp"
        :layers="ANGIO_RETINA_ENHANCED_THUMBNAIL_LIST"
      />
    </el-aside>
    <el-container>
      <el-container>
        <el-main class="angio-images-container">
          <AngioImages />
        </el-main>
        <el-aside class="image-setting-container" width="219px">
          <AngioImageSettings :show-par="false" :show-overlay-mode="false" />
        </el-aside>
      </el-container>
      <el-footer class="image-action-container" height="36px">
        <ImageActions
          :showNavigation="true"
          :showLayerOnBscan="true"
          :showAngioColor="true"
          :showLayerEdit="true"
          @change="handleChange"
        />
      </el-footer>
    </el-container>
  </el-container>
  <EditLayerDialog
    :dlgVisible="editLayersStore.showEditLayerDig"
    :bscan-type="ContainerNameEnum.SlowBScanMain"
    @closeDig="handleCloseEditLayerDig"
  />
</template>

<script setup lang="ts">
import { useBeforeRouteLeave } from "@/hooks/useBeforeRouteLeave";
import ImageActions from "@/views/analysis/components/ImageActions.vue";
import { ANGIO_RETINA_ENHANCED_THUMBNAIL_LIST } from "@/utils/constant";
import AngioLayerThumbnails from "../angio/components/AngioLayerThumbnails.vue";
import AngioImageSettings from "../angio/components/AngioImageSettings.vue";
import AngioImages from "../angio/components/AngioImages.vue";
import { useAngioStoreHook } from "../angio/store/angiography";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { initResizeObserver } from "@/utils/autoResize/index";
import { ImageActionEnum, ContainerNameEnum } from "@/enums";
import { useImageActions } from "@/hooks/useImageActions";
import EditLayerDialog from "@/views/analysis/components/layers/components/EditLayerDialog.vue";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import { freeMemeory } from "@/utils/tools/segmentation";

const { handleNavLineVisible, handleLayerVisible } = useImageActions();

const timeStamp = ref<number>(0);
const analysisCommonStore = useAnalysisCommonStoreHook();
const angioStore = useAngioStoreHook();
const editLayersStore = useEditLayersStoreHook();
const measureCommonStore = useMeasureCommonStore();
useResizeObserver();
// 获取基本图像参数,通过设定await 为
// 激活异步组件 Suspense,所有的数据必须等到拿到初始化数据后才能加载血流主页面
await analysisCommonStore.initPageInfo();
await angioStore.getPosteriorAngioLayer();
await measureCommonStore.getMeasureData();

const handleAngioColorVisible = (visible: boolean) => {
  angioStore.setAngioVisible(visible);
};

const operationMaps: Operation = {
  [ImageActionEnum.Navigation]: handleNavLineVisible,
  [ImageActionEnum.LayerOnBscan]: handleLayerVisible,
  [ImageActionEnum.AngioColor]: handleAngioColorVisible
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

angioStore.$onAction(
  ({
    name, //action 函数的名称
    args, //action 函数参数数组
    after //钩子函数，在action函数执行完成返回或者resolves后执行
  }) => {
    after(() => {
      if (["updateLayer", "resetPosteriorAngioLayer"].includes(name)) {
        timeStamp.value = Date.now(); // 创建一个表示当前时间的 时间戳
      }
    });
  },
  false //默认是false，设置为true的时候，组件卸载时，订阅依然有效
);

onBeforeMount(() => {
  initResizeObserver();
  freeMemeory();
});
onUnmounted(() => {
  analysisCommonStore.clearSaveInfo();
});
const { showContainer } = useBeforeRouteLeave(() => angioStore.$reset());
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
    padding: 0 5px;
    background-color: $image-bg-color;
    border-top: 1px solid $divide-light-color;
  }

  .image-setting-container {
    border-left: 1px solid $divide-dark-color;
  }

  .angio-images-container {
    padding: 0 5px;
  }
}
</style>
