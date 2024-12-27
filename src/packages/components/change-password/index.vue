<template>
  <div>
    <sv-dialog
      :visible="dlgVisible"
      width="548"
      class="change-pwd-dialog"
      :title="$t('common.changePwd')"
      :show-close="false"
      :hasFooter="false"
      :okLabelText="$t('common.saveText')"
      :cancelLabelText="$t('common.cancelText')"
      @ok="handleOK"
      @cancel="handleCancel"
    >
      <div class="pwd-form-wrapper">
        <span class="pwd-tip">{{ $t("common.changePwdTip") }}</span>
        <el-form
          ref="pwdFormRef"
          class="pwd-form"
          :model="pwdForm"
          :rules="pwdRules"
          label-position="top"
        >
          <el-form-item :label="$t('common.originPwd')" prop="curPwd">
            <el-input
              v-model="pwdForm.curPwd"
              type="password"
              :placeholder="$t('common.inputTip')"
              show-password
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('common.newPwd')" prop="newPwd">
            <el-input
              v-model="pwdForm.newPwd"
              type="password"
              :placeholder="$t('common.pwdRuler')"
              show-password
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('common.confirmNewPwd')" prop="conNewPwd">
            <el-input
              v-model="pwdForm.conNewPwd"
              type="password"
              :placeholder="$t('common.pwdRuler')"
              show-password
              clearable
            />
          </el-form-item>
          <div class="change-btn">
            <el-button
              class="btn ok"
              type="primary"
              :loading="loading"
              @click="handleOK(pwdFormRef)"
            >
              {{ $t("common.saveText") }}
            </el-button>
            <el-button
              class="btn cancel"
              :loading="loading"
              @click="handleCancel(pwdFormRef)"
            >
              {{ $t("common.cancelText") }}
            </el-button>
          </div>
        </el-form>
      </div>
    </sv-dialog>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { FormInstance, FormRules } from "element-plus";
import { useUserStoreHook } from "@/views/user/store/user";
import { ElNotification } from "element-plus";
import { VueI18n } from "@/locales/i18n";
defineOptions({
  name: "ChangePwdDialog"
});

interface Props {
  dlgVisible: boolean;
}
const props = defineProps<Props>();
const { t } = useI18n();

const emit = defineEmits(["ok", "cancel"]);

const loading = ref(false);
const pwdFormRef = ref<FormInstance>();
const pwdForm = reactive({
  curPwd: "",
  newPwd: "",
  conNewPwd: ""
});
const pwdRules = reactive<FormRules>({
  curPwd: [
    {
      validator: (_, value: string, callback): void => {
        if (value.trim() === "") {
          callback(new Error(t("common.passwordTip")));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  newPwd: [
    {
      validator: (_, value: string, callback): void => {
        const REG = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (value.trim() === "") {
          callback(new Error(t("common.passwordTip")));
        } else if (!REG.test(value)) {
          callback(new Error(t("common.pwdRuler")));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  conNewPwd: [
    {
      validator: (_, value: string, callback): void => {
        const REG = /^[a-zA-Z\d]{8,}$/;
        if (value.trim() === "") {
          callback(new Error(t("common.passwordTip")));
        } else if (value !== pwdForm.newPwd) {
          callback(new Error(t("common.pwdMatch")));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

const handleOK = (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) {
    return;
  }
  formEl.validate(async valid => {
    if (!valid) {
      loading.value = false;
      return;
    }

    const pwdParams = {
      curPwd: btoa(pwdForm.curPwd as string),
      newPwd: btoa(pwdForm.newPwd as string)
    };
    const res = await useUserStoreHook().changePwd({ ...pwdParams });
    loading.value = false;
    if (!res) return;
    if (res.succeed) {
      ElNotification({
        type: "success",
        message: VueI18n("common.changePwdSuccess"),
        customClass: "custom-notification-center"
      });
      emit("ok");
    }
  });
};
const handleCancel = (formEl: FormInstance | undefined) => {
  emit("cancel");
  formEl?.resetFields();
  formEl?.clearValidate();
};
</script>
<style lang="scss" scoped>
$dialog-bg-color: #3e3e3f;
$msg-color: #e2e2e2;
$border-color: #0f0;
$font-size: 20px;

.change-pwd-dialog {
  .pwd-form-wrapper {
    width: 100%;
    height: 100%;
    padding: 0 20px;

    .pwd-tip {
      font-size: 16px;
      font-weight: normal;
      line-height: 100%;
      color: rgb(226 226 226 / 60%);
    }

    .pwd-form {
      margin: 50px 0;

      .change-btn {
        display: flex;
        flex-direction: column;
        margin-top: 50px;

        .btn {
          width: 100%;
          margin: 10px 0;
        }
      }
    }

    :deep(.el-form) {
      .el-input__inner {
        height: 40px;
      }

      .el-button {
        width: 100%;
        height: 40px;
        // background-color: #276cd3;
      }
    }
  }
}
</style>
