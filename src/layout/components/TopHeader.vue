<template>
  <div ref="topHeaderRef" class="top-header">
    <div class="top-header-left">
      <!-- hide the actions on the top left corner
      <div class="top-header-item file">{{ $t("common.file") }}</div>
        <div class="top-header-item preference">
          {{ $t("common.preference") }}
        </div>
      <div class="top-header-item help">{{ $t("common.help") }}</div>
      -->
      <div class="top-header-item about" @click="handleShowAbout">
        {{ $t("common.about") }}
      </div>
      <div class="top-header-item" @click="handleShowHelp">
        {{ $t("common.help") }}
      </div>
    </div>
    <div class="top-header-right">
      <el-dropdown placement="bottom-start" @command="handleMenuClick">
        <span class="el-dropdown-link">
          <div class="user-name">
            <icon-svg name="user" />
            <span class="name-value">{{ username }}</span>
          </div>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in USER_DROPDOWN_LIST"
              :key="item.value"
              :command="item.value"
            >
              {{ $t(item.labelKey) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <ConfirmDialog
    :visible="confirmDlgVisible"
    :message="$t('common.confirmLogout')"
    :confirm-label-text="$t('common.confirmText')"
    :cancel-label-text="$t('common.cancelText')"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
  <ChangePwdDialog
    :dlgVisible="changePwdDlgVisible"
    @ok="handleChangePwdOK"
    @cancel="handleChangePwdCancel"
  />
  <AboutInfoDialog :visible="aboutDlgVisible" @cancel="handleAboutClose" />
</template>
<script lang="ts" setup>
import { ElNotification } from "element-plus";
import AboutInfoDialog from "./AboutInfoDialog.vue";
import { useI18n } from "vue-i18n";
import LocalStorageUtil from "@/utils/localStorageUtil";
import { useUserStoreHook } from "@/views/user/store/user";
import { doLogout } from "@/utils/auth";
import { getDefaultLang } from "@/utils";

enum USER_ACTION {
  LOGOUT = "logout",
  SWITCH = "switchAccount",
  CHANGEPWD = "changePassword"
}

// user dropdown actions
const USER_DROPDOWN_LIST = [
  // {
  //   labelKey: "common.switchAccount",
  //   value: USER_ACTION.SWITCH
  // },
  {
    labelKey: "common.changePwd",
    value: USER_ACTION.CHANGEPWD
  },
  {
    labelKey: "common.logout",
    value: USER_ACTION.LOGOUT
  }
];

const { t } = useI18n();
const userStore = useUserStoreHook();
const username = userStore.name || LocalStorageUtil.getItem("name");
const confirmDlgVisible = ref(false);
const changePwdDlgVisible = ref(false);
const aboutDlgVisible = ref<boolean>(false);

const handleMenuClick = (command: string) => {
  switch (command) {
    case USER_ACTION.LOGOUT:
      handleLogout();
      break;
    case USER_ACTION.CHANGEPWD:
      handleChangePwd();
      break;
    case USER_ACTION.SWITCH:
      // TO-DO
      break;
    default:
      throw new Error(`No such command: ${command}`);
  }
};

const handleLogout = () => {
  confirmDlgVisible.value = true;
};

const handleConfirm = async () => {
  const res = await userStore.logout();
  confirmDlgVisible.value = false;
  if (!res.succeed) {
    ElNotification({
      type: "error",
      message: t("common.logoutFail"),
      customClass: "custom-notification-center"
    });
    return;
  }

  doLogout();
};

const handleCancel = () => {
  confirmDlgVisible.value = false;
};
const handleChangePwd = () => {
  changePwdDlgVisible.value = true;
};
const handleChangePwdOK = async () => {
  // 确认更改密码，回到登录页重新登陆
  changePwdDlgVisible.value = false;
  const res = await useUserStoreHook().logout();
  if (!res) return;
  doLogout();
};
const handleChangePwdCancel = () => {
  // 不更改
  changePwdDlgVisible.value = false;
};

// Show about dialog
const handleShowAbout = () => {
  aboutDlgVisible.value = true;
};
const handleShowHelp = () => {
  window.open(`/instruction_${getDefaultLang()}.pdf`, "_blank");
};

const handleAboutClose = () => {
  aboutDlgVisible.value = false;
};
</script>
<style lang="scss" scoped>
.top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 24px;
  font-size: 12px;
  border-bottom: 1px solid $divide-dark-color;

  .top-header-left {
    display: flex;
  }

  .top-header-item {
    padding: 0 20px;
    cursor: pointer;
  }

  .user-name {
    display: flex;
    align-items: center;
    padding: 0 20px;
    cursor: pointer;

    .name-value {
      margin-left: 5px;
    }
  }

  .top-header-right {
    display: flex;
    align-items: center;
  }
}
</style>
