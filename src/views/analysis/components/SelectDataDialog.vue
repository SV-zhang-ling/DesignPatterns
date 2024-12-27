<template>
  <sv-dialog
    :visible="dlgVisible"
    v-bind="$attrs"
    width="1024"
    :title="$t('analysis.selectData')"
    :okBtnDisabled="selectedKeys.length <= 1"
    class="select-data-dialog"
    :okLabelText="$t('common.okText')"
    :cancelLabelText="$t('common.cancelText')"
    @ok="handleOK"
    @cancel="handleCancel"
  >
    <div v-loading="tableLoading" class="list-container">
      <el-table
        :data="selectDataStore.selectDataList"
        v-if="selectDataStore.selectDataList.length"
        ref="selectDataTable"
        class="select-table"
        row-key="captureKey"
        height="284"
        :tooltip-options="{ showAfter: 300 }"
        :row-class-name="tableRowClassName"
        @row-click="handleRowClick"
        @sort-change="handleColSortChange"
      >
        <el-table-column type="selection" width="55">
          <template #default="{ row }">
            <el-radio
              v-if="
                row.captureKey === router.currentRoute.value.query.captureKey
              "
              v-model="router.currentRoute.value.query.captureKey"
              :label="row.captureKey"
              :disabled="true"
            >
              {{ "" }}
            </el-radio>
            <el-radio
              v-else
              v-model="otherSelectedKey"
              :label="row.captureKey"
              @change="handleRowCheckChange(row)"
            >
              {{ "" }}
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column
          v-for="item in CAPTURE_COLS"
          :key="item.key"
          :prop="item.dataKey"
          :label="$t(`patient.${item.titleKey}`)"
          :min-width="item.width"
          sortable="custom"
          :show-overflow-tooltip="item.dataKey !== 'Oculus'"
        >
          <template #default="scope">
            <span v-if="item.dataKey === 'Time'">
              {{ toDateString(scope.row.Time, getDateStandardFormat()) }}
            </span>
            <!-- customize the Oculus column -->
            <span
              v-if="item.dataKey === 'Oculus' && scope.row.Oculus"
              :class="['oculus-col', `${scope.row.Oculus}`]"
            >
              {{ scope.row.Oculus }}
            </span>
            <template v-if="item.dataKey === 'Comment'">
              {{ scope.row.Comment ?? "" }}
            </template>
            <template v-if="item.dataKey === 'SSI'">
              {{ hideSSI(scope.row) ? "" : scope.row.SSI }}
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="!tableLoading && !selectDataStore.selectDataList.length"
        class="error-warning"
      >
        DREAM OCT设备状态异常，请稍后再试。
      </div>
      <CaptureThumbnails
        v-if="
          selectDataStore.selectDataList.length &&
          selectDataStore.activeData.captureKey
        "
        :activeData="selectDataStore.activeData"
      />
    </div>
  </sv-dialog>
</template>

<script setup lang="ts">
import router from "@/router";
import { PageRoute } from "@/utils/route";
import { toDateString } from "xe-utils";
import { ElTable, Column } from "element-plus";
import { CaptureType } from "@/views/patient/utils/patient";
import { CAPTURE_COLS } from "@/views/patient/utils/index";
import { ModeTypeEnum, AnalysisModeEnum, SelectDataMaxEnum } from "@/enums";
import { useSelectDataStoreHook } from "./store/selectData";
import { useBasicInfoStoreHook } from "./store/basicInfo";
import { isMosaicProtocol, isBiometryProProtocol } from "@/utils/protocol";
import CaptureThumbnails from "@/views/patient/components/CaptureThumbnails.vue";
import { releaseServerCache } from "@/api/common";
import { getDateStandardFormat } from "@/utils/index";

defineOptions({
  name: "SelectDataDialog"
});

interface Props {
  dlgVisible: boolean;
  record?: CaptureType;
}

const selectDataStore = useSelectDataStoreHook();
const basicInfoStore = useBasicInfoStoreHook();
const props = defineProps<Props>();
const selectDataTable = ref<InstanceType<typeof ElTable> | null>(null);
const selectedKeys = ref<Array<string | undefined>>([]);
const selectedList = ref<Array<CaptureType>>([]);
const otherSelectedKey = ref<string | undefined>("");
const tableLoading = ref<boolean>(false);

const emits = defineEmits(["okSelect", "cancelSelect"]);

const sortParams = reactive({
  sortBy: "Time",
  orderBy: "desc"
});

watch(
  () => props.dlgVisible,
  (val: boolean) => {
    // 清空之前选择的数据
    selectDataStore.setActiveData({});

    if (val) {
      const {
        changeSelectedList,
        changeSelectedKeys,
        ouSelectedKeys,
        ouSelectedList
      } = selectDataStore;
      selectedKeys.value =
        basicInfoStore.analysisMode === AnalysisModeEnum.OU
          ? JSON.parse(JSON.stringify(ouSelectedKeys))
          : JSON.parse(JSON.stringify(changeSelectedKeys));
      selectedList.value =
        basicInfoStore.analysisMode === AnalysisModeEnum.OU
          ? JSON.parse(JSON.stringify(ouSelectedList))
          : JSON.parse(JSON.stringify(changeSelectedList));
      getDataList();
    }
  }
);

