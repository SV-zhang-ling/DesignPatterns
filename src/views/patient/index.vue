<template>
  <div class="patient-container">
    <OperationView @search="handleSearch" />
    <div class="list-container" v-loading="patientLoading">
      <section class="patient-list">
        <div class="patient-table-type">
          <div
            v-for="item in PATIENT_DATA_TYPE_LIST"
            :key="item.value"
            :class="patientTabClass(item)"
            @click="handlePatientTableTypeClicked(item)"
          >
            {{ $t(`${item.labelKey}`) }}
          </div>
        </div>
        <el-table
          ref="patientTableRef"
          :data="patientStore.patientList"
          class="patient-table"
          :tooltip-options="{ showAfter: 300 }"
          :default-sort="getDefaultSort as Sort"
          stripe
          highlight-current-row
          @current-change="handlePatientClicked"
          @sort-change="handlePatientSortChange"
          @row-contextmenu="patientRowContextmenu"
        >
          <el-table-column
            :label="$t('patient.index')"
            type="index"
            width="68"
            fixed="left"
          />
          <el-table-column
            v-for="item in PATIENT_COLS"
            :key="item.key"
            :prop="item.dataKey"
            :label="$t(`patient.${item.titleKey}`)"
            :min-width="item.width"
            sortable="custom"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div v-if="item.dataKey === 'LastVisit'" class="ocupied-col">
                <icon-svg v-show="scope.row.ocupied" name="ocupied" />
                {{ toDateString(scope.row.LastVisit, getDateStandardFormat()) }}
              </div>
              <span v-if="item.dataKey === 'DateofBirth'">
                {{
                  toDateString(
                    scope.row.DateofBirth,
                    getDateStandardFormat(true)
                  )
                }}
              </span>
              <span v-if="item.dataKey === 'Gender'">
                {{ $t(`common.${scope.row.Gender}`) }}
              </span>
              <template
                v-if="
                  item.dataKey === 'Comment' || item.dataKey === 'Physician'
                "
              >
                {{ scope.row[item.dataKey] || "--" }}
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div class="patient-table-bottom">
          {{ $t("common.total") }}: {{ totalPatient }}
        </div>
      </section>
      <CaptureTable :patientID="patientStore.activePatient?.ID" />
    </div>
  </div>
  <ModifyCommentMenu :position="position" @edit="handleModifyComment" />
  <ModifyPatientDialog
    :visible="modifyPatientDlgVisible"
    :record="rightClickedRow"
    @ok="handleModifyPatientOK"
    @cancel="handleModifyPatientCancel"
  />
</template>

<script setup lang="ts">
import { ElNotification, type Sort } from "element-plus";
import { toDateString } from "xe-utils";
import { VueI18n } from "@/locales/i18n";
import ModifyCommentMenu from "@/views/components/ModifyCommentMenu.vue";
import ModifyPatientDialog from "@/views/components/ModifyPatientDialog.vue";
import OperationView from "./components/OperationView.vue";
import CaptureTable from "./components/CaptureTable.vue";
import { WSMsgType } from "@/enums";
import { doLogout } from "@/utils/auth";
import { getFormattedDate } from "@/utils";
import {
  PATIENT_DATA_TYPE_LIST,
  PATIENT_COLS,
  PATIENT_DATA_TYPE
} from "./utils";
import { usePatientStoreHook } from "./store/patient";
import { useCaptureStoreHook } from "./store/capture";
import { RecordType, PatientType } from "./utils/patient.d";
import { USER_FRIENDLY_DELAY_TIME } from "@/utils/constant";
import { removeContextmenuHandler, hideAllContextmenu } from "@/utils";
import { useRefreshList } from "@/hooks/useRefreshList";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { getDateStandardFormat } from "@/utils/index";

// patient search fields
const SEARCH_FIELDS = {
  searchBy: "",
  keyword: "",
  startDate: "",
  endDate: "",
  sortBy: "",
  orderBy: ""
};

const patientStore = usePatientStoreHook();
const captureStore = useCaptureStoreHook();

const patientTableRef = ref();
const patientLoading = ref<boolean>(false);

const totalPatient = computed(() => patientStore.patientList?.length ?? 0);

const patientTabClass = computed(() => {
  return (item: RecordType) => [
    "table-type-item",
    `${patientStore.currentTab === item.value ? "active" : ""}`
  ];
});

const getDefaultSort = computed(() => {
  return patientStore.queryParams.sortBy
    ? {
        prop: patientStore.queryParams.sortBy,
        order: patientStore.queryParams.orderBy
      }
    : undefined;
});

const getQueryParams = () => {
  const activeTab = patientStore.currentTab;
  const { sortBy, orderBy } = patientStore.queryParams;
  switch (activeTab) {
    case PATIENT_DATA_TYPE.TODAY:
      return {
        ...SEARCH_FIELDS,
        startDate: getFormattedDate(Date.now()),
        endDate: getFormattedDate(Date.now()),
        sortBy,
        orderBy
      };
    case PATIENT_DATA_TYPE.ALL:
      return {
        ...patientStore.queryParams,
        ...SEARCH_FIELDS,
        sortBy,
        orderBy
      };
    case PATIENT_DATA_TYPE.SEARCH:
      return patientStore.queryParams;
    default:
      return { ...SEARCH_FIELDS };
  }
};

