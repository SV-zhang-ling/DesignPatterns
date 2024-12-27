<template>
  <div class="manual-layer-tool-box">
    <section class="manual-layer-tool__head">
      <el-tooltip
        :content="$t('analysis.edit')"
        :offset="24"
        placement="bottom-start"
      >
        <icon-svg
          name="manual-layer-edit"
          :class="
            manualLayerToolStore.activeType === ManualLayerToolEnum.Edit
              ? 'manual-layer-icon active'
              : 'manual-layer-icon'
          "
          @click="handleToolClick(ManualLayerToolEnum.Edit)"
        />
      </el-tooltip>

      <el-tooltip
        :content="$t('analysis.drag')"
        :offset="24"
        placement="bottom-start"
      >
        <icon-svg
          name="manual-layer-drag"
          :class="
            manualLayerToolStore.activeType === ManualLayerToolEnum.Drag
              ? 'manual-layer-icon active'
              : 'manual-layer-icon'
          "
          @click="handleToolClick(ManualLayerToolEnum.Drag)"
        />
      </el-tooltip>
      <el-tooltip
        :content="$t('common.zoom')"
        :offset="24"
        placement="bottom-start"
      >
        <icon-svg
          name="manual-layer-zoom"
          :class="
            manualLayerToolStore.activeType === ManualLayerToolEnum.Zoom
              ? 'manual-layer-icon active'
              : 'manual-layer-icon'
          "
          @click="handleToolClick(ManualLayerToolEnum.Zoom)"
        />
      </el-tooltip>
      <el-tooltip
        :content="
          manualLayerToolStore.isFullScreen
            ? $t('common.exitFullScreen')
            : $t('common.fullScreen')
        "
        :offset="24"
        placement="bottom-start"
      >
        <icon-svg
          name="manual-layer-fullscreen"
          class="manual-layer-icon"
          @click="handleToolClick(ManualLayerToolEnum.FullScreen)"
          style="border-right: 1px solid #505050"
        />
      </el-tooltip>
      <el-tooltip
        :content="$t('common.confirmText')"
        :offset="24"
        placement="bottom-start"
      >
        <icon-svg
          name="manual-layer-confirm"
          :class="
            manualLayerToolStore.activeType === ManualLayerToolEnum.Confirm
              ? 'manual-layer-icon active'
              : 'manual-layer-icon'
          "
          :disabled="editLayersStore.stashButtonDisabled"
          @click="handleToolClick(ManualLayerToolEnum.Confirm)"
        />
      </el-tooltip>
    </section>
    <section class="manual-layer-tool__body">
      <slot></slot>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { ManualLayerToolEnum } from "@/enums";
import { useManualLayerToolStoreHook } from "@/views/analysis/components/layers/store/manualLayerTool";
import { useEditLayersStoreHook } from "../store/editLayers";

defineOptions({
  name: "ManualLayerTool"
});

const manualLayerToolStore = useManualLayerToolStoreHook();
const editLayersStore = useEditLayersStoreHook();

const emit = defineEmits([
  "handleEditLayer",
  "handleDragLayer",
  "handleZoomLayer",
  "handleFullScreenLayer",
  "handleConfirmLayer"
]);

// handle click
const handleToolClick = (type: ManualLayerToolEnum) => {
  ![ManualLayerToolEnum.FullScreen, ManualLayerToolEnum.Confirm].includes(
    type
  ) && manualLayerToolStore.setActiveType(type);
  switch (type) {
    case ManualLayerToolEnum.Edit:
      // 编辑分层线
      emit("handleEditLayer");
      break;
    case ManualLayerToolEnum.Drag:
      // 拖动
      emit("handleDragLayer");
      break;
    case ManualLayerToolEnum.Zoom:
      // 缩放
      emit("handleZoomLayer");
      break;
    case ManualLayerToolEnum.FullScreen:
      // 全屏/退出全屏
      manualLayerToolStore.setIsFullScreen(!manualLayerToolStore.isFullScreen);
      emit("handleFullScreenLayer", manualLayerToolStore.isFullScreen);
      break;
    case ManualLayerToolEnum.Confirm:
      // 暂存
      emit("handleConfirmLayer");
      break;
    default:
      throw new Error(`No such tool type: ${type}`);
  }
};
</script>
<style lang="scss" scoped>
$border-color: #19191a;
$card-header-bg-color: #2e2e2f;

.manual-layer-tool-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid $divide-light-color;
}

.manual-layer-tool__body {
  flex: 1;
}

.manual-layer-tool__head {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 4px 0 7px;
  background-color: $card-header-bg-color;

  .manual-layer-icon {
    padding: 8px 10px;
    margin: 4px 0;
    margin-right: 4px;
    cursor: pointer;

    &.active {
      background-color: $highlight-color;
    }
  }
}
</style>
