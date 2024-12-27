<template>
  <div class="basic-info">
    <section class="left-area">
      <section class="sec patient-link-sec" @click="handleBackToPA">
        <icon-svg name="patient-link" class="patient-icon" />
        <div class="label">{{ $t("patient.patient") }}</div>
      </section>
      <section class="sec patient-info-sec">
        <div class="name-row">
          <span class="name" :title="patientStore.activePatient?.Name">
            {{ patientStore.activePatient?.Name }}
          </span>
          <icon-svg
            v-if="hasActivePatient"
            name="edit"
            class="edit-icon"
            @click="handleModifyPatient"
          />
        </div>
        <div class="other-info-row">
          {{ otherPatientInfo }}
        </div>
      </section>
      <section class="sec jump-sec">
        <!-- 暂不做
        <div class="jump-item capture">
          <icon-svg name="camera" />
          <div class="jump-item__label">{{ $t("patient.capture") }}</div>
        </div> -->
        <AnalysisDropdownSel :active="true" />
        <!-- 暂不做
        <div class="jump-item solution">
          <icon-svg name="solution" />
          <div class="jump-item__label">{{ $t("patient.solution") }}</div>
        </div> -->
      </section>
      <section class="sec data-mode-sec">
        <div class="data-mode-container">
          <span
            v-for="mode in ANALYSIS_MODE_LIST"
            :key="mode"
            :class="modeClass(mode)"
            @click="handleModeClick(mode)"
          >
            {{ $t(`analysis.${mode}`) }}
          </span>
        </div>
      </section>
      <section class="sec report-sec" @click="handleReport">
        <icon-svg name="report" class="patient-icon" />
        <div class="label">{{ $t("analysis.report") }}</div>
      </section>
      <section
        class="sec import-export-sec"
        v-if="captureStore.activeCaptureData.Protocol"
      >
        <div class="row top-row">
          <div class="element screenshot">
            <icon-svg name="screenshot" @click="handleScreenshot" />
            <span class="element-label" @click="handleScreenshot">
              {{ $t("analysis.screenshot") }}
            </span>
          </div>
        </div>
        <div class="row bottom-row">
          <div
            class="element select-data"
            v-show="showSelectData"
            @click="showSelectDataDlg"
          >
            <icon-svg name="select-data" />
            <span class="element-label">{{ $t("analysis.selectData") }}</span>
          </div>
          <div
            class="element save-angio"
            v-if="showSaveAngioImages"
            @click="handleSaveImages"
          >
            <icon-svg name="save-angio" />
            <span class="element-label">{{ $t("analysis.saveAngio") }}</span>
          </div>
          <div
            class="element quantization disabled"
            v-if="showExportQuantization"
          >
            <icon-svg name="quantization" />
            <span class="element-label">{{ $t("analysis.quantization") }}</span>
          </div>
          <div
            class="element save-oct"
            v-if="showSaveOCTImages"
            @click="handleSaveImages"
          >
            <icon-svg name="save-angio" />
            <span class="element-label">
              {{ $t("analysis.saveOCTImages") }}
            </span>
          </div>
        </div>
      </section>
      <section
        class="sec synchronize-sec"
        v-if="showSelectData && route.query.m === AnalysisModeEnum.Change"
      >
        <div class="row top-row">
          <div class="element synchronize">
            <el-checkbox
              :model-value="basicInfoStore.isSynchronize"
              @change="handleSyncValueChange(basicInfoStore.isSynchronize)"
            />
            <el-dropdown
              placement="bottom-start"
              trigger="click"
              @command="handleSyncChange"
            >
              <span class="element-label el-dropdown-link">
                <div class="jump-item__label">
                  {{ $t("analysis.synchronize") }}
                </div>
                <div class="jump-item__icon">
                  <icon-svg name="downarrow" />
                </div>
              </span>
              <template #dropdown>
                <el-dropdown-menu class="synchronize-dropdown__menu">
                  <el-dropdown-item
                    class="sync-item"
                    v-for="item in synchronizeItemList"
                    :key="item.type"
                    :command="item"
                  >
                    <icon-svg v-show="item.checked" name="check-active" />
                    <span class="menu-label">{{ item.label }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </section>
    </section>
    <section class="right-area">
      <icon-svg name="company-logo" />
    </section>
  </div>
  <ModifyPatientDialog
    :visible="modifyPatientDlgVisible"
    :record="patientStore.activePatient"
    @ok="handleModifyPatientOK"
    @cancel="handleModifyPatientCancel"
  />
  <SelectDataDialog
    :dlgVisible="selectDataDlgVisible"
    :record="patientStore.activePatient"
    @okSelect="handleSelectDataOK"
    @cancelSelect="handleSelectDataCancel"
  />
  <ReportPrintDialog
    :dlgVisible="reportPrintStore.reportDlgVisible"
    @close="handleReportDlgClose"
  />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ElNotification } from "element-plus";
