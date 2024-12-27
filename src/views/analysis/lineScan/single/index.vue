<template>
  <el-container class="analysis-container">
    <el-container class="line-images">
      <el-aside class="image-area line-images__left" width="589px">
        <section :class="sloClass">
          <AnalysisCaptureInfoBox
            :oculus="analysisCommonStore.oculusType"
            :capture-time="analysisCommonStore.captureTime"
            :protocol="captureStore.activeCaptureData?.Protocol"
            :ssi="captureStore.activeCaptureData?.SSI"
            :comment="captureStore.activeCaptureData?.Comment"
            @edit="handleEditCapture"
          >
            <slo-viewer
              v-show="success"
              :slo="lineScanStore.sloRect"
              :enface="lineScanStore.enfaceRect"
              :activeSlice="lineScanStore.activeSlice"
              :currentReferencePos="lineScanStore.currentReferencePos"
              :showBscanPosOnActiveLine="lineScanStore.showBscanPosOnActiveLine"
              :smart-bc="lineScanStore.sloSmartBC"
              :brightness="lineScanStore.sloBrightness"
              :contrast="lineScanStore.sloContrast"
              :setBrightnessContrast="lineScanStore.setBrightnessContrast"
              :isStarScan="isStarScan"
              :isCubeData="isCubeData"
              :showDirection="isAS"
              :oculusType="analysisCommonStore.oculusType"
              :arrowDeg="
                analysisCommonStore.oculusType === OculusTypeEnum.OD ? 0 : 180
              "
              @smartBcChange="lineScanStore.updateSmartBC"
              @updateActiveSlice="lineScanStore.setActiveBscanSlice"
            />
          </AnalysisCaptureInfoBox>
        </section>
        <section v-if="hasThumbnails" class="bscan-thumbnails">
          <!-- <div class="bscan-selected-info">
            Selected {{ lineScanStore.activeSlice + 1 }}/{{
              analysisCommonStore.dim_slow
            }}
          </div> -->
          <BscanThumbnails
            :captureDetail="analysisCommonStore.$state"
            :isStarScan="isStarScan"
            :activeSlice="lineScanStore.activeSlice"
            :bscanSmartBC="lineScanStore.bscanSmartBC"
            :syncSlowBscanIndex="analysisCommonStore.syncSlowBscanIndex"
            @update-active-slice="lineScanStore.setActiveBscanSlice"
          />
        </section>
      </el-aside>
      <el-main class="image-area line-images__right">
        <line-scan-bscan
          v-show="success"
          :src="lineScanStore.bscanSrc"
          :index="activeIndex"
          :processorsType="lineScanStore.bscanProcessorType"
          :smart-bc="lineScanStore.bscanSmartBC"
          :activeSlice="lineScanStore.activeSlice"
          :currentReferencePos="lineScanStore.currentReferencePos"
          :referencePosSet="lineScanStore.referencePosSet"
          :setReferencePos="lineScanStore.setReferencePos"
          :repeat="analysisCommonStore.repeat"
          :rotate="analysisCommonStore.rotation_deg"
          :sum="analysisCommonStore.dim_slow"
          :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
          :isStarScan="isStarScan"
          :brightness="lineScanStore.bscanBrightness"
          :contrast="lineScanStore.bscanContrast"
          :setBrightnessContrast="lineScanStore.setBrightnessContrast"
          :aspectRatioFactor="aspectRatioFactor"
          :zoomRatio="lineScanStore.bscanZoomRatio"
          :bscanZoomRulerHeight="lineScanStore.bscanZoomRulerHeight"
          :bscanZoomRulerWidth="lineScanStore.bscanZoomRulerWidth"
          :bscanZoomRuler="lineScanStore.bscanZoomRuler"
          :transform="analysisCommonStore.xform_slow"
          :cols="analysisCommonStore.dim_fast"
          :downBoundary="analysisCommonStore.downBoundary"
          :oculusType="analysisCommonStore.oculusType"
          :spacingZ_um="analysisCommonStore.spacingZ_um"
          :isAS="isAS"
          @smartBcChange="lineScanStore.updateSmartBC"
          @updateActiveSlice="lineScanStore.setActiveBscanSlice"
        />
      </el-main>
    </el-container>
    <el-footer class="image-action-container" height="36px">
      <ImageActions
        :showNavigation="!isAS"
        :defaultShowNav="false"
        :showLayerOnBscan="isAS"
        :showLayerEdit="
          isAS && !isSingleLineScanProtocol(analysisCommonStore.protocolName)
        "
        :disableLayerOnBscan="!lineScanStore.corrected"
        :show-scan-line-action="!isCubeData"
        :show-scan-line="!isStarScan && !isSingleLineScan"
        :show-star-line="isStarScan && !isSingleLineScan"
        @change="handleChange"
      />
    </el-footer>
  </el-container>
  <ModifyCaptureDialog
    :visible="modifyCaptureDlgVisible"
    :record="captureStore.activeCaptureData"
    @ok="handleModifyCaptureOK"
    @cancel="handleModifyCaptureCancel"
  />
  <EditLayerDialog
    :dlgVisible="editLayersStore.showEditLayerDig"
    :bscan-type="ContainerNameEnum.AdvancedSegBscan"
    @closeDig="handleCloseEditLayerDig"
  />
</template>

