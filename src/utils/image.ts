/* eslint-disable */
// @ts-nocheck
import domtoimage from "dom-to-image";
import {
  getProjectionImage,
  getBscanImage,
  getSloImage,
  getChVesselQuantizeImage,
  getSRFQuantizeImage,
  getOctImage,
  getThicknessImage,
  getAsThicknessImage,
  getCscanImage
} from "@/api/image";
import {
  ContainerNameEnum,
  AxisEnum,
  IMAGE_TYPE,
  AlgorithmEnum,
  ProjectTypeEnum,
  ContextmenuTypeEnum,
  AnalysisModeEnum,
  MULTIPLE_IMAGE_TYPE,
  SaveImagesClassNameEnum
} from "@/enums";
import { useMaskContentStoreHook } from "@/components/mask-content/store/index";

import { useAngioStoreHook } from "@/views/analysis/posterior/angio/store/angiography";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useLineScanStoreHook } from "@/views/analysis/lineScan/single/store/index";
import { useContextmenuStoreHook } from "@/store/modules/contextmenu";
import { usePatientStoreHook } from "@/views/patient/store/patient";
import { useCaptureStoreHook } from "@/views/patient/store/capture";
import { useMosaicStoreHook } from "@/views/analysis/mosaic/store/mosaic";
import { useAdvancedSegStoreHook } from "@/views/analysis/posterior/advancedSeg/store/advancedSeg";
import { toDateString } from "xe-utils";
import {
  ORIGIN_DATE_FORMAT,
  DATETIME_FORMAT,
  WATERMAKER_DATETIME_FORMAT,
  COMPONENTNAME_SAVE
} from "@/utils/constant";
import {
  ORIGIN_DATE_FORMAT,
  DATETIME_FORMAT,
  ANGIO_LAYER_THUMBNAIL_LIST,
  StructuralProj_THUMBNAIL_LIST,
  ANGIO_RETINA_ENHANCED_THUMBNAIL_LIST
} from "@/utils/constant";
import { PageRoute } from "./route";
import router from "@/router";
import { useMultipleAngioStore } from "@/views/analysis/posterior/angio/multiple/store";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";
import { useEditLayersStoreHook } from "@/views/analysis/components/layers/store/editLayers";
import { useStructuralProjStoreHook } from "@/views/analysis/structuralProj/store";
import { useAngioLayerStoreHook } from "@/views/analysis/posterior/angio/components/store/angioLayer";
import { useSaveImageStoreHook } from "@/views/analysis/components/saveImage/store";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import watermarkSvgUrl from "@/assets/icons/company-logo.svg";
import { isAnteriorScan, isMosaicProtocol } from "@/utils/protocol";
import { VueI18n } from "@/locales/i18n";
import JSZip from "jszip";
import { getThumbnailListByType } from "./index";
import { useCubeStoreHook } from "@/views/analysis/cube/store";
import {
  getDateStandardFormat,
  loadImageFromSVG,
  loadImageFromBlob,
  intToArray
} from "@/utils/index";
import {
  AngioImageParamsType,
  CscanImageParams,
  OCTImageParamsType,
  ThicknessImageParamsType
} from "@/api/types";
import {
  setMaskContentStatus,
  addWatermark as addScreenshotWatermark
} from "@/utils/tools/screenshot";
import { resolve } from "path";
import { useOCTLayerStoreHook } from "@/views/analysis/structuralProj/components/store/octLayer";

let i: number = 0;
interface AngioImageParams {
  captureKey: string;
  projType?: number;
  smartBC: number;
  angioLayer: string;
  enhance?: number;
  par?: number;
  removeStripLine?: number;
  angioProjColor: string;
  retinaEnhanced?: number;
  comBright?: number;
  comContrast?: number;
}

interface BscanImageParams {
  captureKey: string;
  axis: number;
  smartBC: number;
  index: number;
  bscanProcessorType: string | undefined;
  corrected?: number;
  comBright?: number;
  comContrast?: number;
}

/**
 * @param imageData the binary data of the image returned from the backend
 */