import { VueI18n } from "@/locales/i18n";
import router from "@/router";
import { PageRoute } from "@/utils/route";
import ModifyPatientDialog from "@/views/components/ModifyPatientDialog.vue";
import SelectDataDialog from "../components/SelectDataDialog.vue";
import AnalysisDropdownSel from "@/views/components/AnalysisDropdownSel.vue";
import { toDateString } from "xe-utils";
import { GenderEnum, AnalysisModeEnum, SynchronizeType } from "@/enums";
import { usePatientStoreHook } from "@/views/patient/store/patient";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { useBasicInfoStoreHook } from "./store/basicInfo";
import { useSelectDataStoreHook } from "./store/selectData";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { useAnalysisSelStoreHook } from "@/views/components/store/analysisSel";
import { getAnalysisListByMode } from "@/utils";
import { analysisScreenshot } from "@/utils/tools/screenshot";
import ReportPrintDialog from "../components/ReportPrintDialog.vue";
import { useReportPrintStoreHook } from "@/views/analysis/components/store/report";
import { useMeasureCommonStore } from "@/views/analysis/store/measureCommon";
import { downloadMultiImages } from "@/utils/image";
import { getDateStandardFormat } from "@/utils/index";

interface SynchronizeItem {
  type: SynchronizeType;
  checked: boolean;
  label: string;
  visible: boolean;
}

const ANALYSIS_MODE_LIST = [
  AnalysisModeEnum.Single,
  AnalysisModeEnum.OU,
  AnalysisModeEnum.Change
];

const ChangeSynchronizeItemList: SynchronizeItem[] = [
  // {
  //   type: SynchronizeType.ZoomAndMoveSync,
  //   checked: true,
  //   label: VueI18n("common.zommAndMove")
  // },
  {
    type: SynchronizeType.xAxisLinkage,
    checked: true,
    label: VueI18n("common.xAxisLinkage"),
    visible: false
  },
  {
    type: SynchronizeType.yAxisLinkage,
    checked: true,
    label: VueI18n("common.yAxisLinkage"),
    visible: true
  }
  // {
  //   type: SynchronizeType.bcAdjustment,
  //   checked: true,
  //   label: VueI18n("common.bcAjust"),
  //   visible: true
  // }
  // {
  //   type: SynchronizeType.ColorMode,
  //   checked: true,
  //   label: VueI18n("common.colorMode"),
  //   visible: true
  // }
  // { 暂不做
  //   type: "5",
  //   checked: false,
  //   label: "测量" // VueI18n("common.color")
  // }
];
const OuSynchronizeItemList: SynchronizeItem[] = [
  // {
  //   type: SynchronizeType.ZoomAndMoveSync,
  //   checked: true,
  //   label: VueI18n("common.zommAndMove")
  // },
  // {
  //   type: SynchronizeType.bcAdjustment,
  //   checked: true,
  //   label: VueI18n("common.bcAjust"), // VueI18n("common.yAxis")
  //   visible: true
  // }
  {
    type: SynchronizeType.ColorMode,
    checked: true,
    label: VueI18n("common.colorMode"),
    visible: true
  }
  // { 暂不做
  //   type: "5",
  //   checked: false,
  //   label: "测量" // VueI18n("common.color")
  // }
];

const synchronizeItemList = ref<SynchronizeItem[]>([
  ...ChangeSynchronizeItemList
]);

const route = useRoute();

const patientStore = usePatientStoreHook();
const captureStore = useCaptureStoreHook();
const basicInfoStore = useBasicInfoStoreHook();
const selectDataStore = useSelectDataStoreHook();
const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
const analysisSelStore = useAnalysisSelStoreHook();
const reportPrintStore = useReportPrintStoreHook();
const measureCommonStore = useMeasureCommonStore();

const hasActivePatient = computed(
  () => patientStore.activePatient && patientStore.activePatient.ID
);

const otherPatientInfo = computed(() => {
  if (!hasActivePatient.value) {
    return "";
  }

  const { Gender } = patientStore.activePatient;
  const gender =
    Gender === GenderEnum.Male
      ? "M"
      : Gender === GenderEnum.Female
      ? "F"
      : Gender;
  const birthday = patientStore.activePatient?.DateofBirth
    ? toDateString(
        patientStore.activePatient.DateofBirth,
        getDateStandardFormat(true)
      )
    : "";
  const comment = patientStore.activePatient?.Comment
    ? `, ${patientStore.activePatient?.Comment}`
    : "";

  return `${VueI18n(`common.${gender}`)}, ${birthday}${comment}`;
});

