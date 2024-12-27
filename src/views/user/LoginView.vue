<template>
  <div class="login-container">
    <div class="content">
      <img
        class="login-logo"
        src="@/assets/images/login-logo.png"
        alt=""
        srcset=""
      />
      <div class="login-form-wrapper">
        <MultiLanguage @change="handleLangChange(loginFormRef)" />
        <icon-svg class="picasso-logo" name="picasso" />
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
        >
          <el-form-item :label="$t('common.username')" prop="name">
            <el-input
              v-model="loginForm.name"
              :placeholder="$t('common.inputTip')"
              clearable
            />
          </el-form-item>
          <el-form-item :label="$t('common.password')" prop="pwd">
            <el-input
              v-model="loginForm.pwd"
              type="password"
              :placeholder="$t('common.inputTip')"
              show-password
              clearable
              @keyup.enter="handleLogin(loginFormRef)"
            />
          </el-form-item>
          <el-button
            class="login-btn"
            type="primary"
            :loading="loading"
            @click="handleLogin(loginFormRef)"
          >
            {{ $t("common.login") }}
          </el-button>
        </el-form>
        <div class="bottom-info">
          <div class="left-info">
            <div class="info phone">
              <icon-svg class="phone-icon" name="phone-fill" />
              <span>{{ COMPANY_INFO.tele }}</span>
            </div>
            <div class="info mail">
              <icon-svg class="email-icon" name="mail-fill" />
              <span>{{ COMPANY_INFO.email }}</span>
            </div>
          </div>
          <icon-svg name="company-logo" />
        </div>
      </div>
    </div>
  </div>
  <ConfirmDialog
    :visible="changePwdTipDlgVisible"
    :message="
      isFirstLogin ? $t('common.firstLoginTip') : $t('common.pwdExpireTip')
    "
    :confirm-label-text="
      isFirstLogin ? $t('common.confirmText') : $t('analysis.edit')
    "
    :cancel-label-text="
      isFirstLogin ? $t('common.cancelText') : $t('common.ignore')
    "
    @confirm="handleConfirmToChange"
    @cancel="handleCancelToJump"
  />
  <ChangePwdDialog
    :dlgVisible="changePwdDlgVisible"
    @ok="handleChangePwdOK"
    @cancel="handleChangePwdCancel"
  />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { reactive } from "vue";
import { FormInstance, FormRules } from "element-plus";
import { User, UserResult } from "./store/user.d";
import { COMPANY_INFO } from "@/utils/constant";
import MultiLanguage from "./components/MultiLanguage.vue";
import { useUserStoreHook } from "./store/user";
import { toDateString } from "xe-utils";
import { BIRTH_DATE_FORMAT } from "@/utils/constant";

defineOptions({
  name: "LoginView"
});

const loading = ref(false);
const loginFormRef = ref<FormInstance>();
const loginForm = reactive<User>({
  name: "",
  pwd: ""
});
// 修改密码确认框
const changePwdTipDlgVisible = ref(false);
const changePwdDlgVisible = ref(false);
const isFirstLogin = ref(false);

const { t } = useI18n();

const loginRules = reactive<FormRules>({
  name: [
    {
      validator: (_, value: string, callback): void => {
        if (value.trim() === "") {
          callback(new Error(t("common.usernameTip")));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  pwd: [
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
  ]
});

// 登录处理
const handleLogin = (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) {
    return;
  }

  formEl.validate(async valid => {
    if (!valid) {
      loading.value = false;
      return;
    }

    const loginParams = {
      name: loginForm.name,
      pwd: btoa(loginForm.pwd as string)
    };
    const res: UserResult = await useUserStoreHook().login({ ...loginParams });
    loading.value = false;
    if (!res) return;
    const { data } = res;
    if (!data) return;
    const { expireTime, shouldChangePwd } = data;
    const time = toDateString(expireTime, BIRTH_DATE_FORMAT);
    isFirstLogin.value = shouldChangePwd;
    if (shouldChangePwd || new Date().getTime() >= new Date(time).getTime()) {
      changePwdTipDlgVisible.value = true;
    } else {
      // login success, redirect to patient page
      location.href = `${location.origin}/patient`;
    }
  });
};
const handleConfirmToChange = () => {
  // 弹出修改密码弹窗
  changePwdTipDlgVisible.value = false;
  changePwdDlgVisible.value = true;
};
const handleCancelToJump = async () => {
  // 跳转patient页面
  !isFirstLogin.value && (await useUserStoreHook().delay30Days());
  changePwdTipDlgVisible.value = false;
  location.href = `${location.origin}/patient`;
};
const handleChangePwdOK = async () => {
  // 确认更改密码，回到登录页重新登陆
  changePwdDlgVisible.value = false;
  const res = await useUserStoreHook().logout();
  if (!res) return;
  loginForm.name = "";
  loginForm.pwd = "";
  loginFormRef.value!.clearValidate();
};
const handleChangePwdCancel = () => {
  // 不更改，跳转patient页面
  changePwdDlgVisible.value = false;
  location.href = `${location.origin}/patient`;
};
// 切换语言后清除校验
const handleLangChange = (formEl: FormInstance | undefined) => {
  if (!formEl) {
    return;
  }

  formEl.clearValidate();
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1200px;
  height: 100%;
  overflow: auto;
  text-align: center;
  background-color: #1c1c1c;

  .login-logo {
    position: relative;
    top: -26px;
    left: 1px;
  }

  .content {
    display: flex;
    align-items: center;
    width: 1200px;
    height: 640px;
    background-color: #2e2e2f;
  }

  .login-form-wrapper {
    width: 50%;
    height: 100%;
    padding: 50px 50px 50px 80px;

    .picasso-logo {
      margin: 33px 0 48px;
    }

    .login-btn {
      height: 40px;
      margin: 38px 0 50px;
    }

    :deep(.el-form) {
      .el-input__inner {
        height: 40px;
      }

      .el-button {
        width: 100%;
        color: $divide-dark-color;
        background-color: #ffc800;

        &:hover {
          background: #ffcf1f;
        }
      }
    }

    .bottom-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 120px;

      .left-info {
        opacity: 0.6;

        .info {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }

        .phone-icon,
        .email-icon {
          margin-right: 12px;
        }
      }
    }
  }
}
</style>