export const saveImage = async (
  imageData: Blob,
  imageType: string,
  slice?: number
) => {
  const watermarkedBlob = await addWatermark(imageData);
  const blob: Blob = watermarkedBlob ? watermarkedBlob : imageData;
  const url = window.URL.createObjectURL(blob);

  // Create a link element
  const link = document.createElement("a");
  link.href = url;
  link.download = getImageName(imageType, slice);

  // Append the link to the body
  document.body.appendChild(link);

  // Simulate click on the link to trigger download
  link.click();

  // Clean up
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

export const addWatermark = async (imageData: Blob): Promise<Blob> => {
  const captureStore = useCaptureStoreHook();
  // Create a URL for the Blob
  const img: any = await loadImageFromBlob(imageData);

  const canvas = document.createElement("canvas");
  const context: any = canvas.getContext("2d");
  const width = img.width;
  const height = img.height;

  const baseWidth = 1024; // 基准宽度
  const baseWatermarkHeight = 88; // 基准水印高度
  const watermarkHeight =
    width >= 640 ? (width * baseWatermarkHeight) / baseWidth : 55;

  const baseFontSize = 20; // 基准字体大小
  const fontSize = (width * baseFontSize) / baseWidth;

  // SVG 的基准大小
  const baseSvgSize = 128; // 基准 SVG 大小
  let svgWidthSize = (width * baseSvgSize) / baseWidth;

  // 边距设置
  const leftMargin = 24;
  const leftMarginSize = (width * leftMargin) / baseWidth;
  const rightMargin = 30;
  const rightMarginSize = width >= 640 ? (width * rightMargin) / baseWidth : 20;
  const topMargin = 20;
  const topMarginSize = width >= 640 ? (width * topMargin) / baseWidth : 16;
  canvas.width = width;
  canvas.height = height + watermarkHeight;

  context.drawImage(img, 0, 0);
  context.fillStyle = "#000"; // 水印背景色
  context.fillRect(0, height, width, watermarkHeight);

  // 绘制水印文字
  if (width >= 640) {
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
  }

  const svgImg: any = await loadImageFromSVG();
  width < 640 && (svgWidthSize = svgImg.width);
  const aspectRatio = svgImg.width / svgImg.height;
  const svgHeightSize = svgWidthSize / aspectRatio;
  // 计算 SVG 绘制的位置
  const svgX = width - svgWidthSize - rightMarginSize;
  const svgY = height + topMarginSize;
  // 在水印区域绘制 SVG
  context.drawImage(svgImg, svgX, svgY, svgWidthSize, svgHeightSize);

  return new Promise(resolve => {
    // 返回Blob
    canvas.toBlob(blob => resolve(blob as Blob), "image/png");
  });
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

/**
 * 患者姓名_患者ID_扫描程序_眼别_扫描时间_导出时间，在现有基础上，去掉信号强度，扫描时间以及导出时间的下划线去掉，长度比如20231103094601
 * @returns file name
 */
export const getImageName = (imageType: string, slice?: number) => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const patientStore = usePatientStoreHook();
  const captureStore = useCaptureStoreHook();
  const patient = patientStore.activePatient,
    capture = captureStore.activeCaptureData;

  return `${
    analysisCommonStore.sn
      ? `${analysisCommonStore.sn}_${patient.ID}`
      : patient.ID
  }_${capture.Protocol}_${
    imageType === IMAGE_TYPE.Bscan && slice
      ? `${imageType}_${slice + 1}`
      : imageType
  }_${capture.Oculus}_${toDateString(
    capture.Time,
    DATETIME_FORMAT
  )}_${toDateString(Date.now(), DATETIME_FORMAT)}.png`;
  // 文件名脱敏处理：${patient.Name}_${toDateString(patient.DateofBirth, ORIGIN_DATE_FORMAT)}_${ patient.Gender }_
};

/**
 * 压缩包文件名: 患者ID+姓名+类型+导出时间
 * @param type string
 * @returns zip file name
 */
export const getZipFileName = (type: string, save?: boolean) => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const patientStore = usePatientStoreHook();
  const patient = patientStore.activePatient;

  return `${
    analysisCommonStore.sn
      ? `${analysisCommonStore.sn}_${patient.ID}`
      : patient.ID
  }_${type}_${
    !save ? "" : type === "LineScan" ? "B-scan_OCT_" : "B-scan_"
  }${toDateString(Date.now(), DATETIME_FORMAT)}`;
  // 文件名脱敏处理： _${patient.Name}
};

// TO-DO: add comBright and comContrast parameters
export const downloadSloImage = async (
  captureKey: string,
  sloSmartBC: number,
  comBright?: number,
  comContrast?: number
) => {
  try {
    const params = {
      captureKey,
      smartBC: sloSmartBC,
      comBright,
      comContrast,
      saveMode: 1
    };
    const res = await getSloImage(params);
    const imageData = res as Blob;
    saveImage(imageData, IMAGE_TYPE.SLO);
  } catch (err) {
    console.error(err);
  }
};
export const downloadOctImage = async ({
  captureKey,
  smartBC,
  projColor,
  angioLayer,
  octLayer,
  projType,
  isMosaic,
  corrected,
  comBright,
  comContrast,
  editSurf,
  refSurf
}: OCTImageParamsType) => {
  try {
    const params = {
      captureKey,
      smartBC,
      saveMode: 1,
      projColor,
      projType,
      angioLayer,
      octLayer,
      isMosaic,
      corrected,
      comBright,
      comContrast,
      editSurf,
      refSurf
    };
    const res = await getOctImage(params);
    const imageData = res as Blob;
    saveImage(
      imageData,
      isMosaic ? IMAGE_TYPE.ProjectionMosaic : IMAGE_TYPE.OCT
    );
  } catch (err) {
    console.error(err);
  }
};

export const downloadThicknessMapImage = async ({
  captureKey,
  editSurf,
  refSurf
}: ThicknessImageParamsType) => {
  try {
    const params = {
      captureKey,
      thicknessLayer: "",
      saveMode: 1,
      editSurf,
      refSurf,
      colorMapName: ContextmenuTypeEnum.Range500
    };
    const res =
      router.currentRoute.value.path === PageRoute.AsStructuralProj
        ? await getAsThicknessImage(params)
        : await getThicknessImage(params);
    const imageData = res as Blob;
    saveImage(imageData, IMAGE_TYPE.Thickness);
  } catch (err) {
    console.error(err);
  }
};

export const downloadAngioImage = async ({
  captureKey,
  projType,
  smartBC,
  angioLayer,
  enhance,
  par,
  removeStripLine,
  angioProjColor,
  retinaEnhanced,
  comBright,
  comContrast
}: AngioImageParams) => {
  try {
    const params = {
      captureKey,
      projType,
      smartBC,
      angioLayer,
      enhance,
      par,
      removeStripLine,
      angioProjColor,
      saveMode: 1,
      retinaEnhanced,
      comBright,
      comContrast
    };
    const res = await getProjectionImage(params);
    const imageData = res as Blob;
    saveImage(
      imageData,
      retinaEnhanced == 1
        ? IMAGE_TYPE.AngioRetinaEnhanced
        : IMAGE_TYPE.AngioProj
    );
  } catch (err) {
    console.error(err);
  }
};

