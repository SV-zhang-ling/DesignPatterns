<template>
  <sv-dialog
    :visible="dlgVisible"
    v-bind="$attrs"
    width="80%"
    top="80px"
    :title="$t('analysis.editLayer')"
    class="layer-edit-dialog"
    :close-on-press-escape="false"
    :hasFooter="false"
    :confirmBeforeClose="true"
    :dlgZIndex="dlgZIndex"
    @cancel="onCloseDig"
    @opened="onOpenedDig"
  >
    <el-container
      class="layer-edit-container"
      v-loading.fullscreen.lock="editLayersStore.dialogLoading"
    >
      <el-aside class="layer-edit-left" width="312px">
        <EditLayerLeftContent
          v-if="digOpenedSucess"
          :aspectRatioFactor="ratioFactor"
          :isAS="isAS"
        />
      </el-aside>
      <el-main class="layer-edit-main">
        <ManualLayerTool
          @handleEditLayer="onEditLayer"
          @handleDragLayer="onDragLayer"
          @handleZoomLayer="onZoomLayer"
          @handleFullScreenLayer="onFullScreenLayer"
          @handleConfirmLayer="onConfirmLayer"
        >
          <manual-layer-bscan
            class="manual-bscan"
            v-bind="editLayersStore.slowRect"
            :index="editLayersStore.bscanIndex"
            :smart-bc="editLayersStore.slowBscanSmartBC"
            :aspectRatioFactor="ratioFactor"
            :processorsType="editLayersStore.bscanProcessorType"
            :sum="analysisCommonStore.dim_slow"
            :averagedFramesPerSlice="analysisCommonStore.averagedFramesPerSlice"
            :repeat="analysisCommonStore.repeat"
            :x="editLayersStore.x"
            :y="editLayersStore.y"
            :commitCrosshairPosition="editLayersStore.commitCrosshairPosition"
            :oculusType="analysisCommonStore.oculusType"
            :downBoundary="analysisCommonStore.downBoundary"
            :isStarScan="isStarScan"
            :isAS="isAS"
            :isAsLineScan="isAsLineScan"
            @smartBcChange="editLayersStore.updateSmartBC"
          />
        </ManualLayerTool>
      </el-main>
      <el-aside class="layer-edit-right" width="216px">
        <EditLayerRightContent v-if="digOpenedSucess"></EditLayerRightContent>
      </el-aside>
    </el-container>
  </sv-dialog>

  <ConfirmDialog
    :visible="closeDlgVisible"
    :message="$t('analysis.closeDigText')"
    :confirm-label-text="$t('common.yes')"
    :cancel-label-text="$t('common.no')"
    @confirm="handleCloseConfirm"
    @cancel="handleCloseCancel"
  />
  <div class="dlg-loading-mask" id="dlg-loading-mask">
    <div class="mask-spinner">
      <img src="@/assets/images/page-loading.gif" width="60" />
      <span class="msg">{{ $t("analysis.confirmMaskText") }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useEditLayersStoreHook } from "../store/editLayers";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
import EditLayerLeftContent from "./EditLayerLeftContent.vue";
import EditLayerRightContent from "./EditLayerRightContent.vue";
import ManualLayerTool from "./ManualLayerTool.vue";
import useArrowKeysListener from "@/packages/utils/arrowKeysListenerHook";
import {
  saveSurface,
  cancelSaveSurface,
  stashEditSurface,
  clearSurfaceMat
} from "@/utils/tools/segmentation/manualLayer";
import { useManualLayerToolStoreHook } from "../store/manualLayerTool";
import { isAnteriorScan, isStarScanData, isCubeScan } from "@/utils/protocol";
import { useRoute } from "vue-router";
import { ModalEnum, useEventTracker } from "@/event-tracking";

defineOptions({
  name: "EditLayerDialog"
});

interface Props {
  dlgVisible: boolean;
  bscanType: string;
}
const props = defineProps<Props>();

const analysisCommonStore = useAnalysisCommonStoreHook();
const editLayersStore = useEditLayersStoreHook();
const contextmenuStore = useContextmenuStoreHook();
const manualLayerToolStore = useManualLayerToolStoreHook();

