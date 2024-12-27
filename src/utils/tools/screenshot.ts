import _ from "lodash";
import { watch } from "vue";
import domtoimage from "dom-to-image";
import { toDateString } from "xe-utils";
import {
  DATETIME_FORMAT,
  WATERMAKER_DATETIME_FORMAT,
  ORIGIN_DATE_FORMAT
} from "@/utils/constant";
import { isAnteriorScan, isMosaicProtocol } from "@/utils/protocol";
import { VueI18n } from "@/locales/i18n";
import router from "@/router";
import { PageRoute } from "@/utils/route";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import watermarkSvgUrl from "@/assets/icons/company-logo.svg";
import { AnalysisModeEnum } from "@/enums";
import { usePatientStoreHook } from "@/views/patient/store/patient";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useReportPrintStoreHook } from "@/views/analysis/components/store/report";
import { getDateStandardFormat } from "@/utils/index";
import { useCubeStoreHook } from "@/views/analysis/cube/store";
import { getImageName } from "@/utils/image";

const scrollTop: number[] = [];
const layerCards: any = [];

const generateScreenshot = (
  analysisContainerDom: HTMLElement,
  isMark: boolean,
  thumbnailContainerDom: NodeListOf<Element>,
  unwatch?: () => void
) => {
  const reportPrintStore = useReportPrintStoreHook();

  const scale = 2; // 提高清晰度的比例
  const width = analysisContainerDom.clientWidth * scale;
  const height = analysisContainerDom.scrollHeight * scale;

  domtoimage
    .toPng(analysisContainerDom, {
      width: width,
      height: height,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: analysisContainerDom.clientWidth + "px",
        height: analysisContainerDom.scrollHeight + "px"
      }
    })
    .then(async (screenshotUrl: string) => {
      // 判断是否需要添加水印并保存
      reportPrintStore.setReportContentUrl(screenshotUrl);
      isMark &&
        (await addWatermark({ url: screenshotUrl, scale, width, height }));
      !isMark && (reportPrintStore.reportDlgVisible = true);
    })
    .finally(() => {
      if (thumbnailContainerDom.length) {
        for (let i = 0; i < thumbnailContainerDom.length; i++) {
          const thumbnail = thumbnailContainerDom[i] as HTMLElement;
          moveThumb(i, 0);
          thumbnail.scrollTo({
            top: scrollTop[i],
            behavior: "auto"
          });
          thumbnail.style.overflow = "auto";
        }
      }
      unwatch && unwatch();
      setMaskContentStatus(false);
    });
};

export const analysisScreenshot = async (isMark: boolean) => {
  const { path } = router.currentRoute.value;
  setMaskContentStatus(true);
  const analysisContainerDom = document.getElementsByClassName(
    "analysis-container"
  )[0] as HTMLElement;
  analysisContainerDom.style.backgroundColor = "#2e2e2f"; // 加背景色，否则domtoimage截屏无背景色
  const thumbnailContainerDom =
    path === PageRoute.MultipleLineScan
      ? analysisContainerDom.querySelectorAll(".bscan-thumbnails")
      : analysisContainerDom.querySelectorAll(".thumbnail-list");
  if (thumbnailContainerDom.length) {
    for (let i = 0; i < thumbnailContainerDom.length; i++) {
      const thumbnail = thumbnailContainerDom[i] as HTMLElement;
      scrollTop[i] = thumbnail.scrollTop;
      layerCards[i] = thumbnail.querySelectorAll(".layer-card").length
        ? thumbnail.querySelectorAll(".layer-card")
        : thumbnail.querySelectorAll(".bscan-thumbnail-card");
      thumbnail.scrollTo({ top: 0, behavior: "auto" });
      moveThumb(i, scrollTop[i]);
      thumbnail.style.overflow = "hidden"; // 隐藏滚轴，否则domtoimage截屏滚动区域样式被打乱，domtoimage生成菜单滚轴宽度更大，导致乱行
    }
  }

  const cubeStore = useCubeStoreHook();
  let unwatch: () => void;
  const isCubePage = [PageRoute.Cube, PageRoute.AsCube].includes(path);
  if (isCubePage) {
    cubeStore.screenshotTaking = true;
    unwatch = watch(
      () => cubeStore.screenshotTaking,
      (screenshotTaking: boolean) => {
        if (!screenshotTaking) {
          generateScreenshot(
            analysisContainerDom,
            isMark,
            thumbnailContainerDom,
            unwatch
          );
        }
      }
    );
    return;
  }

  generateScreenshot(analysisContainerDom, isMark, thumbnailContainerDom);
};