const watchWSMsg = () => {
  if (!window.wsWorker) return;

  window.wsWorker.onmessage = (event: MessageEvent) => {
    if (event.data.event === "message") {
      const resMsg = JSON.parse(event.data.data);
      if (resMsg.type === WSMsgType.Msg) {
        // 设置返回的数据
        const result = JSON.parse(resMsg.msg);
        if (result.route.includes("/patient/list") && result.succeed) {
          // 患者列表
          patientStore.setPatientList(result.data);
        }
        if (result.route.includes("/capture/list") && result.succeed) {
          // 采集数据列表
          captureStore.setCaptureList(result.data);
        }
        setCurrentRow();
      }

      if (resMsg.type === WSMsgType.Disconnect) {
        window.wsWorker.postMessage({ action: "close" });
        // 用户已经被登出
        doLogout();
      }
    }
  };
};

const init = () => {
  handlePatientQuery();
  removeContextmenuHandler();
  watchWSMsg();
};

onMounted(() => {
  init();
});

// clear previous selected and loaded data
const clearData = () => {
  patientStore.setPatient({});
  patientStore.setPatientList([]);
  captureStore.setCaptureList([]);
  captureStore.setCapture({});
};

// patient list type clicked
const handlePatientTableTypeClicked = (item: RecordType) => {
  patientStore.setActiveTab(item.value);

  // clear previous data
  clearData();

  // query new data
  handlePatientQuery();
};

// patient record clicked
const handlePatientClicked = (row: PatientType) => {
  if (
    !row ||
    (row.ID === patientStore.activePatient?.ID &&
      row.IP === patientStore.activePatient?.IP)
  ) {
    return;
  }

  captureStore.setCaptureList([]);
  captureStore.setCapture({});
  patientStore.setPatient(row);
};

// patient column sort change
const handlePatientSortChange = ({
  prop = "",
  order = ""
}: {
  prop: string;
  order: string;
}) => {
  if (!order) {
    prop = "";
    order = "";
  }
  patientStore.updateQueryParams({
    sortBy: prop,
    orderBy: order
  });
  handlePatientQuery();
};

// search button clicked
const handleSearch = () => {
  patientStore.setActiveTab(PATIENT_DATA_TYPE.SEARCH);

  // clear previous data
  clearData();

  handlePatientQuery();
};

// highlight current selected patient
const setCurrentRow = () => {
  if (!patientStore.patientList.length) {
    clearData();
    return;
  }

  let target = patientStore.patientList.find(
    (item: PatientType) =>
      item.ID === patientStore.activePatient.ID &&
      item.IP === patientStore.activePatient.IP
  );

  // no existed active patient, set the first patient in the patient list
  !target && (target = patientStore.patientList[0]);

  patientStore.setPatient(target);
  patientTableRef.value.setCurrentRow(target, true);
};

const scrollCurrentRowIntoView = async () => {
  await nextTick();
  // add active patient scroll into view
  const currentRowEle = document.querySelector(".patient-table .current-row");
  currentRowEle?.scrollIntoView();
};

// handle search patient
const handlePatientQuery = async () => {
  patientLoading.value = true;
  const params = getQueryParams();
  await patientStore.getPatientList(params);
  patientLoading.value = false;
  // update capture list
  if (!patientStore.patientList.length) {
    return;
  }

  if (!patientStore.activePatient || !patientStore.activePatient.ID) {
    // set the first patient to be default selected
    patientStore.setPatient(patientStore.patientList[0]);
  }

  setCurrentRow();
  scrollCurrentRowIntoView();
};

const rightClickedRow = ref<PatientType>();
const modifyPatientDlgVisible = ref<boolean>(false);
const position = reactive<Point>({
  x: 0,
  y: 0
});

const patientRowContextmenu = async (
  row: PatientType,
  column: object,
  event: PointerEvent
) => {
  event.preventDefault();
  // save cliced row
  rightClickedRow.value = row;
  hideAllContextmenu();
  setTimeout(() => {
    const { clientX, clientY } = event;
    position.x = clientX;
    position.y = clientY;
  }, USER_FRIENDLY_DELAY_TIME);
};

const handleModifyComment = () => {
  hideAllContextmenu();
  modifyPatientDlgVisible.value = true;
};

// handle confirm modify patient
const handleModifyPatientOK = async (comment: string) => {
  modifyPatientDlgVisible.value = false;
  const res = await patientStore.updatePatient(
    comment,
    rightClickedRow.value?.ID
  );
  if (res) {
    ElNotification({
      type: "success",
      message: VueI18n("patient.modifyCommentSuccess"),
      customClass: "custom-notification-center"
    });
    handlePatientQuery();
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

// start the refresh interval
useRefreshList();
useResizeObserver();
</script>
<style lang="scss" scoped>
.patient-container {
  height: calc(100% - 24px);

  .list-container {
    display: flex;
    height: calc(100% - 86px);
  }

  .patient-list {
    display: flex;
    flex-direction: column;
    width: calc(50% - 9px);
    margin-right: 8px;
    border-right: 1px solid $divide-dark-color;

    .patient-table,
    .capture-table {
      flex: 1;
    }
  }

  .patient-table-type {
    display: flex;
    align-items: center;
    height: 40px;
    line-height: 40px;
    background: linear-gradient(0deg, rgb(0 0 0 / 20%), rgb(0 0 0 / 20%)),
      $page-bg-color;
    border-bottom: 1px solid $divide-dark-color;

    .table-type-item {
      width: 182px;
      height: 100%;
      color: $font-inactive-color;
      text-align: center;
      cursor: pointer;
      border-right: 1px solid $divide-dark-color;

      &.active {
        color: $font-main-color;
        background-color: $page-bg-color;
        border-top: 1px solid $radio-active-color;
      }

      &:last-child {
        border-right: none;
      }
    }
  }

  .patient-table-bottom {
    height: 32px;
    padding-left: 16px;
    font-size: 12px;
    line-height: 32px;
    border-top: 1px solid $divide-dark-color;
  }

  .ocupied-col {
    display: flex;
    align-items: center;

    img {
      margin-right: 10px;
    }
  }
}
</style>
