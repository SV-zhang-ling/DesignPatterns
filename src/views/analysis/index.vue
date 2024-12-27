<template>
  <div class="analysis-home">
    <BasicInfo />
    <RouterView v-slot="{ Component }">
      <template v-if="Component">
        <!-- 加载中状态 -->
        <loading-content v-if="showLoading"></loading-content>
        <Suspense @pending="handleSusPending" @resolve="handleSusResolve">
          <!-- 主要内容 -->
          <component :is="Component"></component>
          <!-- 加载中状态 -->
          <!-- <template #fallback>
            <div class="laoding-tip">
              <img src="@/assets/images/page-loading.gif" width="60" />
              <span class="msg">{{ $t("common.loadingText") }}</span>
            </div>
          </template> -->
        </Suspense>
      </template>
    </RouterView>
    <mask-content id="loadingMask"></mask-content>
    <SloWithBscan />
    <AngioWithBscan />
  </div>
</template>

<script setup lang="ts">
import BasicInfo from "./components/BasicInfo.vue";
import AngioWithBscan from "@/views/analysis/components/saveImage/AngioWithBscan.vue";
import SloWithBscan from "@/views/analysis/components/saveImage/SloWithBscan.vue";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
import { useAnalysisCommonStoreHook } from "./store/analysisCommon";
import { useAnalysisMultipleCommonStoreHook } from "./store/analysisMultipleCommon";
import { useSaveImageStoreHook } from "@/views/analysis/components/saveImage/store/index";

const contextmenuStore = useContextmenuStoreHook();
const analysisCommonStore = useAnalysisCommonStoreHook();
const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
const saveImageStore = useSaveImageStoreHook();

const showLoading = ref(true);

const handleSusPending = () => {
  showLoading.value = true;
};
const handleSusResolve = () => {
  showLoading.value = false;
};

onUnmounted(() => {
  // 分析页面离开时，重置相关store数据
  contextmenuStore.$reset();
  analysisCommonStore.$reset();
  analysisMultipleCommonStore.$reset();
});
</script>

<style lang="scss" scoped>
.analysis-home {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 1360px;
  height: calc(100% - 24px);
  min-height: 768px;
}

.laoding-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding-top: 25%;
  background-color: $image-bg-color;

  .msg {
    margin-top: 15px;
  }
}
</style>
