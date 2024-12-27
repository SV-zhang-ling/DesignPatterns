<template>
  <div class="image-settings">
    <div class="image-settings__item">
      <span class="label">{{ $t("analysis.angioEnhance") }}</span>
      <el-switch v-model="mosaicStore.enhance" @change="handleAngioChange" />
    </div>
    <!-- 量化先不做
    <div class="image-settings__item">
      <span class="label">{{ $t("analysis.measure") }}</span>
      <el-select
        v-model="mosaicStore.measure"
        class="select-list"
        @change="handleAngioChange"
      >
        <el-option
          v-for="item in MEASURE_LIST"
          :key="item.value"
          :value="item.value"
          :label="$t(item.labelKey)"
        />
      </el-select>
    </div>
    <div class="image-settings__item">
      <span class="label">{{ $t("analysis.quantize") }}</span>
      <el-select
        v-model="mosaicStore.quantize"
        class="select-list"
        @change="handleAngioChange"
      >
        <el-option
          v-for="item in QUANTIZE_LIST"
          :key="item.value"
          :value="item.value"
          :label="$t(item.labelKey)"
        />
      </el-select>
    </div> -->
  </div>
</template>
<script lang="ts" setup>
import { useMosaicStoreHook } from "../store/mosaic";
// import { MEASURE_LIST, QUANTIZE_LIST } from "@/utils/constant";

defineOptions({
  name: "MosaicImageSettings"
});

const mosaicStore = useMosaicStoreHook();

// handle layer selected
const handleAngioChange = (val: string | number | boolean) => {
  mosaicStore.enhance = Boolean(val);
};
</script>
<style lang="scss" scoped>
.image-settings {
  display: flex;
  align-items: center;
  height: 100%;
}

.image-settings__item {
  display: flex;
  align-items: center;
  margin-right: 20px;

  .label {
    margin-right: 8px;
  }

  .select-list {
    width: 180px;
  }
}
</style>
