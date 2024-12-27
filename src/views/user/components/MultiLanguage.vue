<template>
  <div class="multi-lang">
    <el-select class="lang-select" v-model="lang" @change="handleSelectChange">
      <template #prefix>
        <icon-svg name="language" />
      </template>
      <el-option
        v-for="item in LANGUAGE_LIST"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>
<script lang="ts" setup>
import { getDefaultLang } from "@/utils";
import { LANGUAGE_LIST } from "@/utils/constant";
import { useLocaleStoreHook } from "../store/locale";
import { useI18n } from "vue-i18n";

// default language
const DEFAULT_LANGUAGE = getDefaultLang();

const lang = ref(DEFAULT_LANGUAGE);
const { locale } = useI18n();

const emit = defineEmits(["change"]);

const handleSelectChange = (val: string) => {
  useLocaleStoreHook().SET_LANG(val);
  locale.value = val;
  emit("change");
};
</script>
<style lang="scss" scoped>
.multi-lang {
  text-align: right;

  .lang-select {
    width: 120px;
  }
}

:deep(.el-select) {
  .el-select__wrapper {
    font-size: $font-size-middle;
    background-color: transparent;

    &.is-hovering {
      border: none;
    }
  }
}
</style>
