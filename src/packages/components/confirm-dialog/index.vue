<template>
  <el-dialog
    v-model="dialogVisible"
    class="confirm-dialog"
    width="480"
    :show-close="false"
    :open-delay="100"
    :close-delay="100"
    :close-on-click-modal="false"
  >
    <div class="confirm-dialog__body">
      <img :src="require(`@/packages/assets/icons/${type}.svg`)" />
      <span class="message">{{ message }}</span>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button class="btn cancel" @click="onCancel">
          {{ cancelLabelText }}
        </el-button>
        <el-button type="primary" class="btn confirm" @click="onConfirm">
          {{ confirmLabelText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
/**
 * Confirm dialog component
 */
import { ref, watch } from "vue";

defineOptions({
  name: "ConfirmDialog"
});

interface Props {
  visible: boolean;
  message: string;
  type?: string;
  confirmLabelText?: string;
  cancelLabelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  type: "warning",
  message: "",
  confirmLabelText: "",
  cancelLabelText: ""
});

const dialogVisible = ref<boolean>(false);

watch(
  () => props.visible,
  () => {
    dialogVisible.value = props.visible;
  }
);

const emit = defineEmits(["confirm", "cancel"]);

// confirm clicked
const onConfirm = () => {
  dialogVisible.value = false;
  emit("confirm");
};

// cancel cliced
const onCancel = () => {
  dialogVisible.value = false;
  emit("cancel");
};
</script>
<style lang="scss">
$dialog-bg-color: #3e3e3f;
$msg-color: #e2e2e2;

.confirm-dialog {
  top: 30%;
  left: auto;
  background-color: $dialog-bg-color;

  .el-dialog__body {
    padding: 10px 40px 30px;
  }

  .confirm-dialog__body {
    display: flex;
    align-items: center;
    font-size: 16px;

    .message {
      margin-left: 16px;
      color: $msg-color;
    }
  }

  .dialog-footer {
    text-align: right;
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

  .confirm {
    margin-left: 8px;
  }
}
</style>