const addAllWatermark = (blobList: Blob[]): Promise<Blob[]> => {
  return new Promise((resolve, reject) => {
    try {
      const waterMarkPromises = [...blobList].map((blob: Blob) =>
        addWatermark(blob)
      );
      Promise.all([...waterMarkPromises]).then((res: Blob[]) => {
        resolve(res);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const getImagesPromise = (thumbnailList: LabelKeyValueType[]) => {
  const analysisCommonStore = useAnalysisCommonStoreHook();
  const { path } = router.currentRoute.value;
  const imageApi = [
    PageRoute.StructuralProjection,
    PageRoute.MosaicStructuralProj
  ].includes(path)
    ? getOctImage
    : getProjectionImage;
  return thumbnailList.map((item: LabelKeyValueType) => {
    let params: any = {
      captureKey: analysisCommonStore.captureKey,
      saveMode: 1
    };
    if (path === PageRoute.StructuralProjection) {
      const structuralProjStore = useStructuralProjStoreHook();
      params = {
        ...params,
        smartBC: structuralProjStore.octSmartBC,
        projColor: structuralProjStore.octProcessorType,
        projType: structuralProjStore.projType,
        octLayer: item.value
        // corrected
      };
    } else if (
      [
        PageRoute.Mosaic,
        PageRoute.MosaicAngioRetinaEnhanced,
        PageRoute.MosaicStructuralProj
      ].includes(path)
    ) {
      const mosaicStore = useMosaicStoreHook();
      params = {
        ...params,
        isMosaic: 1,
        smartBC: mosaicStore.smartBC,
        enhance: mosaicStore.enhance ? 1 : 0,
        enhanceBool: mosaicStore.enhance
      };
      if (path === PageRoute.MosaicStructuralProj) {
        params.octLayer = item.value;
      } else {
        params.angioLayer = item.value;
      }
    } else {
      const angioStore = useAngioStoreHook();
      params = {
        ...params,
        smartBC: angioStore.angioSmartBC,
        projType:
          path === PageRoute.AngioRetinaEnhanced
            ? ProjectTypeEnum.SUM
            : angioStore.projType,
        angioLayer: item.value,
        par: angioStore.par,
        enhance: angioStore.enhance,
        removeStripLine: angioStore.removeStripLine,
        angioProjColor: angioStore.angioProcessorType,
        retinaEnhanced: path === PageRoute.AngioRetinaEnhanced ? 1 : 0
      };
    }
    return imageApi(params);
  });
};

const getSixImageGrid = async (blobs: Blob[]): Promise<Blob> => {
  if (blobs.length !== 6) {
    throw new Error("必须提供6个图像Blob。");
  }

  // 加载Blob并转换为图像对象
  const images = (await Promise.all(
    blobs.map(blob => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });
    })
  )) as HTMLImageElement[];

  // 假设每个图像的宽高是相同的，获取任意一个图像的尺寸
  const imgWidth = images[0].width;
  const imgHeight = images[0].height;

  // 创建canvas并设置大小，宽度是3倍的图像宽度，高度是2倍的图像高度
  const canvas = document.createElement("canvas");
  canvas.width = imgWidth * 3;
  canvas.height = imgHeight * 2;
  const ctx = canvas.getContext("2d");

  // 在canvas上绘制图像
  for (let i = 0; i < images.length; i++) {
    const x = (i % 3) * imgWidth; // 计算图像的x坐标
    const y = Math.floor(i / 3) * imgHeight; // 计算图像的y坐标
    ctx && ctx.drawImage(images[i], x, y, imgWidth, imgHeight);
  }

  // 导出最终的canvas为Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob: Blob | null) => {
      if (blob) {
        try {
          const pngBlob = await addWatermark(blob);
          resolve(pngBlob);
        } catch (err) {
          reject(err);
        }
      }
    }, "image/png");
  });
};

