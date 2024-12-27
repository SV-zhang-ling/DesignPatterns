<template>
  <el-dropdown
    :class="analysisDropdownClass"
    placement="bottom-start"
    @visible-change="handleAnalysisDropdownVisible"
    @command="handleAnalysisClick"
  >
    <span class="el-dropdown-link">
      <div class="jump-item">
        <div class="jump-item__icon">
          <icon-svg name="analysis" />
          <icon-svg name="downarrow" />
        </div>
        <div class="jump-item__label">{{ $t("patient.analysis") }}</div>
      </div>
    </span>
    <template #dropdown>
      <div class="analysis-dropdown__title">OCT Analysis</div>
      <el-dropdown-menu class="analysis-dropdown__menu">
        <el-dropdown-item
          v-for="item in analysisPageList"
          :key="item.value"
          :command="item"
          :class="
            analysisSelStore.activeAnalysis === item.value ? 'selected' : ''
          "
        >
          {{ $t(item.labelKey) }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import router from "@/router";
import { getAnalysisList, getAnalysisListByMode } from "@/utils";
import { AnalysisModeEnum } from "@/enums";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { useAnalysisSelStoreHook, AnalysisElement } from "./store/analysisSel";
import { useBasicInfoStoreHook } from "@/views/analysis/components/store/basicInfo";

const route = useRoute();

defineOptions({
  name: "AnalysisDropdownSel"
});

interface Props {
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false
});

interface PageItemType {
  labelKey: string;
  value: string;
  path: string;
}

const captureStore = useCaptureStoreHook();
const analysisSelStore = useAnalysisSelStoreHook();
const basicInfoStore = useBasicInfoStoreHook();
const analysisDropdownVisible = ref<boolean>(false);

const analysisPageList = computed(() => {
  const mode = route.query.m as string;
  const { Protocol } = captureStore.activeCaptureData;
  return mode === AnalysisModeEnum.OU || mode === AnalysisModeEnum.Change
    ? getAnalysisListByMode(Protocol, mode)
    : getAnalysisList(Protocol);
});

const analysisDropdownClass = computed(() => [
  "analysis-dropdown",
  `${props.active ? "active" : ""}`,
  `${analysisDropdownVisible.value ? "open" : ""}`
]);

const setActiveAnalysis = (value: string) => {
  analysisSelStore.setAnalysis(value);
};

watch(
  [() => captureStore.activeCaptureData, () => route.path],
  () => {
    const { path } = route;
    analysisSelStore.singleAnalysisList =
      analysisPageList.value as Array<AnalysisElement>;
    const item = analysisPageList.value?.find(item => item.path === path);
    item && setActiveAnalysis(item.value);
  },
  { immediate: true, deep: true }
);

// analysis dropdown visisble
const handleAnalysisDropdownVisible = (visible: boolean) => {
  analysisDropdownVisible.value = visible;
};

// click an analysis page
const handleAnalysisClick = (item: PageItemType) => {
  setActiveAnalysis(item.value);
  const { m } = route.query;
  basicInfoStore.analysisMode = m
    ? (m as AnalysisModeEnum)
    : AnalysisModeEnum.Single;
  const { captureKey } = captureStore.activeCaptureData;
  router.push({
    path: item.path,
    query: {
      ...route.query,
      captureKey
    }
  });
};
</script>

<style lang="scss" scoped>
.jump-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 96px;
  height: 100%;
  padding: 14px 0;
  text-align: center;

  .jump-item__icon {
    display: flex;
    align-items: center;

    img {
      margin-left: 5px;
    }
  }

  .jump-item__label {
    margin-top: 8px;
  }
}

.analysis-dropdown {
  &.open {
    background-color: $dialog-bg-color;
  }

  &.active {
    background-color: $input-bg-color;
  }
}

.analysis-dropdown__menu {
  margin: 16px 0;
}

.analysis-dropdown__title {
  padding: 0 32px;
  margin-top: 16px;
  font-size: 20px;
  font-weight: 700;
}
</style>
