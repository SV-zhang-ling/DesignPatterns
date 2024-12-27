<template>
  <ElConfigProvider :locale="locale">
    <router-view />
  </ElConfigProvider>
</template>
<script lang="ts" setup>
import { ElConfigProvider } from "element-plus";
import { computed } from "vue";
import { localesConfigs } from "@/locales/i18n";
import LocalStorageUtil from "@/utils/localStorageUtil";

const lang = LocalStorageUtil.getItem("lang") || navigator.language;
const locale = computed(() =>
  lang === "zh-CN" ? localesConfigs["zh-CN"] : localesConfigs.en
);
</script>
