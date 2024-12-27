<template>
  <sv-dialog
    :visible="visible"
    v-bind="$attrs"
    width="448"
    :title="$t('common.modifyCapture')"
    class="modify-capture-dialog"
    :okLabelText="$t('common.saveText')"
    :cancelLabelText="$t('common.cancelText')"
    @ok="handleOK"
    @cancel="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="form"
      class="capture-form"
      label-position="right"
      label-width="120"
    >
      <el-form-item :label="$t('patient.time')">
        {{ toDateString(record?.Time, getDateStandardFormat()) }}
      </el-form-item>
      <el-form-item :label="$t('patient.oculus')">
        {{ record?.Oculus }}
      </el-form-item>
      <el-form-item :label="$t('patient.protocol')" :title="record?.Protocol">
        {{ record?.Protocol }}
      </el-form-item>
      <el-form-item :label="$t('patient.length')" v-if="!isMosaic">
        {{ length }}
      </el-form-item>
      <el-form-item :label="$t('patient.depth')" v-if="!isMosaic">
        {{ depth }}
      </el-form-item>
      <el-form-item :label="$t('patient.ssi')" v-if="!isMosaic">
        {{ record?.SSI }}
      </el-form-item>
      <el-form-item :label="$t('patient.operator')" :title="record?.Operator">
        {{ record?.Operator || "--" }}
      </el-form-item>
      <el-form-item :label="$t('patient.softwareVersion')">
        {{ record?.SW }}
      </el-form-item>
      <el-form-item :label="$t('patient.comment')" prop="comment">
        <el-input
          v-model="form.comment"
          class="comment-area"
          type="textarea"
          rows="4"
          resize="none"
          :placeholder="$t('common.inputTip')"
        />
      </el-form-item>
      <!-- <el-form-item :label="$t('patient.qs')">
        {{ record?.QS }}
      </el-form-item> -->
      <!-- <el-form-item prop="comment" label-width="0">
        <el-select
          v-model="form.comment"
          class="comment-select"
          :placeholder="$t('common.inputOrSelect')"
          filterable
          allow-create
        >
          <el-option
            v-for="item in COMMENT_LIST"
            :key="item.value"
            :label="$t(item.labelKey)"
            :value="item.value"
          />
        </el-select>
      </el-form-item> -->
    </el-form>
  </sv-dialog>
</template>

<script setup lang="ts">
import { toDateString } from "xe-utils";
// import { COMMENT_LIST } from "@/utils/constant";
import { TARGET_DATETIME_FORMAT } from "@/utils/constant";
import { isAnteriorScan, isMosaicProtocol } from "@/utils/protocol";
import { useCaptureStore } from "../patient/store/capture";
import { useAnalysisCommonStoreHook } from "../analysis/store/analysisCommon";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { CaptureType } from "../patient/utils/patient";
import { VueI18n } from "@/locales/i18n";
import router from "@/router";
import { PageRoute } from "@/utils/route";
import { getDateStandardFormat } from "@/utils/index";

defineOptions({
  name: "ModifyCaptureDialog"
});

interface Props {
  visible: boolean;
  record?: CaptureType;
}

export interface ModifyPatientForm {
  comment?: string;
}

const props = defineProps<Props>();

const form = reactive<ModifyPatientForm>({
  comment: ""
});
const formRef = ref();
const analysisCommonStore = useAnalysisCommonStoreHook();
const captureStore = useCaptureStore();
const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();

watch(
  () => props.visible,
  () => {
    form.comment = props.record?.Comment ?? "";
  }
);

const isMosaic = computed(() =>
  isMosaicProtocol(analysisCommonStore.protocolName)
);

const length = computed(() => {
  let lineScanLength = analysisCommonStore.lineScanLength_mm
    ? Number(analysisCommonStore.lineScanLength_mm).toFixed(2)
    : analysisCommonStore.lineScanLength_mm;

  if (
    [PageRoute.MultipleAngio, PageRoute.MultipleLineScan].includes(
      router.currentRoute.value.path
    )
  ) {
    // multiple data
    lineScanLength = analysisMultipleCommonStore.activeCaptureCard
      ?.lineScanLength_mm
      ? Number(
          analysisMultipleCommonStore.activeCaptureCard?.lineScanLength_mm
        ).toFixed(2)
      : analysisMultipleCommonStore.activeCaptureCard?.lineScanLength_mm;
    return lineScanLength ? `${lineScanLength} mm` : "--";
  }

  return lineScanLength ? `${lineScanLength} mm` : "--";
});

const depth = computed(() => {
  if (
    [PageRoute.MultipleAngio, PageRoute.MultipleLineScan].includes(
      router.currentRoute.value.path
    )
  ) {
    return analysisMultipleCommonStore.activeCaptureCard?.depth_mm
      ? `${analysisMultipleCommonStore.activeCaptureCard.depth_mm} mm`
      : "--";
  }
  return analysisCommonStore.depth_mm
    ? `${analysisCommonStore.depth_mm} mm${
        isAnteriorScan(captureStore.activeCaptureData?.Protocol)
          ? `(${VueI18n("patient.inAir")})`
          : ""
      }`
    : "--";
});

const emits = defineEmits(["ok", "cancel"]);

const handleOK = () => {
  emits("ok", form.comment, props.record?.captureKey);
  resetFields();
};

const handleCancel = () => {
  resetFields();
  emits("cancel");
};

const resetFields = () => {
  form.comment = "";
};
</script>

<style lang="scss" scoped>
.modify-capture-dialog {
  .capture-form {
    width: 100%;
    padding: 0 20px;
  }

  .el-form-item {
    margin-bottom: 0;

    :deep(.el-form-item__label) {
      font-size: 15px;
      color: rgb(255 255 255 / 50%);
    }

    :deep(.el-form-item__content) {
      display: inline-block;
      width: 100%;
      overflow: hidden;
      font-size: 15px;
      color: $font-main-color;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
