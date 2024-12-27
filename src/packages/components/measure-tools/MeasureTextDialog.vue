<template>
  <div @contextmenu.prevent="handleRightClose">
    <el-dialog
      v-model="dlgVisible"
      width="240"
      class="measure-text-dialog"
      :show-close="false"
      :open-delay="100"
      :close-delay="100"
      :modal="false"
      :close-on-click-modal="true"
      :destroy-on-close="true"
      @close="handleClose"
      @opened="handleOpened"
      top="0"
      :style="{
        position: 'absolute',
        left: `${position.left}px`,
        top: `${position.top}px`
      }"
    >
      <div class="textarea-content">
        <el-input
          v-model="measureText"
          ref="inputRef"
          class="measure-textarea"
          type="textarea"
          :maxlength="20"
          :autosize="{ minRows: 1, maxRows: 20 }"
          clearable
          resize="none"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import { confirmEditMeasureText } from "@/utils/tools/measureTools/text";

defineOptions({
  name: "MeasureTextDialog"
});

const measureCommonStore = useMeasureCommonStore();
const dlgVisible = ref<boolean>(false);
const measureText = ref("");
const inputRef = ref<HTMLCanvasElement | null>(null);

watch(
  () => measureCommonStore.showTextEditDialog,
  async val => {
    await nextTick();
    dlgVisible.value = val;
    measureText.value = measureCommonStore.operMeasureText;
  }
);

const position = computed(() => {
  return {
    left: measureCommonStore.clientLeft,
    top: measureCommonStore.clientTop
  };
});

const handleOpened = () => {
  inputRef.value && inputRef.value.focus();
};

// confirm clicked
const handleRightClose = () => {
  measureCommonStore.setShowTextEditDialog(false);
  measureCommonStore.setMeasureText(measureText.value);
};

// close clicked
const handleClose = async () => {
  measureCommonStore.setShowTextEditDialog(false);
  measureCommonStore.setMeasureText(measureText.value);
  confirmEditMeasureText();
};
</script>
<style lang="scss">
$dialog-bg-color: #3e3e3f;
$msg-color: #e2e2e2;
$border-color: #0f0;
$font-size: 20px;

.measure-text-dialog {
  color: $msg-color;
  background-color: transparent;

  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 0;
  }

  .textarea-content {
    .el-textarea {
      --el-input-focus-border-color: $border-color;

      width: 220px;
      border: 2px solid $border-color;
    }

    .el-textarea textarea {
      font-size: $font-size;
      line-height: $font-size;
      color: $border-color;
      background-color: rgb(0 0 0 / 30%);
    }
  }
}
</style>