// 保存各层血流图像
export const downloadMultiImages = async () => {
  let type = MULTIPLE_IMAGE_TYPE.Angio;
  const { path } = router.currentRoute.value;
  switch (path) {
    case PageRoute.StructuralProjection:
      type = MULTIPLE_IMAGE_TYPE.Projection;
      break;
    case PageRoute.AngioRetinaEnhanced:
      type = MULTIPLE_IMAGE_TYPE.EnhancedAngio;
      break;
    case PageRoute.Mosaic:
      type = MULTIPLE_IMAGE_TYPE.AngioMosaic;
      break;
    case PageRoute.MosaicAngioRetinaEnhanced:
      type = MULTIPLE_IMAGE_TYPE.EnhancedAngioMosaic;
      break;
    case PageRoute.MosaicStructuralProj:
      type = MULTIPLE_IMAGE_TYPE.ProjectionMosaic;
      break;
    default:
      type = MULTIPLE_IMAGE_TYPE.Angio;
      break;
  }
  const thumbnailList = getThumbnailListByType(type);
  const imagesPromise = getImagesPromise(thumbnailList);

  Promise.all([...imagesPromise]).then(async (res: (Blob | unknown)[]) => {
    try {
      const zip = new JSZip();
      const pngList: Blob[] = await addAllWatermark(res as Blob[]);
      [...pngList].forEach((blob: Blob, index: number) => {
        zip.file(
          getImageName(`${type}_${VueI18n(thumbnailList[index].labelKey)}`),
          blob
        );
      });
      if (type === MULTIPLE_IMAGE_TYPE.Angio) {
        const blobs = res.slice(2, 7).concat([res[13]]);
        const sixInOneImage = await getSixImageGrid(blobs as Blob[]);
        zip.file(
          getImageName(`${type}_Sup-Deep-Avas_CCL-CL-PED`),
          sixInOneImage
        );
      }
      // 生成 ZIP 文件并提供下载
      zip
        .generateAsync({ type: "blob" })
        .then(function (content) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(content);
          link.download = `${getZipFileName(type)}.zip`;
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch(function (error) {
          console.error("Error generating ZIP file: ", error);
        });
    } catch (err) {
      console.error(
        "Error occured in function downloadMultiImages in image.ts file.",
        err
      );
    }
  });
};

export const downloadBscanImage = async ({
  captureKey,
  axis,
  smartBC,
  index,
  bscanProcessorType,
  corrected,
  comBright,
  comContrast
}: BscanImageParams) => {
  try {
    const contextmenuStore = useContextmenuStoreHook();
    const params = {
      captureKey,
      axis,
      smartBC,
      saveMode: 1,
      slice: index === -1 ? 0 : index,
      smooth: contextmenuStore.bscanSmooth || 0,
      encoder: "png",
      quality: 100,
      bscanColor: bscanProcessorType,
      corrected,
      comBright,
      comContrast
    };
    const res = await getBscanImage(params);
    const imageData = res as Blob;
    saveImage(imageData, IMAGE_TYPE.Bscan, index);
  } catch (err) {
    console.error(err);
  }
};

const downloadMosaicImage = async ({
  captureKey,
  angioLayer,
  enhanceBool,
  smartBC,
  comBright,
  comContrast,
  imageType
}: AngioImageParamsType) => {
  try {
    const params = {
      captureKey,
      angioLayer,
      isMosaic: 1,
      enhance: enhanceBool ? 1 : 0,
      smartBC,
      saveMode: 1,
      comBright,
      comContrast
    };
    const res = await getProjectionImage(params);
    const imageData = res as Blob;
    saveImage(imageData, imageType);
  } catch (err) {
    console.error(err);
  }
};

const downloadQuantizeImage = async (
  captureKey: string,
  quantize: string,
  algorithm: string
) => {
  try {
    const params = {
      captureKey,
      quantize,
      saveMode: 1
    };
    let res;
    algorithm === AlgorithmEnum.CHVessel &&
      (res = await getChVesselQuantizeImage(params));
    algorithm === AlgorithmEnum.SRF &&
      (res = await getSRFQuantizeImage(params));
    const imageData = res as Blob;
    saveImage(imageData, IMAGE_TYPE.Quantize);
  } catch (err) {
    console.error(err);
  }
};
const analysisCommonStore = useAnalysisCommonStoreHook();
const lineScanStore = useLineScanStoreHook();

// Save Image
const downloadCscanImage = async ({
  captureKey,
  cscanType,
  surfShift,
  cscanSurf,
  surfType,
  smartBC,
  smartPosX,
  smartPosY,
  comBright,
  comContrast
}: CscanImageParams) => {
  try {
    const params = {
      captureKey,
      cscanType,
      surfShift,
      cscanSurf,
      surfType,
      smartBC,
      smartPosX,
      smartPosY,
      comBright,
      comContrast
    };
    const res = await getCscanImage(params);
    const imageData = res as Blob;
    saveImage(imageData, `${IMAGE_TYPE.Cscan}_${cscanSurf}`);
  } catch (err) {
    console.error(err);
  }
};

export const handleSaveImage = (
  targetName: ContainerNameEnum,
  captureKey?: string
) => {
  const angioStore = useAngioStoreHook();
  const mosaicStore = useMosaicStoreHook();
  const advancedSegStore = useAdvancedSegStoreHook();
  const contextmenuStore = useContextmenuStoreHook();
  const multipleAngioStore = useMultipleAngioStore();
  const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
  const editLayersStore = useEditLayersStoreHook();
  const structuralProjStore = useStructuralProjStoreHook();
  const cubeStore = useCubeStoreHook();

  const { path } = router.currentRoute.value;
  let currStore;
  switch (path) {
    case PageRoute.Angiography:
    case PageRoute.AngioRetinaEnhanced:
      currStore = angioStore;
      break;
    case PageRoute.AdvancedSeg:
      currStore = advancedSegStore;
      break;
    case PageRoute.StructuralProjection:
    case PageRoute.AsStructuralProj:
      currStore = structuralProjStore;
      break;
    default:
      break;
  }

  switch (targetName) {
    case ContainerNameEnum.SloOct:
    case ContainerNameEnum.AdvancedSegSlo:
    case ContainerNameEnum.FullScope:
    case ContainerNameEnum.OCTScope:
      currStore &&
        downloadSloImage(
          analysisCommonStore.captureKey,
          currStore.sloSmartBC,
          currStore.sloBrightness,
          currStore.sloContrast
        );
      contextmenuStore.resetActiveMenu();
      break;
    case ContainerNameEnum.AngioProj: {
      if (
        path === PageRoute.Angiography ||
        path === PageRoute.AngioRetinaEnhanced
      ) {
        const params: AngioImageParams = {
          captureKey: analysisCommonStore.captureKey,
          smartBC: angioStore.angioSmartBC,
          projType:
            path === PageRoute.AngioRetinaEnhanced
              ? ProjectTypeEnum.SUM
              : angioStore.projType,
          angioLayer: angioStore.angioLayer,
          par: angioStore.par,
          enhance: angioStore.enhance,
          removeStripLine: angioStore.removeStripLine,
          angioProjColor: angioStore.angioProcessorType,
          comBright: angioStore.angioBrightness,
          comContrast: angioStore.angioContrast
        };
        if (path === PageRoute.AngioRetinaEnhanced) {
          params.retinaEnhanced = 1;
        }
        downloadAngioImage(params);
        return;
      }

      const { activeCaptureCard } = analysisMultipleCommonStore;
      if (captureKey !== activeCaptureCard?.captureKey) return;
      downloadAngioImage({
        captureKey: activeCaptureCard?.captureKey as string,
        smartBC: activeCaptureCard?.angioSmartBC as number,
        angioLayer: multipleAngioStore.activeLayer as string,
        angioProjColor: activeCaptureCard?.angioProcessorType as string,
        comBright: activeCaptureCard?.angioBrightness,
        comContrast: activeCaptureCard?.angioContrast
      });
      // 避免切换ou/change重新触发下载
      contextmenuStore.resetActiveMenu();
      break;
    }
    case ContainerNameEnum.SlowBScanMain: {
      if (
        path === PageRoute.Angiography ||
        path === PageRoute.AngioRetinaEnhanced
      ) {
        downloadBscanImage({
          captureKey: analysisCommonStore.captureKey,
          axis: AxisEnum.SLOW,
          smartBC: angioStore.slowBscanMainSmartBC,
          index: analysisCommonStore.y,
          bscanProcessorType: angioStore.bscanProcessorType,
          comBright: angioStore.slowBscanBrightness,
          comContrast: angioStore.slowBscanContrast
        });
        return;
      }

      const { activeCaptureCard } = analysisMultipleCommonStore;
      if (captureKey !== activeCaptureCard?.captureKey) return;

      downloadBscanImage({
        captureKey: activeCaptureCard?.captureKey as string,
        axis: AxisEnum.SLOW,
        smartBC: activeCaptureCard?.slowBscanMainSmartBC as number,
        index: activeCaptureCard?.y as number,
        bscanProcessorType: activeCaptureCard?.bscanProcessorType as string,
        comBright: activeCaptureCard?.slowBscanBrightness,
        comContrast: activeCaptureCard?.slowBscanContrast
      });
      // 避免切换ou/change重新触发下载
      contextmenuStore.resetActiveMenu();
      break;
    }
    case ContainerNameEnum.SlowBScanAttach:
      downloadBscanImage({
        captureKey: analysisCommonStore.captureKey,
        axis: AxisEnum.SLOW,
        smartBC: angioStore.slowBscanAttachSmartBC,
        index: analysisCommonStore.y,
        bscanProcessorType: angioStore.bscanProcessorType,
        comBright: angioStore.fastBscanBrightness,
        comContrast: angioStore.fastBscanContrast
      });
      break;
    case ContainerNameEnum.FastBScan:
      downloadBscanImage({
        captureKey: analysisCommonStore.captureKey,
        axis: AxisEnum.FAST,
        smartBC: angioStore.fastBscanSmartBC,
        index: analysisCommonStore.x,
        bscanProcessorType: angioStore.bscanProcessorType,
        comBright: angioStore.fastBscanBrightness,
        comContrast: angioStore.fastBscanContrast
      });
      break;
    case ContainerNameEnum.LineScanSLO: {
      if (path === PageRoute.LineScan) {
        downloadSloImage(
          analysisCommonStore.captureKey,
          lineScanStore.sloSmartBC,
          lineScanStore.sloBrightness,
          lineScanStore.sloContrast
        );
        return;
      }
      const { activeCaptureCard } = analysisMultipleCommonStore;
      if (captureKey !== activeCaptureCard?.captureKey) return;

      downloadSloImage(
        activeCaptureCard?.captureKey as string,
        activeCaptureCard?.sloSmartBC as number,
        activeCaptureCard?.sloBrightness,
        activeCaptureCard?.sloContrast
      );
      // 避免切换ou/change重新触发下载
      contextmenuStore.resetActiveMenu();
      break;
    }
    case ContainerNameEnum.LineScanBscan: {
      if (path === PageRoute.LineScan) {
        downloadBscanImage({
          captureKey: analysisCommonStore.captureKey,
          axis: AxisEnum.SLOW,
          smartBC: lineScanStore.bscanSmartBC,
          index: lineScanStore.activeSlice,
          bscanProcessorType: lineScanStore.bscanProcessorType,
          corrected: lineScanStore.corrected,
          comBright: lineScanStore.bscanBrightness,
          comContrast: lineScanStore.bscanContrast
        });
        return;
      }

      const { activeCaptureCard } = analysisMultipleCommonStore;
      if (captureKey !== activeCaptureCard?.captureKey) return;

      downloadBscanImage({
        captureKey: activeCaptureCard?.captureKey as string,
        axis: AxisEnum.SLOW,
        smartBC: activeCaptureCard?.bscanSmartBC as number,
        index: activeCaptureCard?.activeSlice as number,
        bscanProcessorType: activeCaptureCard?.bscanProcessorType,
        comBright: activeCaptureCard?.bscanBrightness,
        comContrast: activeCaptureCard?.bscanContrast
        // corrected: lineScanStore.corrected
      });

      contextmenuStore.resetActiveMenu();
      break;
    }
    case ContainerNameEnum.MosaicProj:
      downloadMosaicImage({
        captureKey: analysisCommonStore.captureKey,
        angioLayer: mosaicStore.activeLayerType,
        enhanceBool: mosaicStore.enhance,
        smartBC: mosaicStore.smartBC,
        comBright: mosaicStore.mosaicBrightness,
        comContrast: mosaicStore.mosaicContrast,
        imageType:
          path === PageRoute.MosaicAngioRetinaEnhanced
            ? IMAGE_TYPE.EnhanceAngioMosaic
            : IMAGE_TYPE.AngioMosaic
      });
      break;
    case ContainerNameEnum.MosaicOctProj:
      downloadOctImage({
        captureKey: analysisCommonStore.captureKey,
        smartBC: mosaicStore.smartBC,
        projColor: mosaicStore.octProcessorType,
        octLayer: Number(mosaicStore.activeLayerType),
        isMosaic: 1,
        comBright: mosaicStore.mosaicBrightness,
        comContrast: mosaicStore.mosaicContrast
      });
      break;
    // 量化图下载
    case ContainerNameEnum.AdvancedSegQuantize:
      downloadQuantizeImage(
        analysisCommonStore.captureKey,
        advancedSegStore.quantizationValue,
        advancedSegStore.algorithm
      );
      break;
    case ContainerNameEnum.AdvancedSegBscan:
      downloadBscanImage({
        captureKey: analysisCommonStore.captureKey,
        axis: AxisEnum.SLOW,
        smartBC: advancedSegStore.bscanSmartBC,
        index: analysisCommonStore.y,
        bscanProcessorType: advancedSegStore.bscanProcessorType,
        comBright: advancedSegStore.bscanBrightness,
        comContrast: advancedSegStore.bscanContrast
      });
      break;
    case ContainerNameEnum.ThicknessMap:
      downloadThicknessMapImage({
        captureKey: analysisCommonStore.captureKey,
        editSurf: editLayersStore.editSurface,
        refSurf: editLayersStore.refSurface
      });
      break;
    case ContainerNameEnum.StructuralProjOct:
      downloadOctImage({
        captureKey: analysisCommonStore.captureKey,
        smartBC: structuralProjStore.octSmartBC,
        projColor: structuralProjStore.octProcessorType,
        octLayer: Number(structuralProjStore.layerType),
        projType: structuralProjStore.projType,
        comBright: structuralProjStore.octBrightness,
        comContrast: structuralProjStore.octContrast
      });
      break;
    case ContainerNameEnum.OCTViewer: {
      downloadOctImage({
        captureKey: analysisCommonStore.captureKey,
        smartBC: editLayersStore.octSmartBC,
        projColor: editLayersStore.octProcessorType,
        editSurf: editLayersStore.editSurface,
        refSurf: editLayersStore.refSurface
      });
      break;
    }
    case ContainerNameEnum.OctSlowBscan:
      downloadBscanImage({
        captureKey: analysisCommonStore.captureKey,
        axis: AxisEnum.SLOW,
        smartBC: structuralProjStore.slowBscanSmartBC,
        index: analysisCommonStore.y,
        bscanProcessorType: structuralProjStore.bscanProcessorType,
        corrected: path === PageRoute.AsStructuralProj ? 0 : undefined,
        comBright: structuralProjStore.slowBscanBrightness,
        comContrast: structuralProjStore.slowBscanContrast
      });
      break;
    case ContainerNameEnum.OctFastBscan:
      downloadBscanImage({
        captureKey: analysisCommonStore.captureKey,
        axis: AxisEnum.FAST,
        smartBC: structuralProjStore.fastBscanSmartBC,
        index: analysisCommonStore.x,
        bscanProcessorType: structuralProjStore.bscanProcessorType,
        corrected: path === PageRoute.AsStructuralProj ? 0 : undefined,
        comBright: structuralProjStore.fastBscanBrightness,
        comContrast: structuralProjStore.fastBscanBrightness
      });
      break;
    case ContainerNameEnum.ManualFastBscan:
      downloadBscanImage({
        captureKey: analysisCommonStore.captureKey,
        axis: AxisEnum.FAST,
        smartBC: editLayersStore.fastBscanSmartBC,
        index: editLayersStore.x,
        bscanProcessorType: editLayersStore.bscanProcessorType,
        corrected: path === PageRoute.AsStructuralProj ? 0 : undefined
      });
      break;
    case ContainerNameEnum.CubeCscan:
      downloadCscanImage({
        captureKey: analysisCommonStore.captureKey,
        cscanType: 1,
        surfShift: cubeStore.surfShiftVal,
        cscanSurf: cubeStore.cscanSurfVal,
        surfType: cubeStore.surfTypeVal,
        smartBC: cubeStore.cscanSmartBC,
        smartPosX: cubeStore.smartPosX,
        smartPosY: cubeStore.smartPosY,
        comBright: cubeStore.cscanBrightness,
        comContrast: cubeStore.cscanContrast
      });
      break;
    case ContainerNameEnum.CubeSlowBscan:
      downloadBscanImage({
        captureKey: analysisCommonStore.captureKey,
        axis: AxisEnum.SLOW,
        smartBC: cubeStore.slowBscanSmartBC,
        index: analysisCommonStore.y,
        bscanProcessorType: cubeStore.bscanProcessorType,
        corrected: path === PageRoute.AsCube ? 0 : undefined,
        comBright: cubeStore.slowBscanBrightness,
        comContrast: cubeStore.slowBscanContrast
      });
      break;
    case ContainerNameEnum.CubeFastBscan:
      downloadBscanImage({
        captureKey: analysisCommonStore.captureKey,
        axis: AxisEnum.FAST,
        smartBC: cubeStore.fastBscanSmartBC,
        index: analysisCommonStore.y,
        bscanProcessorType: cubeStore.bscanProcessorType,
        corrected: path === PageRoute.AsCube ? 0 : undefined,
        comBright: cubeStore.fastBscanBrightness,
        comContrast: cubeStore.fastBscanContrast
      });
      break;
    case ContainerNameEnum.ManualSLO: {
      downloadSloImage(
        analysisCommonStore.captureKey,
        editLayersStore.sloSmartBC
      );
      break;
    }
    default:
      throw new Error(
        `in handleSaveImage function, no such container: ${targetName}`
      );
  }
};
const saveImageStore = useSaveImageStoreHook();
const angioLayerStore = useAngioLayerStoreHook();
const angioStore = useAngioStoreHook();
const structuralProjStore = useStructuralProjStoreHook();
// Save B-scan+Angio
export const handleSaveBscanImages = async ({
  el,
  targetName,
  classNameType,
  captureKey
}: {
  el: HTMLElement;
  targetName: ContainerNameEnum;
  classNameType: SaveImagesClassNameEnum;
  captureKey?: string;
}) => {
  const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
  if (
    captureKey &&
    captureKey !== analysisMultipleCommonStore.activeCaptureCard?.captureKey
  )
    return;
  setMaskContentStatus(true);
  const saveImageStore = useSaveImageStoreHook();
  const angioStore = useAngioStoreHook();
  const advancedSegStore = useAdvancedSegStoreHook();
  const structuralProjStore = useStructuralProjStoreHook();
  const octLayerStore = useOCTLayerStoreHook();

  angioStore.setbscanZooming(true);
  advancedSegStore.setbscanZooming(true);
  structuralProjStore.setbscanZooming(true);
  await saveImageStore.setBscanWidth(el);
  saveImageStore.targetName = COMPONENTNAME_SAVE[targetName];
  classNameType === SaveImagesClassNameEnum.OCT &&
    (saveImageStore.showSloBscan = true);
  classNameType === SaveImagesClassNameEnum.Angio &&
    (saveImageStore.showAngioBscan = true); //触发组件渲染
  saveImageStore.setClassNameType(classNameType);
  await nextTick();
};

let imageCallbackList: [] = [];
function getList(): [] {
  return router?.currentRoute.value.path === PageRoute.Angiography
    ? ANGIO_LAYER_THUMBNAIL_LIST
    : router?.currentRoute.value.path === PageRoute.StructuralProjection
    ? StructuralProj_THUMBNAIL_LIST
    : router?.currentRoute.value.path === PageRoute.LineScan
    ? intToArray(analysisCommonStore.dim_slow)
    : ANGIO_RETINA_ENHANCED_THUMBNAIL_LIST;
}
export const handleDownloadBscanImages = async (
  componentName: ContainerNameEnum
) => {
  const saveImageStore = useSaveImageStoreHook();
  const octLayerStore = useOCTLayerStoreHook();
  const list = getList();

  !imageCallbackList.includes(componentName) &&
    imageCallbackList.push(componentName);
  // await new Promise(resolve => setTimeout(resolve, 0));

  if (imageCallbackList.length === 2) {
    const imageEl = document.querySelector(
      `.${saveImageStore.classNameType}-bscan-container`
    ) as HTMLElement;
    const scale = 2; // 提高清晰度的比例
    const width = imageEl.clientWidth * scale;
    const height = imageEl.scrollHeight * scale;

    if (window.isAllSaveImages) {
      domtoimage
        .toBlob(imageEl, {
          width: width,
          height: height,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: imageEl.clientWidth + "px",
            height: imageEl.scrollHeight + "px"
          }
        })
        .then(async imageUrl => {
          if (
            router.currentRoute.value.path === PageRoute.StructuralProjection
          ) {
            saveImageStore.showSloBscan = false;
          } else {
            saveImageStore.showAngioBscan = false;
          }
          imageCallbackList = [];
          captureImageBlobs.push(imageUrl);
          if (captureImageBlobs.length === list.length) {
            downloadAllImages();
          } else {
            // saveImageStore.setClassNameType("angio");
            i++;
            if (
              router.currentRoute.value.path === PageRoute.StructuralProjection
            ) {
              octLayerStore.setLayerType(list[i].value);
              octLayerStore.setLayerName(list[i].name);
              await structuralProjStore.getSurfaces();
            } else if (router.currentRoute.value.path === PageRoute.LineScan) {
              lineScanStore.setActiveBscanSlice(i);
            } else {
              angioLayerStore.setAngioLayerType(list[i].value);
              angioLayerStore.setAngioLayerName(list[i].name);
              await angioStore.getPosteriorSurface();
            }
            await nextTick();
            if (router.currentRoute.value.path === PageRoute.LineScan) {
              //结构投射和线扫描图 保存所有图片
              saveImageStore.showSloBscan = true;
            } else {
              // 血管成像页 和 增强显示页
              saveImageStore.showAngioBscan = true;
            }
          }
        });
    } else {
      domtoimage
        .toPng(imageEl, {
          width: width,
          height: height,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: imageEl.clientWidth + "px",
            height: imageEl.scrollHeight + "px"
          }
        })
        .then(async (imageUrl: string) => {
          await addScreenshotWatermark({
            url: imageUrl,
            scale,
            width,
            height,
            type:
              saveImageStore.classNameType === SaveImagesClassNameEnum.Angio
                ? "Angio_B-Scan"
                : "SLO_B-Scan"
          });
        })
        .finally(() => {
          imageCallbackList = [];
          saveImageStore.showAngioBscan = false;
          saveImageStore.showSloBscan = false;
          setMaskContentStatus(false);
          window.isSaveImages = false;
        });
    }
  }
};