const showExportQuantization = computed(() => {
  // const { path } = route;
  return false;
  // [
  //   PageRoute.Angiography,
  //   PageRoute.AdvancedSeg,
  //   PageRoute.MultipleAngio,
  //   PageRoute.AngioRetinaEnhanced
  // ].includes(path);
});

const showSaveAngioImages = computed(() => {
  const { path } = route;
  return [
    PageRoute.MultipleAngio,
    PageRoute.Angiography,
    PageRoute.AngioRetinaEnhanced,
    PageRoute.Mosaic,
    PageRoute.MosaicAngioRetinaEnhanced
  ].includes(path);
});

const showSaveOCTImages = computed(() => {
  const { path } = route;
  return [
    PageRoute.StructuralProjection,
    PageRoute.MosaicStructuralProj
  ].includes(path);
});

const showSelectData = computed(() => route.path.includes("multiple"));

const modeClass = computed(() => {
  return (mode: AnalysisModeEnum) => [
    "mode-item",
    "single",
    mode === basicInfoStore.analysisMode ? "active" : "",
    (mode === AnalysisModeEnum.OU || mode === AnalysisModeEnum.Change) &&
    !hasOUChange.value
      ? "disabled"
      : ""
  ];
});

const multipleAnalysisList = computed(() =>
  getAnalysisListByMode(
    captureStore.activeCaptureData.Protocol,
    AnalysisModeEnum.OU
  )
);

const hasOUChange = computed(
  () => multipleAnalysisList.value && multipleAnalysisList.value.length
);

const modifyPatientDlgVisible = ref<boolean>(false);
const selectDataDlgVisible = ref<boolean>(false);

// handle go back to patient page
const handleBackToPA = async () => {
  basicInfoStore.analysisMode = AnalysisModeEnum.Single;
  basicInfoStore.$reset();

  await router.push({
    path: PageRoute.Patient
  });

  // 离开页面后再执行清除已选择的ou/change列表,解决无法release已选择的数据
  analysisMultipleCommonStore.$reset();
  selectDataStore.$reset();
};

// modify patient
const handleModifyPatient = () => {
  modifyPatientDlgVisible.value = true;
};

// handle confirm modify patient
const handleModifyPatientOK = async (comment: string) => {
  modifyPatientDlgVisible.value = false;
  const res = await patientStore.updatePatient(comment);
  if (res) {
    ElNotification({
      type: "success",
      message: VueI18n("patient.modifyCommentSuccess"),
      customClass: "custom-notification-center"
    });
    const patientData = {
      ...patientStore.activePatient,
      Comment: comment
    };
    patientStore.setPatient(patientData);
    return;
  }

  ElNotification({
    type: "error",
    message: VueI18n("patient.modifyCommentFail"),
    customClass: "custom-notification-center"
  });
};

// handle cancel modify patient
const handleModifyPatientCancel = () => {
  modifyPatientDlgVisible.value = false;
};

// handle confirm select data
const handleSelectDataOK = async () => {
  selectDataDlgVisible.value = false;
  window.noLoadingMask = false;
  const { captureKey } = route.query;
  router.push({
    path: multipleAnalysisList.value?.[0].path,
    query: { captureKey, m: basicInfoStore.analysisMode }
  });
};

// handle cancel select data
const handleSelectDataCancel = () => {
  selectDataDlgVisible.value = false;
  window.noLoadingMask = false;
  const { path, query } = route;
  if (
    path === PageRoute.LineScan ||
    path === PageRoute.Angiography ||
    path === PageRoute.AngioRetinaEnhanced
  ) {
    basicInfoStore.analysisMode = AnalysisModeEnum.Single;
  } else {
    basicInfoStore.analysisMode = query.m as AnalysisModeEnum;
  }
};

const handleModeClick = async (mode: AnalysisModeEnum) => {
  const { captureKey } = route.query;
  ((basicInfoStore.analysisMode === AnalysisModeEnum.OU &&
    mode === AnalysisModeEnum.Change) ||
    (basicInfoStore.analysisMode === AnalysisModeEnum.Change &&
      mode === AnalysisModeEnum.OU)) &&
    (await measureCommonStore.saveMeasureData());
  if (mode === AnalysisModeEnum.Single) {
    basicInfoStore.analysisMode = mode;
    const visitedSinglePage = basicInfoStore.visitedSinglePage;
    const pageItem = analysisSelStore.singleAnalysisList.find(
      item => item.path === visitedSinglePage
    );
    analysisSelStore.setAnalysis(pageItem?.value ?? "");
    router.push({
      path: visitedSinglePage,
      query: { captureKey }
    });
    return;
  }

  if (!hasOUChange.value) return;

  !route.query.m && (basicInfoStore.visitedSinglePage = route.path);
  basicInfoStore.analysisMode = mode;
  if (
    (mode === AnalysisModeEnum.OU && selectDataStore.ouSelectedList.length) ||
    (mode === AnalysisModeEnum.Change &&
      selectDataStore.changeSelectedList.length)
  ) {
    const pageItem = multipleAnalysisList.value?.[0];
    analysisSelStore.setAnalysis(pageItem?.value ?? "");
    // 目前默认进入第一个双眼或对比分析页面
    router.push({
      path: pageItem?.path,
      query: { captureKey, m: mode }
    });
    return;
  }

  showSelectDataDlg();
};

