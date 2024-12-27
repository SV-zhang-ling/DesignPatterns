<template>
  <div
    class="line-images__row"
    v-if="selectDataStore.changeSelectedList.length"
  >
    <template v-if="selectDataStore.changeSelectedList.length <= 3">
      <el-row :gutter="8" style="height: 100%">
        <el-col
          :span="24 / selectDataStore.changeSelectedList.length"
          v-for="item in analysisMultipleCommonStore.selectedList"
          :key="item.captureKey"
          style="height: 100%"
        >
          <CaptureDetailCard :captureDetail="captureDetail(item)" />
        </el-col>
      </el-row>
    </template>
    <template v-else>
      <el-row :gutter="8" style="height: 100%">
        <el-col
          :span="12"
          v-for="item in selectDataStore.changeSelectedList"
          :key="item.captureKey"
          class="image-rect"
        >
          <CaptureDetailMore :captureDetail="captureDetail(item)" />
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script lang="ts" setup>
import CaptureDetailCard from "./CaptureDataCard.vue";
import CaptureDetailMore from "./CaptureDataMore.vue";
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
  () => selectDataStore.changeSelectedKeys,
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
