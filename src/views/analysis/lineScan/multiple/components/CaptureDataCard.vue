<template>
  <div
    class="capture-data-card"
    v-if="!captureDetail.loading"
    @mouseenter="handleDataActive(captureDetail)"
  >
    <section class="bscan">
      <AnalysisCaptureInfoBox
        :oculus="captureDetail.oculusType"
        :capture-time="captureDetail.captureTime"
        :protocol="captureDetail.protocolName"
        :ssi="selectedRecord.SSI"
        :comment="selectedRecord.Comment"
        :follow="selectedRecord.Follow"
        @edit="handleEditCapture"
      >
        <line-scan-bscan
          :data-capture-key="captureDetail.captureKey"
          :capture-key="captureDetail.captureKey"
          :src="multipleLineScanStore.bscanSrc(captureDetail)"
          :index="activeIndex(captureDetail)"
          :processorsType="captureDetail.bscanProcessorType"
          :smart-bc="captureDetail.bscanSmartBC"
          :activeSlice="captureDetail.activeSlice"
          :currentReferencePos="
            multipleLineScanStore.currentReferencePos(captureDetail)
          "
          :zoomRatio="captureDetail.lineBscanZoomRatio"
          :bscanZoomRulerHeight="captureDetail.lineBscanZoomRulerHeight"
          :bscanZoomRulerWidth="captureDetail.lineBscanZoomRulerWidth"
          :bscanZoomRuler="multipleLineScanStore.bscanZoomRuler"
          :referencePosSet="captureDetail.referencePosSet"
          :setReferencePos="(pos: number) => multipleLineScanStore.setReferencePos(pos, captureDetail)"
          :repeat="captureDetail.repeat"
          :rotate="captureDetail.rotation_deg"
          :sum="captureDetail.dim_slow"
          :averagedFramesPerSlice="captureDetail.averagedFramesPerSlice"
          :isStarScan="isStarScanData(captureDetail.protocolName)"
          :aspectRatioFactor="aspectRatioFactor"
          :transform="captureDetail.xform_slow"
          :cols="captureDetail.dim_fast"
          :downBoundary="captureDetail.downBoundary"
          :oculusType="captureDetail.oculusType"
          :spacingZ_um="captureDetail.spacingZ_um"
          :brightness="captureDetail.bscanBrightness"
          :contrast="captureDetail.bscanContrast"
          :setBrightnessContrast="multipleLineScanStore.setBrightnessContrast"
          :isAS="isAnteriorScan(captureDetail.protocolName)"
          :measureLoading="measureCommonStore.measureLoading"
          @smartBcChange="handleSmartBcChange"
          @updateActiveSlice="
            (slice: number) => multipleLineScanStore.setActiveBscanSlice(slice, captureDetail)
          "
        />
      </AnalysisCaptureInfoBox>
    </section>
    <section class="slo">
      <slo-viewer
        :data-capture-key="captureDetail.captureKey"
        :class="hasThumbnails ? 'slow-viewer' : 'no-thumbnails-viewer'"
        :slo="multipleLineScanStore.sloRect(captureDetail)"
        :capture-key="captureDetail.captureKey"
        :enface="multipleLineScanStore.enfaceRect(captureDetail)"
        :activeSlice="captureDetail.activeSlice"
        :currentReferencePos="
          multipleLineScanStore.currentReferencePos(captureDetail)
        "
        :showBscanPosOnActiveLine="
          multipleLineScanStore.showBscanPosOnActiveLine
        "
        :smart-bc="captureDetail.sloSmartBC"
        :brightness="captureDetail.sloBrightness"
        :contrast="captureDetail.sloContrast"
        :setBrightnessContrast="multipleLineScanStore.setBrightnessContrast"
        :isStarScan="isStarScanData(captureDetail.protocolName)"
        :isCubeData="isCubeScan(captureDetail.protocolName)"
        :showDirection="isAnteriorScan(captureDetail.protocolName)"
        :oculusType="captureDetail.oculusType"
        :arrowDeg="captureDetail.oculusType === OculusTypeEnum.OD ? 0 : 180"
        :measureLoading="measureCommonStore.measureLoading"
        @smartBcChange="handleSmartBcChange"
        @updateActiveSlice="(slice: number) => multipleLineScanStore.setActiveBscanSlice(slice, captureDetail)"
      />
      <section v-if="hasThumbnails" class="bscan-thumbnails">
        <BscanThumbnails
          :captureDetail="captureDetail"
          :isStarScan="isStarScanData(captureDetail.protocolName)"
          :activeSlice="captureDetail.activeSlice"
          :bscanSmartBC="captureDetail.bscanSmartBC"
          :syncSlowBscanIndex="analysisCommonStore.syncSlowBscanIndex"
          @updateActiveSlice="(slice: number) => multipleLineScanStore.setActiveBscanSlice(slice, captureDetail)"
        />
      </section>
    </section>
  </div>
  <ModifyCaptureDialog
    :visible="modifyCaptureDlgVisible"
    :record="selectedRecord"
    @ok="(comment: string) => onModifyCaptureOK(comment)"
    @cancel="handleModifyCaptureCancel"
  />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import BscanThumbnails from "@/views/analysis/lineScan/components/BscanThumbnails.vue";
