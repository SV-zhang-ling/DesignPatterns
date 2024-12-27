<template>
  <div class="operation-container">
    <section class="left-area">
      <section class="sec add-user-sec">
        <icon-svg name="add-user" class="add-user-icon" />
        <div class="add-user-label">{{ $t("patient.new") }}</div>
      </section>
      <section class="sec search-sec">
        <el-form class="search-params" :model="patientStore.queryParams">
          <div class="search-keyword">
            <el-select
              v-model="patientStore.queryParams.searchBy"
              :placeholder="$t('common.selectTip')"
              class="searchBy-select"
              filterable
            >
              <el-option
                v-for="item in SEARCH_BY_LIST"
                :key="item.value"
                :label="$t(item.labelKey)"
                :value="item.value"
              />
            </el-select>
            <el-input
              v-model="patientStore.queryParams.keyword"
              :placeholder="$t('common.inputTip')"
              @keyup.enter="handleSearch"
            />
          </div>
          <div class="date-range">
            <el-date-picker
              v-model="patientStore.queryParams.startDate"
              type="date"
              :format="getDateStandardFormat(true, true)"
              :placeholder="$t('patient.startDate')"
              :clearable="false"
              :value-format="DATE_VALUE_FORMAT"
              :disabled-date="disabledStartDate"
            />
            <div class="date-picker-seperator"></div>
            <el-date-picker
              v-model="patientStore.queryParams.endDate"
              type="date"
              :format="getDateStandardFormat(true, true)"
              :placeholder="$t('patient.endDate')"
              :clearable="false"
              :value-format="DATE_VALUE_FORMAT"
              :disabled-date="disabledEndDate"
            />
          </div>
        </el-form>
        <el-button class="search-btn" @click="handleSearch">
          <icon-svg name="search" class="search-icon" />
        </el-button>
      </section>
      <section class="sec jump-sec">
        <!-- 暂不做
        <div class="jump-item capture">
          <icon-svg name="camera" />
          <div class="jump-item__label">{{ $t("patient.capture") }}</div>
        </div> -->
        <AnalysisDropdownSel />
        <!-- 暂不做
        <div class="jump-item solution">
          <icon-svg name="solution" />
          <div class="jump-item__label">{{ $t("patient.solution") }}</div>
        </div> -->
      </section>
    </section>
    <section class="right-area">
      <icon-svg name="company-logo" />
    </section>
  </div>
</template>

<script setup lang="ts">
import AnalysisDropdownSel from "@/views/components/AnalysisDropdownSel.vue";
import { timestamp, debounce } from "xe-utils";
import { ORIGIN_DATE_FORMAT } from "@/utils/constant";
import { SEARCH_BY_LIST } from "../utils";
import { usePatientStoreHook } from "../store/patient";
import { getDateStandardFormat } from "@/utils/index";

defineOptions({
  name: "OperationView"
});

const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";
const DATE_VALUE_FORMAT = "YYYYMMDD";

const patientStore = usePatientStoreHook();

// start date <= end date
const disabledStartDate = (date: Date) =>
  timestamp(date, ORIGIN_DATE_FORMAT) >
  timestamp(patientStore.queryParams.endDate, ORIGIN_DATE_FORMAT);

// end date <= today
const disabledEndDate = (date: Date) => {
  const dateTimestamp = date.getTime();
  return (
    dateTimestamp > Date.now() ||
    dateTimestamp <
      timestamp(patientStore.queryParams.startDate, ORIGIN_DATE_FORMAT)
  );
};

const emit = defineEmits(["search"]);

// search cliced
// 防止多次连续点击频繁触发
const handleSearch = debounce(() => {
  emit("search");
}, 500);
</script>
<style lang="scss" scoped>
.operation-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84px;
  border-bottom: 1px solid $divide-dark-color;
}

.left-area {
  display: flex;
}

.right-area {
  padding-right: 16px;
}

.sec {
  border-right: 1px solid $divide-dark-color;
}

.add-user-sec {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 84px;
  padding-top: 16px;
  cursor: pointer;

  .add-user-label {
    margin-top: 8px;
  }
}

.search-sec {
  display: flex;
  width: 400px;
  padding: 12px;
}

.search-params {
  :deep(.el-select) {
    width: 148px;

    .el-select__wrapper {
      width: 148px;
      height: 28px;
      min-height: 28px;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  .search-keyword {
    display: flex;
    align-items: center;
  }

  .date-picker-seperator {
    width: 16px;
    margin: 0 8px;
    border: 1px solid $font-tip-color;
  }

  :deep(.el-input__wrapper) {
    width: 184px;
    padding: 0 11px;
    border: none;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    .el-input__inner {
      height: 28px;
    }
  }

  .date-range {
    display: flex;
    align-items: center;
    margin-top: 5px;

    .date-picker {
      width: 150px;
      height: 28px;
    }

    :deep(.el-date-editor) {
      width: 150px;
      height: 28px;
    }
  }
}

.search-btn {
  width: 40px;
  height: 60px;
  padding: 0;
  margin-left: 4px;
  background: rgb(255 255 255 / 12%);
}

.jump-sec {
  // display: flex;
}
</style>
