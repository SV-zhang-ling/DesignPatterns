<template>
  <el-row
    class="line-images__row"
    :gutter="8"
    v-if="selectDataStore.ouSelectedList.length"
  >
    <el-col
      v-for="item in analysisMultipleCommonStore.selectedList"
      :key="item.captureKey"
      :span="12"
      style="height: 100%"
    >
      <CaptureDetailCard :captureDetail="captureDetail(item)" />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import CaptureDetailCard from "./CaptureDataCard.vue";
import { useSelectDataStoreHook } from "@/views/analysis/components/store/selectData";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { CaptureType } from "@/views/patient/utils/patient";

const selectDataStore = useSelectDataStoreHook();
const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();

const captureDetail = computed(
  () => (item: CaptureType) =>
    analysisMultipleCommonStore.captureDetail(item.captureKey ?? "")
);

watch(
  () => selectDataStore.ouSelectedKeys,
  (newVal, oldVal) => {
    const rawNewVal = toRaw(newVal);
    const rawOldVal = toRaw(oldVal);
    if (rawNewVal && JSON.stringify(rawNewVal) !== JSON.stringify(rawOldVal)) {
      analysisMultipleCommonStore.initPageInfo();
    }
  },
  {
    immediate: true,
    deep: true
  }
);
</script>
