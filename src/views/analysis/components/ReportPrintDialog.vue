<template>
  <sv-dialog
    :visible="dlgVisible"
    v-bind="$attrs"
    width="80%"
    top="60px"
    :style="{ minWidth: '1060px' }"
    :title="$t('analysis.report')"
    class="report-print-dialog"
    :hasFooter="false"
    @opened="handleOpen"
    @cancel="handleClose"
  >
    <div class="report-content">
      <div class="report-main">
        <div class="report-container" ref="reportContainerRef">
          <div class="report-message" ref="reportPrintHeaderRef">
            <div class="message-item title">
              <div class="oculus">
                <span>{{ reportOculus }}</span>
              </div>
              <icon-svg name="company-logo-white" />
            </div>
            <div class="message-item form">
              <div class="item">
                <span class="label">{{ `${$t("patient.name")}: ` }}</span>
                <span
                  class="nameValue"
                  ref="reportNameRef"
                  :style="{
                    fontSize: `${nameFontSize}px`,
                    lineHeight: `${nameFontSize}px`
                  }"
                  >{{ patientStore.activePatient.Name }}</span
                >
              </div>
              <div class="item">
                <span class="label">{{ `${$t("patient.gender")}: ` }}</span>
                <span
                  class="value"
                  :title="$t(`common.${patientStore.activePatient.Gender}`)"
                >
                  {{ $t(`common.${patientStore.activePatient.Gender}`) }}
                </span>
              </div>
              <div class="item">
                <span class="label">
                  {{ `${$t("patient.examDatetime")}: ` }}
                </span>
                <span
                  class="value"
                  :title="
                    toDateString(
                      captureStore.activeCaptureData.Time,
                      getDateStandardFormat()
                    )
                  "
                >
                  {{
                    toDateString(
                      captureStore.activeCaptureData.Time,
                      getDateStandardFormat()
                    )
                  }}
                </span>
              </div>
              <div class="item">
                <span class="label">{{ `${$t("patient.operator")}: ` }}</span>
                <span
                  class="value"
                  :title="captureStore.activeCaptureData.Operator"
                >
                  {{ captureStore.activeCaptureData.Operator || "--" }}
                </span>
              </div>
              <div class="item">
                <span class="label">{{ `${$t("patient.patientID")}: ` }}</span>
                <span class="value" :title="patientStore.activePatient.ID">{{
                  patientStore.activePatient.ID
                }}</span>
              </div>
              <div class="item">
                <span class="label">{{
                  `${$t("patient.dateofbirth")}: `
                }}</span>
                <span
                  class="value"
                  :title="
                    toDateString(
                      patientStore.activePatient.DateofBirth,
                      getDateStandardFormat(true)
                    )
                  "
                >
                  {{
                    toDateString(
                      patientStore.activePatient.DateofBirth,
                      getDateStandardFormat(true)
                    )
                  }}
                </span>
              </div>
              <div class="item">
                <span class="label">
                  {{ `${$t("analysis.protocolType")}: ` }}
                </span>
                <span
                  class="value"
                  :title="captureStore.activeCaptureData.Protocol"
                >
                  {{ captureStore.activeCaptureData.Protocol }}
                </span>
              </div>
              <div class="item">
                <span class="label">{{ `${$t("analysis.printTime")}: ` }}</span>
                <span
                  class="value"
                  :title="
                    toDateString(reportPrintTime, getDateStandardFormat())
                  "
                >
                  {{ toDateString(reportPrintTime, getDateStandardFormat()) }}
                </span>
              </div>
            </div>
          </div>
          <div class="report">
            <img
              :src="reportPrintStore.reportContentUrl"
              :alt="$t('common.noData')"
              v-if="reportPrintStore.reportContentUrl"
            />
          </div>
          <div class="report-desc" ref="reportPrintFooterRef">
            <div class="desc-item" ref="reportCommentRef">
              <div class="item comment">
                <span class="label">{{ `${$t("analysis.comment")}: ` }}</span>
                <span
                  class="comment"
                  :style="{
                    fontSize: `${fontSize}px`,
                    lineHeight: `${fontSize}px`
                  }"
                  >{{ reportPrintStore.reportComment }}</span
                >
                <div
                  ref="measureElement"
                  class="measure-text"
                  :style="{
                    fontSize: `${fontSize}px`,
                    lineHeight: `${fontSize}px`
                  }"
                >
                  {{ reportPrintStore.reportComment }}
                </div>
              </div>
              <div class="item">
                <span class="label">{{ `${$t("analysis.signature")}: ` }}</span>
              </div>
            </div>
            <div class="desc-remark">
              <div class="item left">
                <!-- <div style="margin-right: 20px">
                  <span>{{ $t("common.hospitalAddr") }}</span>
                  <span>{{ "" }}</span>
                </div>
                <div>
                  <span style="margin-right: 20px">{{
                    $t("common.telephone")
                  }}</span>
                  <span>{{ "" }}</span>
                </div>
                <div>
                  <span>{{ $t("common.email") }}</span>
                  <span>{{ "" }}</span>
                </div> -->
              </div>
              <div class="item right">
                <div style="margin-right: 20px">
                  <span>{{ `${$t("common.sn")}: ` }}</span>
                  <span>{{ reportSn }}</span>
                </div>
                <div>
                  <span>{{ `${$t("common.ver")}: ` }}</span>
                  <span>{{
                    captureStore.activeCaptureData.SW || "undefined"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="report-print-container" ref="printAreaRef">
          <div class="report-message">
            <div class="message-item title">
              <div class="oculus">
                <span>{{ reportOculus }}</span>
              </div>
              <icon-svg name="company-logo-white" />
            </div>
            <div class="message-item form">
              <div class="item">
                <span class="label">{{ `${$t("patient.name")}: ` }}</span>
                <span
                  class="nameValue"
                  :style="{
                    fontSize: `${nameFontSize}px`,
                    lineHeight: `${nameFontSize}px`
                  }"
                  >{{ patientStore.activePatient.Name }}</span
                >
              </div>
              <div class="item">
                <span class="label">{{ `${$t("patient.gender")}: ` }}</span>
                <span
                  class="value"
                  :title="$t(`common.${patientStore.activePatient.Gender}`)"
                >
                  {{ $t(`common.${patientStore.activePatient.Gender}`) }}
                </span>
              </div>
              <div class="item">
                <span class="label">
                  {{ `${$t("patient.examDatetime")}: ` }}
                </span>
                <span
                  class="value"
                  :title="
                    toDateString(
                      captureStore.activeCaptureData.Time,
                      getDateStandardFormat()
                    )
                  "
                >
                  {{
                    toDateString(
                      captureStore.activeCaptureData.Time,
                      getDateStandardFormat()
                    )
                  }}
                </span>
              </div>
              <div class="item">
                <span class="label">{{ `${$t("patient.operator")}: ` }}</span>
                <span
                  class="value"
                  :title="captureStore.activeCaptureData.Operator"
                >
                  {{ captureStore.activeCaptureData.Operator || "--" }}
                </span>
              </div>
              <div class="item">
                <span class="label">{{ `${$t("patient.patientID")}: ` }}</span>
                <span class="value" :title="patientStore.activePatient.ID">{{
                  patientStore.activePatient.ID
                }}</span>
              </div>
              <div class="item">
                <span class="label">{{
                  `${$t("patient.dateofbirth")}: `
                }}</span>
                <span
                  class="value"
                  :title="
                    toDateString(
                      patientStore.activePatient.DateofBirth,
                      getDateStandardFormat(true)
                    )
                  "
                >
                  {{
                    toDateString(
                      patientStore.activePatient.DateofBirth,
                      getDateStandardFormat(true)
                    )
                  }}
                </span>
              </div>
              <div class="item">
                <span class="label">
                  {{ `${$t("analysis.protocolType")}: ` }}
                </span>
                <span
                  class="value"
                  :title="captureStore.activeCaptureData.Protocol"
                >
                  {{ captureStore.activeCaptureData.Protocol }}
                </span>
              </div>
              <div class="item">
                <span class="label">{{ `${$t("analysis.printTime")}: ` }}</span>
                <span
                  class="value"
                  :title="
                    toDateString(reportPrintTime, getDateStandardFormat())
                  "
                >
                  {{ toDateString(reportPrintTime, getDateStandardFormat()) }}
                </span>
              </div>
            </div>
          </div>
          <div class="report" ref="reportPrintArea">
            <img
              :src="reportScreenshot"
              :alt="$t('common.noData')"
              v-if="reportScreenshot"
            />
          </div>
          <div class="report-desc">
            <div class="desc-item">
              <div class="item comment">
                <span class="label">{{ `${$t("analysis.comment")}: ` }}</span>
                <span
                  class="comment"
                  :style="{
                    fontSize: `${fontSize}px`,
                    lineHeight: `${fontSize}px`
                  }"
                  >{{ reportPrintStore.reportComment }}</span
                >
              </div>
              <div class="item">
                <span class="label">{{ `${$t("analysis.signature")}: ` }}</span>
              </div>
            </div>
            <div class="desc-remark">
              <div class="item left">
                <!-- <div style="margin-right: 20px">
                  <span>{{ $t("common.hospitalAddr") }}</span>
                  <span>{{ "" }}</span>
                </div>
                <div>
                  <span style="margin-right: 20px">{{
                    $t("common.telephone")
                  }}</span>
                  <span>{{ "" }}</span>
                </div>
                <div>
                  <span>{{ $t("common.email") }}</span>
                  <span>{{ "" }}</span>
                </div> -->
              </div>
              <div class="item right">
                <div style="margin-right: 20px">
                  <span>{{ `${$t("common.sn")}: ` }}</span>
                  <span>{{ reportSn }}</span>
                </div>
                <div style="width: 80px">
                  <span>{{ `${$t("common.ver")}: ` }}</span>
                  <span class="reportVer">{{
                    captureStore.activeCaptureData.SW || "undefined"
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="report-setting">
        <div>
          <div class="setting__item">
            <span class="label">{{ $t("analysis.reportOptions") }}</span>
            <el-select v-model="reportPrintStore.reportOption" disabled>
              <el-option
                v-for="item in REPORT_OPTIONS_LISTS"
                :key="item.value"
                :value="item.value"
                :label="$t(item.labelKey)"
              />
            </el-select>
          </div>
          <div class="setting__item">
            <span class="label">{{ $t("analysis.reportTemplates") }}</span>
            <el-select v-model="reportPrintStore.reportTemplate" disabled>
              <el-option
                v-for="item in REPORT_TEMPLATES_LISTS"
                :key="item.value"
                :value="item.value"
                :label="$t(item.labelKey)"
              />
            </el-select>
          </div>
        </div>
        <div>
          <div class="setting__item">
            <span class="label"
              >{{ $t("analysis.comment") }}（{{
                reportPrintStore.reportComment.length
              }}/230）</span
            >
            <el-input
              v-model="reportPrintStore.reportComment"
              ref="inputRef"
              class="setting-input"
              type="textarea"
              :placeholder="$t('analysis.commentPlaceholder')"
              :maxlength="230"
              :autosize="{ minRows: 10, maxRows: 20 }"
              clearable
              resize="none"
            />
          </div>
          <div class="setting__item btn">
            <el-button
              class="setting-btn"
              type="primary"
              @click="handleReportPrint"
            >
              {{ $t("analysis.printReport") }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </sv-dialog>
</template>

<script setup lang="ts">
import { useReportPrintStoreHook } from "@/views/analysis/components/store/report";
import { REPORT_TEMPLATES_LISTS, REPORT_OPTIONS_LISTS } from "@/utils/constant";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { usePatientStoreHook } from "@/views/patient/store/patient";
import { REPORT_OCULUS_TYPE } from "@/utils/constant";
import { OculusTypeEnum, AnalysisModeEnum } from "@/enums";
import { toDateString } from "xe-utils";
import jsPDF from "jspdf";
import {
  WATERMAKER_DATETIME_FORMAT,
  BIRTH_DATE_FORMAT
} from "@/utils/constant";
import domtoimage from "dom-to-image";
import { setMaskContentStatus } from "@/utils/tools/screenshot";
import { PageRoute } from "@/utils/route";
import router from "@/router";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { getDateStandardFormat } from "@/utils/index";
import { ModalEnum, useEventTracker } from "@/event-tracking";
import { useRoute } from "vue-router";

defineOptions({
  name: "ReportPrintDialog"
});

interface Props {
  dlgVisible: boolean;
}

const props = defineProps<Props>();
const analysisCommonStore = useAnalysisCommonStoreHook();
const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
const reportPrintStore = useReportPrintStoreHook();
const captureStore = useCaptureStoreHook();
const patientStore = usePatientStoreHook();
const reportScreenshot = ref<string | null>(null);

const printAreaRef = ref<HTMLElement | null>(null);
const reportContainerRef = ref<HTMLElement | null>(null);
const reportPrintArea = ref<HTMLElement | null>(null);
const reportPrintTime = ref(Date.now());
const reportCommentRef = ref<HTMLElement | null>(null);
const measureElement = ref<HTMLElement | null>(null);
const fontSize = ref(14);
const nameFontSize = ref(14);
const reportPrintHeaderRef = ref<HTMLElement | null>(null);
const reportPrintFooterRef = ref<HTMLElement | null>(null);
const reportNameRef = ref<HTMLElement | null>(null);

const reportOculus = computed(() => {
  const path = router.currentRoute.value.path;
  const m = router.currentRoute.value.query.m;
  const oculus = captureStore.activeCaptureData.Oculus as OculusTypeEnum;
  const title =
    [PageRoute.MultipleLineScan, PageRoute.MultipleAngio].includes(path) &&
    m === AnalysisModeEnum.OU
      ? OculusTypeEnum.OU
      : [OculusTypeEnum.OD, OculusTypeEnum.OS].includes(oculus)
      ? oculus + " | " + REPORT_OCULUS_TYPE[oculus]
      : oculus;
  return title;
});
const reportSn = computed(() => {
  const path = router.currentRoute.value.path;
  const m = router.currentRoute.value.query.m;
  const captureKey = router.currentRoute.value.query.captureKey as string;
  const { ouCaptureDetailMap, changeCaptureDetailMap } =
    analysisMultipleCommonStore;
  const sn = [PageRoute.MultipleLineScan, PageRoute.MultipleAngio].includes(
    path
  )
    ? m === AnalysisModeEnum.OU
      ? ouCaptureDetailMap[captureKey].sn
      : changeCaptureDetailMap[captureKey].sn
    : analysisCommonStore.sn;
  return sn;
});

const emits = defineEmits(["close"]);

const currentRoute = useRoute();
const { triggerModalEvent } = useEventTracker();
const handleOpen = () => {
  triggerModalEvent(currentRoute, ModalEnum.ReportPrint, 1);
  reportPrintTime.value = Date.now();
  // 确定页头name的字体大小
  getHeaderNameFontSize();

  const url = reportPrintStore.reportContentUrl;
  // 创建一个新的Image对象
  const img = new Image();
  img.src = url;
  const width = reportContainerRef.value!.clientWidth;
  const height = (210 * width) / 297;
  printAreaRef.value!.style.width = width + "px";
  printAreaRef.value!.style.height = height + "px";
  const headerHeight = reportPrintHeaderRef.value!.clientHeight;
  const footerHeight = reportPrintFooterRef.value!.clientHeight;
  reportPrintArea.value!.style.height =
    height - headerHeight - footerHeight - 30 + "px";
  const targetHeight = height - headerHeight - footerHeight - 30; // 目标高度
  const originalWidth = img.width;
  const originalHeight = img.height;

  // 根据目标高度按比例计算宽度
  const targetWidth = (originalWidth * targetHeight) / originalHeight;

  // 创建canvas并设置新的宽高
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // 在canvas中绘制缩放后的图片
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // 获取缩放后的图片URL
    reportScreenshot.value = canvas.toDataURL("image/png");
  }
};
const getHeaderNameFontSize = async () => {
  let nameHeight = reportNameRef.value!.clientHeight;
  while (nameHeight > 19 && nameFontSize.value > 7) {
    nameFontSize.value--; // 缩小字体
    await nextTick();
    nameHeight = reportNameRef.value!.clientHeight;
  }
};

const handleClose = () => {
  triggerModalEvent(currentRoute, ModalEnum.ReportPrint, 0);
  reportPrintStore.$reset();
  reportScreenshot.value = null;
  emits("close");
};
const handleReportPrint = async () => {
  reportPrintTime.value = Date.now();
  printAreaRef.value!.style.display = "block";
  setMaskContentStatus(true);
  if (printAreaRef.value) {
    try {
      const scale = 2;
      // 生成 截图
      const imgData = await domtoimage.toPng(printAreaRef.value, {
        quality: 1,
        width: printAreaRef.value.clientWidth * scale,
        height: printAreaRef.value.clientHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: printAreaRef.value.clientWidth + "px",
          height: printAreaRef.value.clientHeight + "px"
        }
      });
      printAreaRef.value!.style.display = "none";
      setMaskContentStatus(false);

      // 创建横向的 PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4"
      });

      // 定义边距（上下左右均为 5pt）
      const margin = 5 * scale;
      const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pdfHeight = pdf.internal.pageSize.getHeight() - margin * 2;

      // 获取图像宽高
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      // 将图像添加到PDF，设置在页面中央并添加边距
      const x = margin;
      const y = (pdfHeight - imgHeight) / 2 + margin;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      // 将 PDF 输出为 Blob
      const pdfBlob = pdf.output("blob");

      // 创建隐藏的 iframe 用于打印
      const printIframe = document.createElement("iframe");
      printIframe.style.position = "absolute";
      printIframe.style.width = "0px";
      printIframe.style.height = "0px";
      printIframe.style.border = "none";

      document.body.appendChild(printIframe);

      // 加载 PDF 并触发打印
      const blobUrl = URL.createObjectURL(pdfBlob);
      printIframe.src = blobUrl;

      printIframe.onload = () => {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      };
    } catch (error) {
      console.error("Error:", error);
    }
  }
};