// Save All B-scan+Angio
let captureImageBlobs: [] = [];
export const handleSaveAllBscanOct = async (
  el: HTMLElement,
  targetName: ContainerNameEnum
) => {
  saveImageStore.showSloBscan = false;
  const maskContentStore = useMaskContentStoreHook();
  const list = intToArray(analysisCommonStore.dim_slow);
  window.isSaveImages = true;
  window.isAllSaveImages = true;
  // 开启长下载loading
  setMaskContentStatus(true, true);
  maskContentStore.startProcess();
  await saveImageStore.setBscanWidth(el);
  saveImageStore.targetName = COMPONENTNAME_SAVE[targetName];
  lineScanStore.setActiveBscanSlice(0);
  saveImageStore.setClassNameType(SaveImagesClassNameEnum.OCT);
  saveImageStore.showSloBscan = true;
  // await nextTick();
};
export const handleSaveAllBscanAngio = async (
  el: HTMLElement,
  targetName: ContainerNameEnum
) => {
  const octLayerStore = useOCTLayerStoreHook();
  const maskContentStore = useMaskContentStoreHook();
  const list = getList();
  window.isSaveImages = true;
  window.isAllSaveImages = true;
  // 开启长下载loading
  setMaskContentStatus(true, true);
  maskContentStore.startProcess();
  angioStore.setbscanZooming(true);
  await saveImageStore.setBscanWidth(el);
  saveImageStore.setAngioLayer(
    angioLayerStore.activeAngioLayerType,
    angioLayerStore.activeAngioLayerName
  );
  saveImageStore.targetName = COMPONENTNAME_SAVE[targetName];

  if (router.currentRoute.value.path === PageRoute.StructuralProjection) {
    saveImageStore.setClassNameType(SaveImagesClassNameEnum.SLO);
    octLayerStore.setLayerType(list[0].value);
    octLayerStore.setLayerName(list[0].name);
    await structuralProjStore.getSurfaces();
    saveImageStore.showSloBscan = true;
  } else {
    saveImageStore.setClassNameType(SaveImagesClassNameEnum.Angio);
    angioLayerStore.setAngioLayerType(list[0].value);
    angioLayerStore.setAngioLayerName(list[0].name);
    await angioStore.getPosteriorSurface();
    saveImageStore.showAngioBscan = true;
  }
};
const captureImage = (imageEl: any) => {
  const scale = 2; // 提高清晰度的比例
  const width = imageEl.clientWidth * scale;
  const height = imageEl.scrollHeight * scale;
  return domtoimage
    .toBlob(imageEl, {
      width: width,
      height: height,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: imageEl.clientWidth + "px",
        height: imageEl.scrollHeight + "px"
      }
    })
    .then(async (imageUrl: string) => {
      captureImageBlobs.push(imageUrl);
    });
};
const downloadAllImages = async () => {
  const saveImageStore = useSaveImageStoreHook();
  const list = getList();
  let type =
    router.currentRoute.value.path === PageRoute.Angiography
      ? MULTIPLE_IMAGE_TYPE.Angio
      : router.currentRoute.value.path === PageRoute.StructuralProjection
      ? MULTIPLE_IMAGE_TYPE.StructuralProj
      : router?.currentRoute.value.path === PageRoute.LineScan
      ? MULTIPLE_IMAGE_TYPE.LineScan
      : MULTIPLE_IMAGE_TYPE.EnhancedAngio;

  try {
    const zip = new JSZip();
    const bloblist: Blob[] = await addAllWatermark(captureImageBlobs as Blob[]);
    [...bloblist].forEach((blob: Blob, index: number) => {
      if (router?.currentRoute.value.path === PageRoute.LineScan) {
        zip.file(getImageName(`${type}_${index}`), blob);
      } else {
        zip.file(
          getImageName(`${type}_${VueI18n(list[index].labelKey)}`),
          blob
        );
      }
    });
    // 生成 ZIP 文件并提供下载
    zip
      .generateAsync({ type: "blob" })
      .then(function (content) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${getZipFileName(type, true)}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(function (error) {
        console.error("Error generating ZIP file: ", error);
      });
  } catch (err) {
    console.error(
      "Error occured in function downloadMultiImages in image.ts file.",
      err
    );
  }
  if (router?.currentRoute.value.path === PageRoute.LineScan) {
    lineScanStore.setActiveBscanSlice(window.originSlice);
  } else {
    angioLayerStore.setAngioLayerType(saveImageStore.originAngioLayer);
    angioLayerStore.setAngioLayerName(saveImageStore.originAngioLayerName);
    angioStore.getPosteriorSurface();
  }
  window.isAllSaveImages = false;
  window.isSaveImages = false;
  i = 0;
  captureImageBlobs = [];
  saveImageStore.showAngioBscan = false;
  saveImageStore.showSloBscan = false;
  setMaskContentStatus(false, true);
};
