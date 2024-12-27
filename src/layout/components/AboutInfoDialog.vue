<template>
  <sv-dialog
    :visible="visible"
    v-bind="$attrs"
    width="600"
    :title="$t('common.about')"
    class="about-info-dialog"
    :hasFooter="false"
    @cancel="handleCancel"
  >
    <div class="info-box">
      <img class="logo" src="@/assets/icons/company-logo.svg" />

      <div class="app-name">
        <span class="name-left">DREAM</span>
        <span class="name-right">Imaging</span>
      </div>
      <div class="app-version">
        <span class="version-label">{{ $t("common.version") }}：</span>
        {{ appVersion }}
      </div>
      <div class="app-version">
        <span class="version-label">{{ $t("common.fullVersion") }}：</span>
        {{ appFullVersion }}
      </div>
      <div class="app-limit-desc">{{ $t("common.copyright") }}</div>
    </div>
  </sv-dialog>
</template>

<script setup lang="ts">
defineOptions({
  name: "AboutInfoDialog"
});

interface Props {
  visible: boolean;
}

defineProps<Props>();

const emits = defineEmits(["ok", "cancel"]);

const appVersion = computed(() => process.env.VUE_APP_VERSION);

const appFullVersion = computed(() => process.env.VUE_APP_FULL_VERSION);

const handleCancel = () => {
  emits("cancel", false);
};
</script>

<style lang="scss" scoped>
.info-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 380px;

  .logo {
    height: 60px;
    margin-top: 80px;
    margin-bottom: 20px;
  }

  .app-name {
    margin-bottom: 83px;
    font-size: 18px;
    font-feature-settings: "kern" on;
    line-height: normal;
    color: #fff;

    .name-left {
      font-variation-settings: "opsz" auto;
      font-weight: bold;
    }

    .name-right {
      margin-left: 6px;
      font-weight: normal;
      font-feature-settings: "kern" on;
    }
  }

  .app-version {
    margin-bottom: 7px;
    font-size: 12px;
    font-weight: normal;
    line-height: 22px;
    color: rgb(226 226 226 / 60%);
  }

  .app-limit-desc {
    font-size: 12px;
    line-height: 20px;
    color: rgb(226 226 226 / 60%);
  }
}
</style>
