<template>
  <div class="manual-layers-settings">
    <div class="manual-layers-settings__content top">
      <div class="manual-layers-settings__item">
        <span class="label">{{ $t("analysis.showAllLines") }}</span>
        <el-switch v-model="editLayersStore.showAllLines" />
      </div>
      <div class="manual-layers-settings__item">
        <span class="label">{{ $t("analysis.showEditLine") }}</span>
        <el-switch v-model="editLayersStore.showEditLine" />
      </div>
    </div>

    <div class="manual-layers-settings__content middle">
      <div class="manual-layers-settings__item seperate-label">
        <span class="label">{{ $t("analysis.editedLayer") }}</span>
        <el-radio-group v-model="settingForm.editSurface">
          <el-radio
            class="manual-layers-settings__radio"
            v-for="item in editSurfaceList"
            :label="item.value"
            :key="item.value"
            :disabled="!enableEditSurface(item.value)"
          >
            {{ $t(item.labelKey) }}
          </el-radio>
        </el-radio-group>
      </div>
      <div
        class="manual-layers-settings__item seperate-label"
        v-if="!isPosteriorLineScan && !isAsLineScan"
      >
        <span class="label">{{ $t("analysis.refLayer") }}</span>
        <el-select
          v-model="settingForm.refSurface"
          :disabled="disableRefSurface"
        >
          <el-option
            v-for="item in refSurfaceList"
            :key="item.value"
            :value="item.value"
            :label="$t(item.labelKey)"
          />
        </el-select>
      </div>
    </div>

    <div class="manual-layers-settings__content bottom">
      <div>
        <div class="manual-layers-settings__item">
          <span class="label">{{ $t("analysis.editBscan") }}</span>
          <div class="ajust-btn-group">
            <el-button
              class="layer-adjust-btn add"
              :icon="ArrowUp"
              plain
              :disabled="editLayersStore.toggleEditedScanButtonDisabled"
              @click="handleChangeBscanChange(false)"
            />
            <el-button
              class="layer-adjust-btn minus"
              :icon="ArrowDown"
              :disabled="editLayersStore.toggleEditedScanButtonDisabled"
              plain
              @click="handleChangeBscanChange(true)"
            />
          </div>
        </div>
        <div class="manual-layers-settings__item">
          <span class="label">{{ $t("analysis.resetAll") }}</span>
          <el-button
            class="layer-adjust-btn reset"
            :icon="RefreshLeft"
            plain
            @click="handleResetAllEdit"
          />
        </div>
      </div>
      <div class="manual-layers-settings__btns">
        <div class="manual-layers-settings__item">
          <el-button
            class="layer-adjust-btn cancel"
            :disabled="editLayersStore.cancelStashButtonDisabled"
            @click="handleCancelEdit"
          >
            {{ $t("common.cancelText") }}
          </el-button>
        </div>
        <div class="manual-layers-settings__item">
          <el-button
            type="primary"
            class="layer-adjust-btn save"
            :disabled="editLayersStore.saveButtonDisabled"
            @click="handleSaveEdit"
          >
            {{ $t("common.saveText") }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
  <ConfirmDialog
    :visible="cancelDlgVisible"
    :message="$t('analysis.cancelDigText')"
    :confirm-label-text="$t('common.yes')"
    :cancel-label-text="$t('common.no')"
    @confirm="handleCancelConfirm"
    @cancel="handleCancelCancel"
  />
  <ConfirmDialog
    :visible="resetDlgVisible"
    :message="$t('analysis.resetAllDigText')"
    :confirm-label-text="$t('common.yes')"
    :cancel-label-text="$t('common.no')"
    @confirm="handleResetConfirm"
    @cancel="handleResetCancel"
  />
</template>
<script lang="ts" setup>
import { ArrowUp, ArrowDown, RefreshLeft } from "@element-plus/icons-vue";
import {
  POSTERIOR_SURFACE_LIST,
  AS_SURFACE_LIST,
  AS_LINE_SURFACE_LIST,
  PosteriorSurfaceEnum,
  AnteriorSurfaceEnum
} from "@/utils/constant";
import { useEditLayersStoreHook } from "../store/editLayers";
import {
  resetSurface,
  saveSurface,
  cancelSaveSurface,
  stashFetch,
  setSlowShowLines,
  setSlowRefHighlight,
  drawAllSlowPosteriorSurface,
  showSlowEditLine,
  stashEditSurface,
  pullSurface
} from "@/utils/tools/segmentation/manualLayer";
import {
  drawAllFastPosteriorSurface,
  setFastShowLines,
  setFastRefHighlight,
  showFastEditLine,
  mask
} from "@/utils/tools/segmentation/drawAllFastSeg";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import * as Protocol from "@/utils/protocol";

const editLayersStore = useEditLayersStoreHook();
const analysisCommonStore = useAnalysisCommonStoreHook();

const cancelDlgVisible = ref(false);
const resetDlgVisible = ref(false);
let settingForm = reactive({
  editSurface: "",
  refSurface: ""
});

const isAS = computed(() =>
  Protocol.isAnteriorScan(analysisCommonStore.protocolName)
);

const editSurfaceList = computed(() => {
  const { protocolName } = analysisCommonStore;
  return isAS.value
    ? Protocol.isCubeScan(protocolName)
      ? AS_SURFACE_LIST
      : AS_LINE_SURFACE_LIST
    : POSTERIOR_SURFACE_LIST;
});

const refSurfaceList = computed(() => {
  return isAS.value
    ? AS_LINE_SURFACE_LIST
    : POSTERIOR_SURFACE_LIST.filter(
        option => option.value !== PosteriorSurfaceEnum.RPEBM
      );
});

const disableRefSurface = computed(
  () => settingForm.editSurface === PosteriorSurfaceEnum.RPEBM || isAS.value
);

const isPosteriorLineScan = computed(
  () =>
    !isAS.value && Protocol.isLineScanProtocol(analysisCommonStore.protocolName)
);

const isAsLineScan = computed(
  () => isAS.value && !Protocol.isCubeScan(analysisCommonStore.protocolName)
);

const isAsCubeScan = computed(
  () => isAS.value && Protocol.isCubeScan(analysisCommonStore.protocolName)
);

const enableEditSurface = computed(() => (surface: string) => {
  if (isAS.value && !editLayersStore.maskLoading) {
    const slowSurfaceMask = mask.as?.dim_slow;
    let res = false;
    if (!slowSurfaceMask) return res;
    for (let i = 0; i < slowSurfaceMask.length; i++) {
      const bscanSegArea = slowSurfaceMask[i];
      // 当存在有效区域时,需要enbale此分层
      if (bscanSegArea[surface] && bscanSegArea[surface].length > 0) {
        res = true;
        break;
      }
    }
    return res;
  } else {
    return true;
  }
});

watch(
  () => settingForm.editSurface,
  async val => {
    if (window.anchors.length !== 0) {
      const editLayersStore = useEditLayersStoreHook();
      editLayersStore.setDialogLoading(true);
      // 存在锚点时，先暂存，再把新的选中值赋值给store，顺序一定不能反
      await stashFetch();
      editLayersStore.setLastManualOperationType("stash");
      await pullSurface();
      editLayersStore.setDialogLoading(false);
    }
    if (isAsCubeScan.value) {
      editLayersStore.setAsRefByEditSurf(val);
    } else if (!isPosteriorLineScan.value) {
      editLayersStore.setRefByEditSurf(val);
    }
    editLayersStore.editSurface = val;
    settingForm.refSurface = editLayersStore.refSurface;
    editLayersStore.surfaceLoading = false;
    drawAllSlowPosteriorSurface();
    drawAllFastPosteriorSurface();
  }
);
watch(
  () => settingForm.refSurface,
  async val => {
    editLayersStore.refSurface = val;
  }
);
watch(
  () => editLayersStore.refSurface,
  value => {
    setSlowRefHighlight();
    setFastRefHighlight();
  }
);

watch(
  () => editLayersStore.showAllLines,
  async value => {
    setSlowShowLines();
    setFastShowLines();
  }
);

watch(
  () => editLayersStore.showEditLine,
  value => {
    showSlowEditLine();
    showFastEditLine();
  }
);

function findClosest(arr: number[], x: number) {
  // 初始化最近的比 x 小的数和比 x 大的数
  let smaller = null;
  let larger = null;

  // 遍历数组，找到比 x 小的最大数和比 x 大的最小数
  for (let num of arr) {
    if (num < x) {
      smaller = num;
    } else if (num > x) {
      larger = num;
      break; // 找到第一个比 x 大的数后可以直接退出循环
    }
  }

  return { smaller, larger };
}

// 切换bscan slice, 分层线变化
const handleChangeBscanChange = async (down?: boolean) => {
  const { bscanIndex, frameHistory } = editLayersStore;
  if (!(window.anchors.length === 0) || editLayersStore.isAsBorderEdit) {
    await stashEditSurface();
  }
  const { smaller, larger } = findClosest(frameHistory, bscanIndex);
  if (!down && smaller !== null) {
    editLayersStore.commitCrosshairPosition({ y: smaller });
  } else if (down && larger !== null) {
    editLayersStore.commitCrosshairPosition({ y: larger });
  }
};
const handleResetAllEdit = () => {
  // 恢复到初始状态
  resetDlgVisible.value = true;
};
const handleResetConfirm = async () => {
  // 展示进度条，恢复到打开弹窗的初始状态
  resetDlgVisible.value = false;
  await resetSurface();
};
const handleResetCancel = (value: boolean) => {
  resetDlgVisible.value = false;
};
const handleCancelEdit = () => {
  // 取消
  cancelDlgVisible.value = true;
};
const handleCancelConfirm = async () => {
  // 取消上次保存之后的所有编辑
  cancelDlgVisible.value = false;
  await cancelSaveSurface({ fresh: true });
};
const handleCancelCancel = () => {
  //
  cancelDlgVisible.value = false;
};
const handleSaveEdit = async () => {
  // 保存, 不关闭弹窗，需要展示进度条
  const maskDom = document.getElementById("dlg-loading-mask") as HTMLElement;
  await saveSurface();
  // maskDom && (maskDom.style.display = "flex");
  // maskDom && (maskDom.style.display = "none");
};

onMounted(() => {
  if (editLayersStore.showEditLayerDig) {
    // 初始化编辑层、参考层
    const { editSurface, refSurface } = editLayersStore;
    settingForm.editSurface = editSurface;
    settingForm.refSurface = refSurface;
  }
});
</script>

<style lang="scss" scoped>
.manual-layers-settings {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.manual-layers-settings__btns {
  position: absolute;
  bottom: 12px;
}

.manual-layers-settings__radio {
  width: 100%;
}

.manual-layers-settings__content {
  padding-top: 12px;
  border-bottom: 1px solid $divide-dark-color;

  &.top {
    height: 84px;
  }

  &.middle {
    max-height: 420px;
    overflow-y: auto;
  }

  &.bottom {
    display: flex;
    flex-direction: column;
    align-content: space-between;
    min-height: 216px;
    border: none;

    .manual-layers-settings__item {
      margin-bottom: 12px;
    }
  }
}

.manual-layers-settings__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;

  &.seperate-label {
    flex-direction: column;
    align-items: start;
    margin-bottom: 12px;

    .label {
      margin-bottom: 5px;
    }
  }
}

.layer-adjust-btn {
  width: 28px;
  padding: 0 5px;
  font-size: 18px;
  color: $font-main-color;

  &.add {
    margin-left: 8px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &.minus {
    margin-left: 1px;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &.reset {
    width: 57px;
  }

  &.save,
  &.cancel {
    width: 190px;
    font-size: 16px;
  }

  &.is-disabled {
    color: rgb(255 255 255 / 12%);
    background: rgb(255 255 255 / 12%);
  }
}
</style>
