<template>
  <section class="capture-list">
    <section class="capture-table-type">
      <icon-svg
        v-for="item in CAPTURE_TABLE_TYPE"
        :key="item"
        :name="
          captureStore.captureTableType === item
            ? `${item}-type-active`
            : `${item}-type`
        "
        @click="handleCaptureTableTypeClicked(item)"
      />
    </section>
    <section
      v-if="captureStore.captureTableType === CAPTURE_DATA_TYPE.LIST"
      class="list-container"
      v-loading="captureLoading"
    >
      <el-table
        :data="captureStore.captureList"
        class="capture-table"
        row-key="ID"
        :row-class-name="tableRowClassName"
        default-expand-all
        :tooltip-options="{ showAfter: 300 }"
        @row-click="(row: CaptureType) => handleCaptureSelect(row)"
        @row-dblclick="(row: CaptureType) => handleAnalysis(row)"
        @sort-change="handleCaptureSortChange"
        @row-contextmenu="captureRowContextmenu"
      >
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
            <!-- customize the Time column -->
            <template v-if="item.dataKey === 'Time'">
              {{
                scope.row.children && scope.row.children.length > 0
                  ? toDateString(scope.row.date, getDateStandardFormat(true))
                  : scope.row.hhmmss
              }}
            </template>
            <template
              v-else-if="
                item.dataKey && !['Oculus', 'SSI'].includes(item.dataKey)
              "
            >
              {{
                scope.row.patientID
                  ? scope.row[item.dataKey]
                    ? scope.row[item.dataKey]
                    : "--"
                  : ""
              }}
            </template>
            <template v-if="item.dataKey === 'SSI'">
              {{ hideSSI(scope.row) ? "--" : scope.row.SSI }}
            </template>
            <!-- customize the Oculus column -->
            <span
              v-if="item.dataKey === 'Oculus' && scope.row.Oculus"
              :class="['oculus-col', `${scope.row.Oculus}`]"
            >
              {{ scope.row.Oculus }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <CaptureThumbnails
        v-if="captureStore.activeCaptureData.captureKey"
        :activeData="captureStore.activeCaptureData"
      />
    </section>
    <section v-else class="card-container">
      <section class="oculus-header">
        <div class="od oculus">{{ OculusTypeEnum.OD }}</div>
        <div class="os oculus">{{ OculusTypeEnum.OS }}</div>
      </section>
      <el-table
        :data="captureStore.captureList"
        class="capture-table"
        row-key="ID"
        :row-class-name="tableRowClassName"
        default-expand-all
        :show-header="false"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="card-list">
              <section class="left-cards">
                <capture-data-card
                  v-for="subitem in odDataList(props.row.children)"
                  :key="subitem.captureKey"
                  :src="getCaptureThumbnailUrl(subitem)"
                  :captureKey="subitem.captureKey"
                  :protocol="subitem.Protocol"
                  :oculus="subitem.Oculus"
                  :ssi="subitem.SSI"
                  :hide-ssi="hideSSI(subitem)"
                  :time="subitem.hhmmss"
                  :follow="subitem.Follow"
                  :isStarScan="isStarScanData(subitem.Protocol)"
                  :isCubeData="isCubeScan(subitem.Protocol)"
                  :class="captureDataClass(subitem)"
                  @select="handleCaptureSelect(subitem)"
                  @imageError="handleImageError"
                  @dblclick="handleAnalysis(subitem)"
                />
              </section>
              <section class="right-cards">
                <capture-data-card
                  v-for="subitem in osDataList(props.row.children)"
                  :key="subitem.captureKey"
                  :src="getCaptureThumbnailUrl(subitem)"
                  :captureKey="subitem.captureKey"
                  :protocol="subitem.Protocol"
                  :oculus="subitem.Oculus"
                  :ssi="subitem.SSI"
                  :hide-ssi="hideSSI(subitem)"
                  :time="subitem.hhmmss"
                  :follow="subitem.Follow"
                  :isStarScan="isStarScanData(subitem.Protocol)"
                  :isCubeData="isCubeScan(subitem.Protocol)"
                  :class="captureDataClass(subitem)"
                  @select="handleCaptureSelect(subitem)"
                  @imageError="handleImageError"
                  @dblclick="handleAnalysis(subitem)"
                />
              </section>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="date">
          <template #default="scope">
            {{ toDateString(scope.row.date, getDateStandardFormat(true)) }}
          </template>
        </el-table-column>
      </el-table>
    </section>
  </section>
  <ModifyCommentMenu :position="position" @edit="handleModifyComment" />
  <ModifyCaptureDialog
    :visible="modifyCaptureDlgVisible"
    :record="rightClickedRow"
    @ok="handleModifyCaptureOK"
    @cancel="handleModifyCaptureCancel"
  />
</template>

<script lang="ts" setup>
import { toDateString } from "xe-utils";
import { ElNotification } from "element-plus";
import { VueI18n } from "@/locales/i18n";
import router from "@/router";
import { PageRoute } from "@/utils/route";
import ModifyCommentMenu from "@/views/components/ModifyCommentMenu.vue";
import ModifyCaptureDialog from "@/views/components/ModifyCaptureDialog.vue";
import {
  isAngioProtocol,
  isLineScanProtocol,
  isMosaicProtocol,
  isBiometryProProtocol,
  isAnteriorScan,
  isFundusProtocol,
  isCubeProtocol,
  isStarScanData,
  isCubeScan,
  isBiometryProtocol,
  isScleralScanProtocol,
  isONHScanProtocol
} from "@/utils/protocol";
import CaptureThumbnails from "./CaptureThumbnails.vue";
import { CAPTURE_COLS, CAPTURE_DATA_TYPE } from "../utils";
import { usePatientStoreHook } from "../store/patient";
import { useCaptureStoreHook } from "../store/capture";
import { OculusTypeEnum } from "@/enums";
import { CaptureType } from "../utils/patient";
import { doLogout } from "@/utils/auth";
import { TARGET_DATE_FORMAT, USER_FRIENDLY_DELAY_TIME } from "@/utils/constant";
import { hideAllContextmenu } from "@/utils";
import { useModifyCapture } from "@/hooks/useModifyCapture";
import { getDateStandardFormat } from "@/utils/index";

defineOptions({
  name: "CaptureTable"
});

const { modifyCaptureDlgVisible, handleModifyCaptureCancel } =
  useModifyCapture();

const patientStore = usePatientStoreHook();
const captureStore = useCaptureStoreHook();

interface Props {
  patientID: string;
}

const props = withDefaults(defineProps<Props>(), {
  patientID: ""
});

// catpure table type list
const CAPTURE_TABLE_TYPE = [
  CAPTURE_DATA_TYPE.LIST,
  CAPTURE_DATA_TYPE.THUMBNAIL
];

const captureLoading = ref<boolean>(false);
const queryParams = reactive({
  patientID: "",
  sortBy: "",
  orderBy: ""
});

const captureDataClass = computed(() => {
  return (item: CaptureType) =>
    item.captureKey === captureStore.activeCaptureData?.captureKey
      ? "active"
      : "";
});

const hideSSI = computed(
  () => (item: CaptureType) =>
    isBiometryProProtocol(item.Protocol) || isMosaicProtocol(item.Protocol)
);

const scrollCurrentRowIntoView = async () => {
  await nextTick();
  // add active capture data scroll into view
  setTimeout(() => {
    const currentRowEle = document.querySelector(
      ".capture-table .selected-row"
    );
    const currentCardEle = document.querySelector(
      ".capture-table .capture-data-card.active"
    );
    currentRowEle?.scrollIntoView();
    currentCardEle?.scrollIntoView();
  }, USER_FRIENDLY_DELAY_TIME);
};

// query capture list
const handleCaptureQuery = async () => {
  captureLoading.value = true;
  const params = {
    ...queryParams,
    patientID: props.patientID,
    local: patientStore.activePatient?.IP
  };
  await captureStore.getCaptureList(params);
  captureLoading.value = false;

  if (
    !captureStore.captureList?.length ||
    captureStore.activeCaptureData?.captureKey
  ) {
    scrollCurrentRowIntoView();
    return;
  }

  // set the first capture data to be default selected
  const firstCapture = captureStore.captureList[0];
  captureStore.setCapture(
    firstCapture.children?.length ? firstCapture.children[0] : {}
  );
  scrollCurrentRowIntoView();
};

watch(
  [() => patientStore.activePatient.ID, () => patientStore.activePatient.IP],
  () => {
    props.patientID && handleCaptureQuery();
  },
  {
    immediate: true
  }
);

// add class to the selected row
const tableRowClassName = ({ row }: { row: CaptureType }) =>
  !row.patientID
    ? "expand-click-row"
    : row.captureKey === captureStore.activeCaptureData?.captureKey
    ? "selected-row"
    : "";

// filter the OD list from the given list
const odDataList = computed(() => {
  return (list: CaptureType[]) => {
    return list.filter(item => item.Oculus === OculusTypeEnum.OD);
  };
});

// filter the OS list from the given list
const osDataList = computed(() => {
  return (list: CaptureType[]) => {
    return list.filter(item => item.Oculus === OculusTypeEnum.OS);
  };
});

// get the thumbnail url
const getCaptureThumbnailUrl = (item: CaptureType) => {
  const isMosaic = isMosaicProtocol(item.Protocol);
  const isBiometry = isBiometryProProtocol(item.Protocol);

  const { VUE_APP_BASE_API_URL, VUE_APP_VANGOGH_VERSION } = process.env;
  const preUrl = `${VUE_APP_BASE_API_URL}${VUE_APP_VANGOGH_VERSION}/capture/thumbnail?captureKey=${item.captureKey}&`;
  return isMosaic
    ? `${preUrl}type=AngioMosaicInnerRetina&isMosaic=1`
    : isBiometry
    ? `${preUrl}type=oct2&isBiometryPro=1`
    : `${preUrl}type=slo`;
};

// capture list type clicked
const handleCaptureTableTypeClicked = (type: string) => {
  captureStore.setCaptureType(type);
  scrollCurrentRowIntoView();
};

// capture column sort change
const handleCaptureSortChange = ({
  prop,
  order
}: {
  prop: string;
  order: string;
}) => {
  queryParams.sortBy = prop;
  queryParams.orderBy = order;
  handleCaptureQuery();
};

const handleCaptureSelect = (item: CaptureType) => {
  if (!item.patientID) return;
  captureStore.setCapture(item);
};

// handle image loading error, redirect to login
const handleImageError = () => {
  doLogout();
};

// go to analysis page
const handleAnalysis = (item: CaptureType) => {
  // Scleral or Fundus or BiometryPro
  if (
    isScleralScanProtocol(item.Protocol) ||
    isFundusProtocol(item.Protocol) ||
    isBiometryProProtocol(item.Protocol)
  ) {
    return;
  }

  const queryParams = {
    captureKey: item.captureKey
  };

  // Biometry 【BiometryPro（暂不开放）】
  if (isBiometryProtocol(item.Protocol)) {
    router.push({
      path: PageRoute.LineScan,
      query: { ...queryParams }
    });
    return;
  }

  // as bscan
  if (isAnteriorScan(item.Protocol)) {
    if (isLineScanProtocol(item.Protocol)) {
      // 2D
      router.push({
        path: PageRoute.LineScan,
        query: { ...queryParams }
      });
      return;
    }
    // 3D
    if (isAngioProtocol(item.Protocol) || isCubeProtocol(item.Protocol)) {
      router.push({
        path: PageRoute.AsStructuralProj,
        query: { ...queryParams }
      });
      return;
    }
    return;
  }

  const isAngio = isAngioProtocol(item.Protocol);
  const isLineScan = isLineScanProtocol(item.Protocol);
  const isMosaic = isMosaicProtocol(item.Protocol);
  const isCube = isCubeProtocol(item.Protocol);
  const isONH = isONHScanProtocol(item.Protocol);

  if (isAngio) {
    // angio protocol
    router.push({
      path: PageRoute.Angiography,
      query: { ...queryParams }
    });
    return;
  }

  if (isMosaic) {
    // angio protocol
    router.push({
      path: PageRoute.Mosaic,
      query: { ...queryParams }
    });
    return;
  }
  if (isONH) {
    // ONH protocol
    router.push({
      path: PageRoute.LineScan,
      query: { ...queryParams }
    });
    return;
  }

  if (!isAngio && !isLineScan && !isCube) {
    // currently disable other protocols
    return;
  }

  // posterior line scan protocol
  router.push({
    path: PageRoute.LineScan,
    query: { ...queryParams }
  });
};

const rightClickedRow = ref<CaptureType>();
const position = reactive<Point>({
  x: 0,
  y: 0
});

const captureRowContextmenu = async (
  row: CaptureType,
  column: object,
  event: PointerEvent
) => {
  if (!row.patientID) return;

  event.preventDefault();
  rightClickedRow.value = row;
  hideAllContextmenu();
  setTimeout(() => {
    const { clientX, clientY } = event;
    position.x = clientX;
    position.y = clientY;
  }, USER_FRIENDLY_DELAY_TIME);
};

const handleModifyComment = () => {
  setTimeout(() => {
    hideAllContextmenu();
  }, USER_FRIENDLY_DELAY_TIME);
  modifyCaptureDlgVisible.value = true;
};

// handle confirm modify patient
const handleModifyCaptureOK = async (comment: string) => {
  modifyCaptureDlgVisible.value = false;
  const res = await captureStore.updateCapture(
    rightClickedRow.value?.captureKey ?? "",
    comment
  );
  if (res) {
    ElNotification({
      type: "success",
      message: VueI18n("patient.modifyCommentSuccess"),
      customClass: "custom-notification-center"
    });
    handleCaptureQuery();
    return;
  }

  ElNotification({
    type: "error",
    message: VueI18n("patient.modifyCommentFail"),
    customClass: "custom-notification-center"
  });
};
</script>

<style lang="scss" scoped>
$table-level2-bg-color: #252526;

.capture-list {
  display: flex;
  flex-direction: column;
  width: 50%;
  border-left: 1px solid $divide-dark-color;
}

.capture-table-type {
  display: flex;
  align-items: center;
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid $divide-dark-color;

  img {
    width: 18px;
    height: 16px;
    margin: 0 15px 0 20px;
    cursor: pointer;
  }
}

.list-container,
.card-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100% - 40px);
}