watch(
  () => route.query,
  () => {
    const { query } = route;
    if (!query) return;

    // page switch, update active mode
    switch (query.m) {
      case AnalysisModeEnum.Change:
        basicInfoStore.analysisMode = AnalysisModeEnum.Change;
        break;
      case AnalysisModeEnum.OU:
        basicInfoStore.analysisMode = AnalysisModeEnum.OU;
        break;
      default:
        basicInfoStore.analysisMode = AnalysisModeEnum.Single;
        break;
    }

    synchronizeItemList.value =
      query && query.m === AnalysisModeEnum.OU
        ? [...OuSynchronizeItemList]
        : [...ChangeSynchronizeItemList];
  },
  { immediate: true }
);

const showSelectDataDlg = () => {
  window.noLoadingMask = true;
  selectDataDlgVisible.value = true;
};
const handleSyncValueChange = (val: boolean) => {
  basicInfoStore.setSynchronizeValue(!val);
};
const handleSyncChange = (item: SynchronizeItem) => {
  item.checked = !item.checked;
  switch (item.type) {
    case SynchronizeType.ZoomAndMoveSync:
      basicInfoStore.zoomAndMoveSync = item.checked;
      break;
    case SynchronizeType.xAxisLinkage:
      basicInfoStore.xAxisLinkage = item.checked;
      break;
    case SynchronizeType.yAxisLinkage:
      basicInfoStore.yAxisLinkage = item.checked;
      break;
    case SynchronizeType.ColorMode:
      basicInfoStore.colorMode = item.checked;
      break;
    default:
      console.log("no such synchronize item.");
  }
};
const handleScreenshot = () => analysisScreenshot(true);
const handleReport = () => analysisScreenshot(false);

const handleReportDlgClose = () => {
  reportPrintStore.reportDlgVisible = false;
};

// 保存各层血流图像和各层结构投射图
const handleSaveImages = () => {
  downloadMultiImages();
};
</script>

<style lang="scss" scoped>
$menu-height: 32px;

.basic-info {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84px;
  border-bottom: 1px solid $divide-dark-color;

  .left-area {
    display: flex;
  }

  .right-area {
    padding-right: 16px;
  }
}

.sec {
  border-right: 1px solid $divide-dark-color;

  .row {
    display: flex;
    // justify-content: space-between;
    height: 30px;
  }

  .element {
    display: flex;
    align-items: center;
    cursor: pointer;

    &.disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }

    .element-label {
      margin-left: 8px;
    }
  }

  .screenshot,
  .select-data {
    width: 185px;
    margin-right: 20px;
  }

  .save-angio,
  .quantization {
    width: 185px;
  }
}

.patient-link-sec,
.report-sec {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 84px;
  padding-top: 16px;
  cursor: pointer;

  .label {
    margin-top: 8px;
  }
}

.patient-info-sec {
  width: 290px;
  padding: 16px 16px 20px;

  .name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .name {
      width: 221px;
      overflow: hidden;
      font-size: 20px;
      font-weight: 700;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .edit-icon {
      cursor: pointer;
    }
  }

  .other-info-row {
    width: 100%;
    margin-top: 5px;
    overflow: hidden;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.jump-sec {
  display: flex;
}

.data-mode-container {
  display: flex;
  align-items: center;
  width: 232px;
  height: 60px;
  padding: 0 4px;
  margin: 12px 10px;
  background-color: $input-bg-color;
  border-radius: 4px;

  .mode-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100% / 3);
    height: calc(100% - 8px);
    cursor: pointer;
    border-radius: 2px;

    &.active {
      background-color: $dialog-bg-color;
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }
}

.import-export-sec,
.synchronize-sec {
  padding: 12px 30px 12px 12px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;

  .jump-item__icon {
    display: flex;
    align-items: center;

    img {
      margin-left: 5px;
    }
  }
}

.synchronize-dropdown__menu {
  width: 225px;
}

.sync-item {
  position: relative;
  display: flex;
  align-items: center;
  height: $menu-height;
  padding: 0 20px;
  margin: 8px 0;
  cursor: pointer;

  .menu-label {
    position: absolute;
    left: 60px;
  }

  &:hover {
    background-color: $highlight-color;
  }

  .check-icon {
    width: 20px;
    margin-right: 8px;
  }
}
</style>
