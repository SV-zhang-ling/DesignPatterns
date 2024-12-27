<template>
  <div
    class="capture-data-more"
    v-if="!captureDetail.loading"
    @mouseenter="handleDataActive(captureDetail)"
  >
    <div class="capture-data-info">
      <AnalysisCaptureInfoBox
        :oculus="captureDetail.oculusType"
        :capture-time="captureDetail.captureTime"
        :protocol="captureDetail.protocolName"
        :ssi="selectedRecord.SSI"
        :comment="selectedRecord.Comment"
        @edit="handleEditCapture"
      ></AnalysisCaptureInfoBox>
    </div>
    <el-row :gutter="8" style="height: 100%">
      <el-col :span="8">
        <slo-viewer
          class="slow-viewer"
          :data-capture-key="captureDetail.captureKey"
          :slo="multipleLineScanStore.sloRect(captureDetail)"
          :enface="multipleLineScanStore.enfaceRect(captureDetail)"
          :activeSlice="captureDetail.activeSlice"
          :currentReferencePos="
            multipleLineScanStore.currentReferencePos(captureDetail)
          "
          :showBscanPosOnActiveLine="
            multipleLineScanStore.showBscanPosOnActiveLine
          "
          :smart-bc="captureDetail.sloSmartBC"
          :isStarScan="isStarScanData(captureDetail.protocolName)"
          :isCubeData="isCubeScan(captureDetail.protocolName)"
          :showDirection="isAnteriorScan(captureDetail.protocolName)"
          :oculusType="captureDetail.oculusType"
          :arrowDeg="captureDetail.oculusType === OculusTypeEnum.OD ? 0 : 180"
          @smartBcChange="handleSmartBcChange"
          @updateActiveSlice="(slice: number) => multipleLineScanStore.setActiveBscanSlice(slice, captureDetail)"
        />
      </el-col>
      <el-col :span="16">
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
          :isAS="isAnteriorScan(captureDetail.protocolName)"
          @smartBcChange="handleSmartBcChange"
          @updateActiveSlice="
            (slice: number) => multipleLineScanStore.setActiveBscanSlice(slice, captureDetail)
          "
        />
      </el-col>
    </el-row>
  </div>
  <ModifyCaptureDialog
    :visible="modifyCaptureDlgVisible"
    :record="selectedRecord"
    @ok="(comment: string) => onModifyCaptureOK(comment)"
    @cancel="handleModifyCaptureCancel"
  />
</template>

<script setup lang="ts">
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

const props = defineProps<Props>();

const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
const multipleLineScanStore = useMultipleLineScanStoreHook();
const basicInfoStore = useBasicInfoStoreHook();
const selectDataStore = useSelectDataStoreHook();

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
  analysisMultipleCommonStore.activeCaptureCard = captureDetail;
};
</script>

<style lang="scss" scoped>
.capture-data-more {
  display: flex;
  flex-direction: column;
  height: 100%;

  .capture-data-info {
    height: 36px;
  }
}
</style>
