<template>
  <div
    class="images__row change-content"
    v-if="selectDataStore.changeSelectedList.length"
  >
    <template v-if="selectDataStore.changeSelectedList.length <= 4">
      <el-row :gutter="8" style="height: 100%">
        <el-col
          :span="24 / selectDataStore.changeSelectedList.length"
          v-for="item in analysisMultipleCommonStore.selectedList"
          :key="item.captureKey"
          style="height: 100%"
        >
          <CaptureDetailCard
            v-if="captureDetail(item)"
            :captureDetail="captureDetail(item)"
          />
        </el-col>
      </el-row>
    </template>
    <template v-else-if="selectDataStore.changeSelectedList.length <= 6">
      <el-row :gutter="8" style="height: 100%">
        <el-col
          :span="8"
          v-for="item in selectDataStore.changeSelectedList"
          :key="item.captureKey"
          class="image-rect"
        >
          <CaptureDetailCard
            v-if="captureDetail(item)"
            :captureDetail="captureDetail(item)"
          />
        </el-col>
      </el-row>
    </template>
    <template v-else>
      <el-row :gutter="8" style="height: 100%">
        <el-col
          :span="6"
          v-for="item in selectDataStore.changeSelectedList"
          :key="item.captureKey"
          class="image-rect"
        >
          <CaptureDetailCard
            v-if="captureDetail(item)"
            :captureDetail="captureDetail(item)"
          />
        </el-col>
      </el-row>
    </template>
  </div>
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
