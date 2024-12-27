<template>
  <sv-dialog
    :visible="visible"
    v-bind="$attrs"
    width="448"
    :title="$t('common.modifyPatient')"
    class="modify-patient-dialog"
    :okLabelText="$t('common.saveText')"
    :cancelLabelText="$t('common.cancelText')"
    @ok="handleOK"
    @cancel="handleCancel"
  >
    <el-form
      ref="formRef"
      :model="form"
      class="patient-form"
      label-position="right"
      label-width="120"
    >
      <el-form-item :label="$t('patient.patientID')" :title="record?.ID">
        {{ record?.ID }}
      </el-form-item>
      <el-form-item :label="$t('patient.name')" :title="record?.Name">
        {{ record?.Name }}
      </el-form-item>
      <el-form-item :label="$t('patient.dateofbirth')">
        {{ toDateString(record?.DateofBirth, getDateStandardFormat(true)) }}
      </el-form-item>
      <el-form-item :label="$t('patient.gender')">
        {{ $t(`common.${record?.Gender}`) }}
      </el-form-item>
      <el-form-item :label="$t('patient.physician')" :title="record?.Physician">
        {{ record?.Physician || "--" }}
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
import { TARGET_DATE_FORMAT } from "@/utils/constant";
import { PatientType } from "../patient/utils/patient";
import { getDateStandardFormat } from "@/utils/index";

defineOptions({
  name: "ModifyPatientDialog"
});

interface Props {
  visible: boolean;
  record?: PatientType;
}

const props = defineProps<Props>();

export interface ModifyPatientForm {
  comment?: string;
}

const form = reactive<ModifyPatientForm>({
  comment: ""
});

watch(
  () => props.visible,
  () => {
    form.comment = props.record?.Comment ?? "";
  }
);
const formRef = ref();

const emits = defineEmits(["ok", "cancel"]);

const handleOK = () => {
  emits("ok", form.comment);
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
.modify-patient-dialog {
  .patient-form {
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