.list-container {
  .capture-table {
    flex: 1;
    border-bottom: 1px solid $divide-dark-color;
  }
}

.oculus-header {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 20px;
  border-bottom: 1px solid $divide-dark-color;

  .oculus {
    width: 50%;
    font-size: 30px;
  }
}

.card-list {
  display: flex;

  .left-cards,
  .right-cards {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    width: 50%;
    padding: 12px 4px 0 20px;
  }

  .capture-data-card {
    margin: 0 8px 8px 0;
  }
}

.capture-table {
  :deep(.el-table__row--level-1) {
    td.el-table__cell {
      background-color: $table-level2-bg-color;
      border-bottom: none;
    }

    &.selected-row {
      td.el-table__cell {
        background-color: $table-row-highlight-color;
      }
    }
  }

  .oculus-col {
    display: inline-block;
    width: 38px;
    height: 23px;
    font-weight: 700;
    line-height: 23px;
    text-align: center;
    background: rgb(255 255 255 / 10%);
    border-radius: 60px;

    &.OD {
      color: $oculus-od-color;
    }

    &.OS {
      color: $oculus-os-color;
    }

    &.OculusUnknown {
      width: auto;
      padding: 0 10px;
    }
  }
}

:deep(.el-table th.el-table__cell.is-leaf) {
  &:first-child {
    border-left: none;
  }
}

:deep(tr.el-table__row) {
  td.el-table__cell {
    background-color: $page-bg-color;
    border-bottom: 1px solid $divide-dark-color;

    .el-table__expand-icon {
      margin-right: 30px;
      margin-left: 10px;
      color: #e2e2e2;
    }
  }
}

:deep(td.el-table__expanded-cell) {
  background-color: $table-level2-bg-color;

  &:hover {
    background-color: $table-level2-bg-color !important;
  }
}

:deep(.el-table__expand-column) {
  .cell {
    padding: 0;
  }

  .el-table__expand-icon {
    margin-right: 0 !important;
    margin-left: 0 !important;

    svg {
      color: $font-main-color;
      stroke: $font-main-color;
      stroke-width: 20;
    }
  }
}

:deep(.el-table__placeholder) {
  display: none;
}
</style>