const closeDlgVisible = ref(false);
const digOpenedSucess = ref(false);
const dlgZIndex = ref<number>();

const emits = defineEmits(["closeDig"]);

useArrowKeysListener(editLayersStore.commitCrosshairPosition);

watch(
  () => props.dlgVisible,
  (val: boolean) => {
    if (val) {
      editLayersStore.initEditLayerDigInfo();
      contextmenuStore.resetEditLayerMenus();
    } else {
      editLayersStore.syncCrosshairPosition();
      editLayersStore.$reset();
      // contextmenuStore.$reset();
      manualLayerToolStore.$reset();
      digOpenedSucess.value = false;
    }
    clearSurfaceMat();
  }
);

const isAS = computed(() => isAnteriorScan(analysisCommonStore.protocolName));

const isAsLineScan = computed(
  () => isAS.value && !isCubeScan(analysisCommonStore.protocolName)
);

const ratioFactor = computed(() => (isAS.value ? 1 : 0.4));

const isStarScan = computed(() =>
  isStarScanData(analysisCommonStore.protocolName)
);

const onDlgOpen = async () => {
  // Adjust the z-index when bscan stays full screen
  const dialogOverlayElement = document.querySelector(
    ".el-overlay"
  ) as HTMLElement;
  const fullscreenEle = document.querySelector(".full-screen") as HTMLElement;
  if (dialogOverlayElement && fullscreenEle) {
    dlgZIndex.value = 999;
  }
};

const currentRoute = useRoute();
const { triggerModalEvent } = useEventTracker();
const onOpenedDig = () => {
  triggerModalEvent(currentRoute, ModalEnum.EditLayer, 1);
  digOpenedSucess.value = true;
  onDlgOpen();
};

const onCloseDig = () => {
  triggerModalEvent(currentRoute, ModalEnum.EditLayer, 0);
  if (!editLayersStore.isCloseDlgVisible) {
    if (editLayersStore.hasSavedCount > 0) {
      editLayersStore.updateLayer();
    }
    editLayersStore.setEditLayerDigVisible(false);
  } else {
    closeDlgVisible.value = true;
  }
};

const handleCloseConfirm = async () => {
  await saveSurface();
  editLayersStore.updateLayer();
  // 是--保存分层数据关闭弹窗
  editLayersStore.setEditLayerDigVisible(false);
  closeDlgVisible.value = false;
};
const handleCloseCancel = async () => {
  await cancelSaveSurface({ fresh: false });
  // 否--直接关闭编辑分层弹窗
  editLayersStore.setEditLayerDigVisible(false);
  closeDlgVisible.value = false;
};
const onEditLayer = () => {
  //
  editLayersStore.setEditStatus(true);
};
const onDragLayer = () => {
  //
  editLayersStore.setEditStatus(false);
};
const onZoomLayer = () => {
  //
  editLayersStore.setEditStatus(false);
};
const onFullScreenLayer = (val: boolean) => {
  if (val) {
    document.querySelector(".layer-edit-main")?.classList.add("full-screen");
    return;
  }

  document.querySelector(".layer-edit-main")?.classList.remove("full-screen");
};
const onConfirmLayer = async () => {
  await stashEditSurface();
};
</script>

<style lang="scss" scoped>
$card-header-bg-color: #2e2e2f;

.layer-edit-container {
  // height: 810px;
  height: calc(100vh - 288px);
  overflow: hidden;
  user-select: none;
  background: $page-bg-color;

  .layer-edit-left {
    display: flex;
    height: 100%;
    padding: 0;
    border-right: 1px solid $divide-dark-color;
  }

  .layer-edit-main {
    padding: 0;
    background-color: $image-bg-color;
    border-top: 1px solid $divide-light-color;

    .manual-bscan {
      border: 1px solid $image-green;
    }
  }

  .layer-edit-right {
    padding-top: 4px;
    color: $font-main-color;
    border-left: 1px solid $divide-dark-color;
  }
}

.dlg-loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2012;
  display: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: $card-header-bg-color;
  opacity: 0.4;

  .mask-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .msg {
      margin-top: 15px;
      color: #e2e2e2;
    }
  }
}
</style>