const getDataList = async () => {
  tableLoading.value = true;
  const captureKey = router.currentRoute.value.query.captureKey as string;
  const params = {
    captureKey: captureKey,
    selectType:
      basicInfoStore.analysisMode === AnalysisModeEnum.OU
        ? ModeTypeEnum.OU
        : ModeTypeEnum.Change,
    ...sortParams
  };
  await selectDataStore.getSelectDataList(params);
  tableLoading.value = false;

  const { selectDataList } = selectDataStore;
  if (!selectDataList.length) {
    selectedKeys.value = [];
    selectedList.value = [];
    otherSelectedKey.value = "";
    return;
  }
  if (selectedKeys.value.length) {
    // 已存，回显，高亮主数据
    const item: CaptureType | undefined = selectDataList.find(
      x =>
        x.captureKey !== captureKey && selectedKeys.value.includes(x.captureKey)
    );
    otherSelectedKey.value = item ? item.captureKey : "";
    item && selectDataStore.setActiveData(item);
  } else {
    // 初始化选择
    if (selectDataList.length === 1) {
      selectDataStore.setActiveData(selectDataList[0]);
      selectedList.value = [...selectDataList];
      selectedKeys.value = [captureKey];
      otherSelectedKey.value = "";
    } else {
      const index = selectDataList.findIndex(x => x.captureKey === captureKey);
      if (index === 0) {
        selectedList.value = [selectDataList[index], selectDataList[index + 1]];
        selectedKeys.value = [captureKey, selectDataList[index + 1].captureKey];
        otherSelectedKey.value = selectDataList[index + 1].captureKey;
        selectDataStore.setActiveData(selectDataList[index + 1]);
      } else {
        selectedList.value = [selectDataList[index], selectDataList[index - 1]];
        selectedKeys.value = [captureKey, selectDataList[index - 1].captureKey];
        otherSelectedKey.value = selectDataList[index - 1].captureKey;
        selectDataStore.setActiveData(selectDataList[index - 1]);
      }
    }
  }
  scrollToRow();
};

const hideSSI = computed(
  () => (item: CaptureType) =>
    isBiometryProProtocol(item.Protocol) || isMosaicProtocol(item.Protocol)
);

const tableRowClassName = ({ row }: { row: CaptureType }) => {
  return `${
    row.captureKey === selectDataStore.activeData.captureKey
      ? "selected-row"
      : ""
  } ${selectedKeys.value.includes(row.captureKey) ? "checked-row" : ""}`;
};

const handleColSortChange = ({
  prop,
  order
}: {
  prop: string;
  order: string;
}) => {
  sortParams.sortBy = prop;
  sortParams.orderBy = order === "descending" ? "desc" : "asc";
  getDataList();
};

const handleRowClick = (item: CaptureType, column: Column) => {
  if (column.type === "selection") return;
  selectDataStore.setActiveData(item);
};
const handleRowCheckChange = (row: CaptureType) => {
  const mainItem = selectedList.value.find(
    item => item.captureKey === router.currentRoute.value.query.captureKey
  ) as CaptureType;
  selectedList.value = [mainItem, row];
  selectedKeys.value = [mainItem.captureKey, row.captureKey];
};
const handleOK = () => {
  setValues(selectedKeys.value, selectedList.value);
  emits("okSelect");
};

const handleCancel = () => {
  // 取消时恢复原选择
  emits("cancelSelect");
};

// check whether to release backend cache
const callRelease = (newSelectedKeys: Array<string | undefined>) => {
  const { captureKey } = router.currentRoute.value.query;
  const storedKeys =
    basicInfoStore.analysisMode === AnalysisModeEnum.Change
      ? selectDataStore.changeSelectedKeys
      : selectDataStore.ouSelectedKeys;
  // TO-DO：以下逻辑只适用于一个附属数据的情况，多个的情况后面需要重新考虑
  // 获取新选择附属数据的captureKey
  const newAttachKey = newSelectedKeys.find(key => key !== captureKey);
  const existed = storedKeys.findIndex(key => key === newAttachKey);
  if (newAttachKey && storedKeys.length && existed === -1) {
    // release backend cache
    // 获取需要释放的附属数据的captureKey
    const oldAttachKey = storedKeys.find(key => key !== captureKey);
    oldAttachKey && releaseServerCache({ captureKey: oldAttachKey });
  }
};

const setValues = (
  keys: Array<string | undefined>,
  list: Array<CaptureType>
) => {
  if (basicInfoStore.analysisMode === AnalysisModeEnum.Change) {
    list = list.sort(
      (a: any, b: any) =>
        new Date(b.Time).getTime() - new Date(a.Time).getTime()
    );
    callRelease(keys);
    selectDataStore.setChangeSelectedKeys(keys);
    selectDataStore.setChangeSelectedList(list);
    return;
  }
  callRelease(keys);
  selectDataStore.setOuSelectedKeys(keys);
  selectDataStore.setOuSelectedList(list);
};

// scroll checked row into view
const scrollToRow = async () => {
  await nextTick();

  const tableBodyWrapper = selectDataTable.value?.$el.querySelector(
    ".el-scrollbar__wrap"
  );
  // first checked row
  const targetRow = tableBodyWrapper.querySelector(".checked-row");
  if (targetRow) {
    tableBodyWrapper.scrollTop = targetRow.offsetTop;
  }
};
</script>

<style lang="scss" scoped>
$table-level2-bg-color: #252526;

.select-data-dialog {
  height: 694px;
  margin-right: 0;

  .list-container {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 952px;
    height: calc(100% - 40px);
    min-height: 200px;
  }

  .error-warning {
    height: 404px;
  }

  .select-table {
    flex: 1;
    width: 100%;
    border-bottom: 1px solid $divide-dark-color;

    :deep(.el-table__header-wrapper) {
      .el-checkbox {
        display: none;
      }
    }

    :deep(.el-table__row) {
      td.el-table__cell {
        line-height: 10px;
        cursor: pointer;
        background-color: $table-level2-bg-color;
        border-bottom: none;
      }

      &.selected-row {
        td.el-table__cell {
          line-height: 10px;
          cursor: pointer;
          background-color: $table-row-highlight-color;
        }
      }
    }
  }
}
</style>
