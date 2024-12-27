<template>
  <el-dialog
    v-model="dialogVisible"
    v-if="dialogVisible"
    class="common-dialog"
    v-bind="$attrs"
    :close-on-click-modal="false"
    :z-index="dlgZIndex"
    center
    @opened="onOpened"
    @close="onCancel"
    :before-close="handleBeforeClose"
  >
    <div class="common-dialog__body">
      <slot></slot>
    </div>
    <template #footer v-if="hasFooter">
      <div class="dialog-footer">
        <el-button v-if="hasCancelBtn" class="btn cancel" @click="onCancel">
          {{ cancelLabelText }}
        </el-button>
        <el-button
          type="primary"
          :class="!hasCancelBtn ? 'single-btn' : 'btn ok'"
          @click="onOK"
          :disabled="okBtnDisabled"
        >
          {{ okLabelText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
/**
 * Common dialog component
 */
import { ref, watch } from "vue";

defineOptions({
  name: "SvDialog"
});

interface Props {
  visible: boolean;
  hasFooter?: boolean;
  okLabelText?: string;
  cancelLabelText?: string;
  okBtnDisabled?: boolean;
  confirmBeforeClose?: boolean;
  dlgZIndex?: number;
  hasCancelBtn?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  hasFooter: true,
  okLabelText: "OK",
  cancelLabelText: "Cancel",
  okBtnDisabled: false,
  confirmBeforeClose: false,
  hasCancelBtn: true
});

const dialogVisible = ref<boolean>(false);

watch(
  () => props.visible,
  () => {
    dialogVisible.value = props.visible;
  }
);

const emits = defineEmits(["ok", "cancel", "opened"]);

// confirm clicked
const onOK = () => {
  dialogVisible.value = false;
  emits("ok");
};

const onOpened = () => {
  emits("opened");
};
// cancel cliced
const onCancel = () => {
  dialogVisible.value = false;
  emits("cancel");
};
const handleBeforeClose = () => {
  if (props.confirmBeforeClose) {
    emits("cancel");
  } else {
    onCancel();
  }
};
</script>
<style lang="scss">
$dialog-bg-color: #3e3e3f;
$msg-color: #e2e2e2;
$border-color: #505050;
$font-size: 16px;

.common-dialog {
  color: $msg-color;
  background-color: $dialog-bg-color;

  .el-dialog__header {
    padding: 12px 0;
    margin-right: 0;
    border-bottom: 1px solid $border-color;
  }

  .el-dialog__title {
    margin-right: 0;
    font-size: $font-size;
    color: $msg-color;
  }

  .el-dialog__headerbtn {
    width: 40px;
    height: 40px;
  }

  .el-dialog__headerbtn:hover {
    .el-dialog__close {
      color: rgb(226 226 226 / 60%);
    }
  }

  .el-dialog__close {
    font-size: 22px;
    color: rgb(226 226 226 / 60%);

    &:hover {
      color: $msg-color;
      background-color: rgb(255 255 255 / 8%);
    }
  }

  .el-dialog__body {
    padding: 20px;
  }

  .common-dialog__body {
    display: flex;
    align-items: center;
    font-size: $font-size;

    .message {
      margin-left: 16px;
      color: $msg-color;
    }
  }

  .btn {
    width: 120px;
    height: 32px;
  }

  .cancel {
    color: $msg-color;
    background: rgb(255 255 255 / 12%);

    &:hover {
      background: rgb(255 255 255 / 5%);
    }
  }

  .ok {
    margin-left: 8px;
  }

  .single-btn {
    position: absolute;
    right: 16px;
    bottom: 16px;
    width: 60px;
    height: 32px;
  }
}
</style>