<script setup lang="ts">
import ModifyCaptureDialog from "@/views/components/ModifyCaptureDialog.vue";
import EditLayerDialog from "@/views/analysis/components/layers/components/EditLayerDialog.vue";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import ImageActions from "../../components/ImageActions.vue";
import BscanThumbnails from "../components/BscanThumbnails.vue";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { useLineScanStoreHook } from "./store/index";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useModifyCapture } from "@/hooks/useModifyCapture";
import { useBeforeRouteLeave } from "@/hooks/useBeforeRouteLeave";
import { ImageActionEnum, OculusTypeEnum, ContainerNameEnum } from "@/enums";
import {
  isSingleLineScanProtocol,
  isStarScanData,
  isCubeScan,
  isAnteriorScan,
  isICLScan2DProtocol
} from "@/utils/protocol";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { useImageActions } from "@/hooks/useImageActions";
import { freeMemeory } from "@/utils/tools/asSegmentation";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";

const { handleScanLineVisible, handleNavLineVisible, handleLayerVisible } =
  useImageActions();

const {
  modifyCaptureDlgVisible,
  handleEditCapture,
  handleModifyCaptureOK,
  handleModifyCaptureCancel
} = useModifyCapture();

const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStoreHook();
const lineScanStore = useLineScanStoreHook();
const editLayersStore = useEditLayersStoreHook();
const measureCommonStore = useMeasureCommonStore();

const isAS = computed(() => isAnteriorScan(analysisCommonStore.protocolName));

// 激活异步组件 Suspense,所有的数据必须等到拿到初始化数据后才能加载血流主页面
const success = await analysisCommonStore.initPageInfo();
if (isAS.value) {
  await lineScanStore.getAnteriorSurface();
}

await measureCommonStore.getMeasureData();

const isSingleLineScan = computed(
  () =>
    isSingleLineScanProtocol(analysisCommonStore.protocolName) ||
    isICLScan2DProtocol(analysisCommonStore.protocolName)
);

const isStarScan = computed(() =>
  isStarScanData(analysisCommonStore.protocolName)
);

const isCubeData = computed(() => isCubeScan(analysisCommonStore.protocolName));

const activeIndex = computed(() => {
  const index = isSingleLineScan.value ? 0 : lineScanStore.activeSlice;
  analysisCommonStore.setLineActiveSliceIndex(index);
  return index;
});

const hasThumbnails = computed(() => analysisCommonStore.dim_slow > 1);

const sloClass = computed(
  () => `slo ${analysisCommonStore.dim_slow > 1 ? "with-thumbnails" : ""}`
);

const aspectRatioFactor = computed(() =>
  isAnteriorScan(analysisCommonStore.protocolName) ? 1 : 0.4
);

const handleNavLineControl = (visible: boolean) => {
  handleNavLineVisible(visible);
  lineScanStore.showBscanPosOnActiveLine = visible;
};
const timeStamp = ref<number>(0);
editLayersStore.$onAction(
  ({
    name, //action 函数的名称
    args, //action 函数参数数组
    after //钩子函数，在action函数执行完成返回或者resolves后执行
  }) => {
    after(result => {
      if (["updateLayer"].includes(name)) {
        console.log(name, args, result);
        timeStamp.value = result as number;
      }
    });
  },
  false //默认是false，设置为true的时候，组件卸载时，订阅依然有效
);

const operationMaps: Operation = {
  [ImageActionEnum.Navigation]: handleNavLineControl,
  [ImageActionEnum.ScanLine]: handleScanLineVisible,
  [ImageActionEnum.LayerOnBscan]: handleLayerVisible
};

// image action change
const handleChange = (type: string, status: boolean) => {
  if (type === ImageActionEnum.LayerEdit) {
    editLayersStore.setEditLayerDigVisible(true);
  } else {
    operationMaps[type](status);
  }
};

// edit layer
const handleCloseEditLayerDig = () => {
  editLayersStore.setEditLayerDigVisible(false);
  // 是否需要更新页面
};

onBeforeMount(() => {
  lineScanStore.initReferencePosSet();
});
// 跳转路由前需要隐藏当前container

onUnmounted(() => {
  lineScanStore.$reset();
  freeMemeory();
  analysisCommonStore.clearSaveInfo();
});

useResizeObserver();
useBeforeRouteLeave();
</script>

<style lang="scss" scoped>
* {
  user-select: none;
}

.analysis-container {
  overflow: hidden;

  .line-images__left {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    margin: 0 5px;
    overflow: hidden;
    border-right: 1px solid $divide-dark-color;
    border-left: 1px solid $divide-dark-color;

    .slo {
      height: 100%;
      border: 1px solid $border-color-dark;

      &.with-thumbnails {
        height: 625px;
      }
    }

    .bscan-thumbnails {
      position: relative;
      height: calc(100% - 623px);
      overflow: auto;

      .bscan-selected-info {
        height: 36px;
        padding: 0 12px 0 10px;
        line-height: 36px;
        border-right: 1px solid $border-color-dark;
        border-left: 1px solid $border-color-dark;
      }

      .thumbnail-list {
        position: absolute;
        height: 100%; // 40px
        border: 1px solid $border-color-dark;
      }
    }
  }

  .line-images__right {
    padding: 0;
  }

  .angio-layer-thumbnail-container {
    display: flex;
    padding: 16px 0 0 13px;
    border-right: 1px solid $divide-dark-color;
  }

  .image-action-container {
    background-color: $image-bg-color;
    border-top: 1px solid $divide-light-color;
  }

  .image-setting-container {
    border-left: 1px solid $divide-dark-color;
  }

  .angio-images-container {
    padding: 0 5px;
  }
}
</style>