import ModifyCaptureDialog from "@/views/components/ModifyCaptureDialog.vue";
import { OculusTypeEnum, AnalysisModeEnum } from "@/enums";
import {
  isSingleLineScanProtocol,
  isStarScanData,
  isCubeScan,
  isAnteriorScan,
  isICLScan2DProtocol
} from "@/utils/protocol";
import {
  useAnalysisMultipleCommonStoreHook,
  CaptureDetailWithKey
} from "@/views/analysis/store/analysisMultipleCommon";
import { useBasicInfoStoreHook } from "@/views/analysis/components/store/basicInfo";
import { useMultipleLineScanStoreHook } from "../store/index";
import { useSelectDataStoreHook } from "@/views/analysis/components/store/selectData";
import { useModifyCapture } from "@/hooks/useModifyCapture";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import router from "@/router";
import { PageRoute } from "@/utils/route";
import { useSaveImageStoreHook } from "@/views/analysis/components/saveImage/store";

const {
  modifyCaptureDlgVisible,
  handleEditCapture,
  handleModifyCaptureOK,
  handleModifyCaptureCancel
} = useModifyCapture();

defineOptions({
  name: "CaptureDataCard"
});

interface Props {
  captureDetail: CaptureDetailWithKey;
}

const route = useRoute();
const props = defineProps<Props>();

const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
const analysisCommonStore = useAnalysisCommonStoreHook();
const multipleLineScanStore = useMultipleLineScanStoreHook();
const basicInfoStore = useBasicInfoStoreHook();
const selectDataStore = useSelectDataStoreHook();
const measureCommonStore = useMeasureCommonStore();
const saveImageStore = useSaveImageStoreHook();

const isSingleLineScan = computed(
  () =>
    isSingleLineScanProtocol(props.captureDetail.protocolName) ||
    isICLScan2DProtocol(props.captureDetail.protocolName)
);

const activeIndex = computed(() => {
  return (item: CaptureDetailWithKey) =>
    isSingleLineScan.value ? 0 : item.activeSlice;
});

const aspectRatioFactor = computed(() =>
  isAnteriorScan(props.captureDetail.protocolName) ? 1 : 0.4
);

const selectedRecord = computed(() =>
  analysisMultipleCommonStore.getRecordByKey(props.captureDetail.captureKey)
);

const hasThumbnails = computed(() => {
  if (basicInfoStore.analysisMode === AnalysisModeEnum.OU)
    return props.captureDetail.dim_slow > 1;
  if (basicInfoStore.analysisMode === AnalysisModeEnum.Change) {
    return (
      props.captureDetail.dim_slow > 1 &&
      selectDataStore.changeSelectedList.length <= 2
    );
  }
});

const handleSmartBcChange = ({
  imageType,
  smartBC
}: {
  imageType: string;
  smartBC: number;
}) => {
  multipleLineScanStore.updateSmartBC({
    imageType,
    smartBC,
    item: props.captureDetail
  });
};

const onModifyCaptureOK = (comment: string) => {
  selectedRecord.value.Comment = comment;
  handleModifyCaptureOK(comment, props.captureDetail.captureKey);
};

const handleDataActive = (captureDetail: CaptureDetailWithKey) => {
  if (saveImageStore.showAngioBscan || saveImageStore.showSloBscan) return;
  analysisMultipleCommonStore.activeCaptureCard = captureDetail;
};

watch(
  () => props.captureDetail?.loading,
  (val: boolean) => {
    if (!props.captureDetail || val) return;

    // 同步主数据activeSlice
    analysisMultipleCommonStore.syncActiveSlice(route.query.m as string);

    router.currentRoute.value.path === PageRoute.MultipleLineScan &&
      measureCommonStore.getMeasureData(props.captureDetail.captureKey);
  },
  {
    immediate: true
  }
);
</script>

<style lang="scss" scoped>
.capture-data-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.bscan {
  flex: 2;
  height: 65%;
}

.slo {
  display: flex;
  flex: 1;
  overflow: hidden;

  .slow-viewer {
    width: calc(100% - 585px);
  }

  .no-thumbnails-viewer {
    width: 100%;
  }

  .bscan-thumbnails {
    width: 585px;
    overflow: auto;
  }
}
</style>