export const addWatermark = ({
  url,
  scale,
  width,
  height,
  type
}: {
  url: string;
  scale: number;
  width: number;
  height: number;
  type?: string;
}) => {
  const captureStore = useCaptureStoreHook();

  // 根据当前宽度按比例计算水印的高度，基于1920px水印高度为88px,文字大小20px,图标宽度128px
  const baseWidth = 1920 * scale; // 基准宽度
  const baseWatermarkHeight = 88 * scale; // 基准水印高度
  const watermarkHeight = (width * baseWatermarkHeight) / baseWidth;

  const baseFontSize = 20 * scale; // 基准字体大小
  const fontSize = (width * baseFontSize) / baseWidth;

  // SVG 的基准大小
  const baseSvgSize = 128 * scale; // 基准 SVG 大小
  const svgWidthSize = (width * baseSvgSize) / baseWidth;

  // 边距设置
  const leftMargin = 24 * scale;
  const leftMarginSize = (width * leftMargin) / baseWidth;
  const rightMargin = 30 * scale;
  const rightMarginSize = (width * rightMargin) / baseWidth;
  const topMargin = 20 * scale;
  const topMarginSize = (width * topMargin) / baseWidth;

  const img = new Image();
  img.src = url;

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (context) {
      // 增加高度以容纳水印
      canvas.width = width;
      canvas.height = height + watermarkHeight;

      // 绘制截屏图像
      context.drawImage(img, 0, 0);

      // 添加水印背景
      context.fillStyle = "#000"; // 水印背景色
      context.fillRect(0, height, width, watermarkHeight);

      // 绘制水印文字
      context.font = `${fontSize}px 'HarmonyOS Sans SC'`;
      context.fillStyle = "#fff";
      context.textAlign = "left";

      const lineHeight = fontSize * 1.5; // 行高设置为字体大小的1.5倍
      const textY1 = height + topMarginSize + fontSize; // 第一行文字的Y坐标
      const textY2 = textY1 + lineHeight; // 第二行文字的Y坐标

      context.fillText(
        `[${captureStore.activeCaptureData.Oculus}] ${
          captureStore.activeCaptureData.Protocol
        } ${getCaptureDataDepth()}`,
        leftMarginSize,
        textY1
      );
      context.fillText(
        `${toDateString(
          captureStore.activeCaptureData.Time,
          getDateStandardFormat()
        )}`,
        leftMarginSize,
        textY2
      );

      const svgImg = new Image();
      svgImg.src = watermarkSvgUrl;
      svgImg.onload = () => {
        // 右侧图标长宽比不变
        const aspectRatio = svgImg.width / svgImg.height;
        const svgHeightSize = svgWidthSize / aspectRatio;
        // 计算 SVG 绘制的位置
        const svgX = width - svgWidthSize - rightMarginSize;
        const svgY = height + topMarginSize;
        // 在水印区域绘制 SVG
        context.drawImage(svgImg, svgX, svgY, svgWidthSize, svgHeightSize);

        // 将图像保存到本地
        canvas.toBlob(blob => {
          if (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = type
              ? getImageName(type)
              : `${getScreenshotImageName()}.png`;
            link.click();

            window.focus();
            // 支持粘贴到剪贴板
            try {
              document.hasFocus() &&
                navigator.clipboard.write([
                  new ClipboardItem({
                    "image/png": blob
                  })
                ]);
            } catch (err) {
              console.error(err);
            }
          }
        }, "image/png");
      };
    }
  };
};

export const getCaptureDataDepth = () => {
  const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const captureStore = useCaptureStoreHook();
  const { ouCaptureDetailMap, changeCaptureDetailMap } =
    analysisMultipleCommonStore;
  const isMosaic = isMosaicProtocol(analysisCommonStore.protocolName);

  const captureKey = router.currentRoute.value.query.captureKey as string;

  const depth = [PageRoute.MultipleAngio, PageRoute.MultipleLineScan].includes(
    router.currentRoute.value.path
  )
    ? router.currentRoute.value.query.m === AnalysisModeEnum.OU
      ? `${ouCaptureDetailMap[captureKey].depth_mm} mm` || ""
      : `${changeCaptureDetailMap[captureKey].depth_mm} mm` || ""
    : isMosaic
    ? ""
    : analysisCommonStore.depth_mm
    ? `${analysisCommonStore.depth_mm} mm${
        isAnteriorScan(captureStore.activeCaptureData?.Protocol)
          ? `(${VueI18n("patient.inAir")})`
          : ""
      }`
    : "";
  return depth;
};

const getScreenshotImageName = () => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const captureStore = useCaptureStoreHook();
  const patientStore = usePatientStoreHook();
  const name =
    (analysisCommonStore.sn
      ? `${analysisCommonStore.sn}_${patientStore.activePatient.ID}`
      : patientStore.activePatient.ID) +
    "_" +
    // 文件名脱敏处理
    // patientStore.activePatient.Name +
    // "_" +
    // toDateString(patientStore.activePatient.DateofBirth, ORIGIN_DATE_FORMAT) +
    // "_" +
    // patientStore.activePatient.Gender +
    // "_" +
    captureStore.activeCaptureData.Protocol +
    "_Screenshot_" +
    captureStore.activeCaptureData.Oculus +
    "_" +
    toDateString(captureStore.activeCaptureData.Time, DATETIME_FORMAT) +
    "_" +
    toDateString(Date.now(), DATETIME_FORMAT);
  return name;
};

export const setMaskContentStatus = (status: boolean, isAwait?: boolean) => {
  const maskDom = document.getElementById("loadingMask") as HTMLElement;
  if (!maskDom) return;
  const spinner = maskDom.querySelector(".mask-spinner") as HTMLElement;
  const LoadingmsgDom = maskDom.querySelector(".Loadingmsg") as HTMLElement;
  const isAwaitDom = maskDom.querySelector(".isAwait") as HTMLElement;
  LoadingmsgDom.style.display = isAwait ? "none" : "block";
  isAwaitDom.style.display = isAwait ? "block" : "none";

  if (status) {
    maskDom.style.display = "flex";
    maskDom.style.background = isAwait ? "rgba(0,0,0,0.3)" : "#2e2e2f";
    maskDom.style.opacity = isAwait ? "1" : "0.9";
    maskDom.style.zIndex = "10001";
    spinner.style.display = "flex";
  } else {
    maskDom.style.display = "none";
    maskDom.style.opacity = "0.4";
    maskDom.style.zIndex = "2001";
    spinner.style.display = "none";
  }
};

const moveThumb = (idx: number, y: number) => {
  for (let i = 0; i < layerCards[idx].length; i++) {
    const card = layerCards[idx][i] as HTMLElement;
    card.style.top = `-${y}px`;
  }
};
