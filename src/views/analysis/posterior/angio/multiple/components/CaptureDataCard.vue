<template>
  <div
    class="capture-data-card"
    ref="captureDataCardRef"
    @mouseenter="handleDataActive(captureDetail)"
  >
    <template v-if="captureDetail && !captureDetail.loading">
      <section class="angio-image">
        <AnalysisCaptureInfoBox
          :oculus="captureDetail.oculusType"
          :capture-time="captureDetail.captureTime"
          :protocol="captureDetail.protocolName"
          :ssi="selectedRecord.SSI"
          :comment="selectedRecord.Comment"
          :follow="selectedRecord.Follow"
          @edit="handleEditCapture"
        >
          <proj-viewer
            v-bind="multipleAngioStore.projRect(captureDetail)"
            :processorsType="captureDetail.angioProcessorType"
            :data-capture-key="captureDetail.captureKey"
            :capture-key="captureDetail.captureKey"
            :enfaceIndexName="enfaceLayerName"
            :x="captureDetail.x"
            :y="captureDetail.y"
            :brightness="captureDetail.angioBrightness"
            :contrast="captureDetail.angioContrast"
            :setBrightnessContrast="multipleAngioStore.setBrightnessContrast"
            :commitCrosshairPosition="handleCommitCorsshairPosition"
            :smart-bc="captureDetail.angioSmartBC"
            :measureLoading="measureCommonStore.measureLoading"
            @smartBcChange="handleSmartBcChange"
          />
        </AnalysisCaptureInfoBox>
      </section>
      <section class="bscan">
        <slow-bscan
          v-bind="multipleAngioStore.slowBscanRect(captureDetail)"
          :captureDetail="captureDetail"
          :data-capture-key="captureDetail.captureKey"
          :capture-key="captureDetail.captureKey"
          :bscan-type="ContainerNameEnum.SlowBScanMain"
          :aspectRatioFactor="0.4"
          :showAngio="multipleAngioStore.showAngio"
          :direction="AxisDirectionEnum.SLOW"
          :index="captureDetail.y"
          :sum="captureDetail.dim_slow"
          :averagedFramesPerSlice="captureDetail.averagedFramesPerSlice"
          :repeat="captureDetail.repeat"
          :zoomRatio="captureDetail.slowBscanZoomRatio"
          :bscanZoomRulerHeight="captureDetail.slowBscanZoomRulerHeight"
          :bscanZoomRulerWidth="captureDetail.slowBscanZoomRulerWidth"
          :bscanZoomRuler="multipleAngioStore.bscanZoomRuler"
          :x="captureDetail.x"
          :y="captureDetail.y"
          :brightness="captureDetail.slowBscanBrightness"
          :contrast="captureDetail.slowBscanContrast"
          :setBrightnessContrast="multipleAngioStore.setBrightnessContrast"
          :surfaceLoading="multipleAngioStore.surfaceLoading"
          :processorsType="captureDetail.bscanProcessorType"
          :ceilingSurfPoints="captureDetail.slowCeilingSurfPoints"
          :floorSurfPoints="captureDetail.slowFloorSurfPoints"
          :commitCrosshairPosition="handleCommitCorsshairPosition"
          :oculusType="captureDetail.oculusType"
          :smart-bc="captureDetail.slowBscanMainSmartBC"
          :measureLoading="measureCommonStore.measureLoading"
          @smartBcChange="handleSmartBcChange"
        />
      </section>
    </template>
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
import ModifyCaptureDialog from "@/views/components/ModifyCaptureDialog.vue";
import {
  ContainerNameEnum,
  AxisDirectionEnum,
  AnalysisModeEnum
} from "@/enums";
import router from "@/router";
import {
  useAnalysisMultipleCommonStoreHook,
  CaptureDetailWithKey
} from "@/views/analysis/store/analysisMultipleCommon";
import { useMultipleAngioStoreHook } from "../store/index";
import { useModifyCapture } from "@/hooks/useModifyCapture";
import useArrowKeysListener from "@/packages/utils/arrowKeysListenerHook";
import GroupResizeObserver from "@/utils/autoResize/groupResize";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
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
const route = useRoute();
const captureDataCardRef = ref<HTMLDivElement | null>(null);
interface Props {
  captureDetail: CaptureDetailWithKey;
}

const props = defineProps<Props>();

const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
const multipleAngioStore = useMultipleAngioStoreHook();
const measureCommonStore = useMeasureCommonStore();
const saveImageStore = useSaveImageStoreHook();

const selectedRecord = computed(() =>
  analysisMultipleCommonStore.getRecordByKey(props.captureDetail.captureKey)
);
const enfaceLayerName = computed(() =>
  router.currentRoute.value.query.m === AnalysisModeEnum.OU
    ? multipleAngioStore.ouActiveLayerName
    : multipleAngioStore.changeActiveLayerName
);

watch(
  () => props.captureDetail?.loading,
  (val: boolean) => {
    if (!props.captureDetail || val) return;

    props.captureDetail.captureKey &&
      multipleAngioStore.getPosteriorAngioLayer(props.captureDetail);

    // 同步主数据activeSlice
    analysisMultipleCommonStore.syncCommitCrosshairPosition(
      route.query.m as string
    );
    // 切换双眼、随访更新分层线
    multipleAngioStore.resetPosteriorSurface();

    router.currentRoute.value.path === PageRoute.MultipleAngio &&
      measureCommonStore.getMeasureData(props.captureDetail.captureKey);

    new GroupResizeObserver({
      groupBox: captureDataCardRef.value as HTMLDivElement,
      captureKey: props.captureDetail.captureKey
    });
  },
  {
    immediate: true
  }
);

const handleCommitCorsshairPosition = ({
  x,
  y
}: {
  x?: number;
  y?: number;
}) => {
  multipleAngioStore.commitCrosshairPosition({
    x,
    y,
    captureKey: props.captureDetail.captureKey
  });
};

const handleSmartBcChange = ({
  imageType,
  smartBC
}: {
  imageType: string;
  smartBC: number;
}) => {
  multipleAngioStore.updateSmartBC({
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

useArrowKeysListener(
  handleCommitCorsshairPosition,
  props.captureDetail.captureKey
);
// onMounted(() => {

// });
</script>

<style lang="scss" scoped>
.capture-data-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.angio-image {
  flex: 2;
  // height: 65%;
}

.bscan {
  flex: 1;
  padding: 1px;
  border: 1px solid $image-green;
}
</style>