watch(
  () => reportPrintStore.reportComment,
  async (text: string) => {
    if (!measureElement.value) return;
    let height = measureElement.value.scrollHeight;
    while (height > 70 - fontSize.value && fontSize.value > 1) {
      fontSize.value--; // 缩小字体
      await nextTick();
      height = measureElement.value?.scrollHeight;
    }
    while (height <= 70 && fontSize.value < 14) {
      fontSize.value++;
      await nextTick();
      height = measureElement.value?.scrollHeight;
      if (height > 70) {
        fontSize.value--; // 回退一次增大
        break;
      }
    }
  }
);
</script>
<style lang="scss" scoped>
.report-print-dialog {
  position: relative;

  .report-content {
    display: flex;
    justify-content: center;

    .report-main {
      flex: 1;
      padding: 20px;
      background: #000;

      .report-container {
        background: #fff;
      }

      .report-print-container {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -10001;
        display: none;
        width: 1336px;
        background: #fff;
      }

      .report-message {
        .message-item {
          &.title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 26px;
            font-weight: bold;
            line-height: 26px;
            color: #000;
          }

          &.form {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            padding: 8px 0;
            border-color: #000;
            border-style: solid;
            border-width: 1px 0;

            .item {
              display: flex;
              align-items: center;
              width: 25%;
              font-size: 14px;
              line-height: normal;
              color: #000;

              .label {
                margin-right: 4px;
                font-weight: bold;
              }

              .nameValue {
                max-width: calc(100% - 70px);
              }

              .value {
                max-width: calc(100% - 70px);
                overflow: hidden; /* 超出部分隐藏 */
                text-overflow: ellipsis; /* 溢出时显示省略号 */
                white-space: nowrap; /* 强制文字不换行 */
              }
            }
          }
        }
      }

      .report {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 15px 0;
      }

      .report-desc {
        .desc-item {
          display: flex;
          height: 70px;
          padding: 4px 0 6px;
          overflow: hidden;
          border-color: #000;
          border-style: solid;
          border-width: 1px 0;

          .item {
            position: relative;
            font-weight: normal;
            color: #000;

            .label {
              font-size: 14px;
              font-weight: bold;
            }

            .comment {
              width: calc(100% - 80px);
              word-break: break-all;
              white-space: pre-line;
            }

            .measure-text {
              position: absolute;
              top: 0;
              left: 0;
              width: calc(100% - 80px); /* 宽度与实际容器相同 */
              color: red;
              white-space: pre-line; /* 处理换行 */
              visibility: hidden;
            }

            &.comment {
              display: flex;
              width: 85%;
            }
          }
        }

        .desc-remark {
          display: flex;
          justify-content: space-between;
          height: 20px;
          padding: 4px 70px 4px 0;

          .item {
            display: flex;
            font-size: 10px;
            font-weight: normal;
            line-height: normal;
            color: #000;

            &.right {
              font-weight: bold;
            }
          }
        }
      }
    }

    .report-setting {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 315px;
      margin-left: 10px;

      .setting__item {
        margin-bottom: 16px;

        .setting-btn {
          width: 315px;
        }

        &.btn {
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style>
