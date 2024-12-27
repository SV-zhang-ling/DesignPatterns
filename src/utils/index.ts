import LocalStorageUtil from "@/utils/localStorageUtil";
import { toDateString } from "xe-utils";
import * as Protocol from "./protocol";
import {
  ORIGIN_DATE_FORMAT,
  ANGIO_LAYER_THUMBNAIL_LIST,
  ANGIO_RETINA_ENHANCED_THUMBNAIL_LIST,
  StructuralProj_THUMBNAIL_LIST
} from "@/utils/constant";
import { AnalysisModeEnum, MULTIPLE_IMAGE_TYPE } from "@/enums";
import { PageRoute } from "./route";
import {
  STANDARD_CN_DATETIME_FORMAT,
  STANDARD_EN_DATETIME_FORMAT,
  STANDARD_CN_DATE_FORMAT,
  STANDARD_EN_DATE_FORMAT
} from "@/utils/constant";
import { MeasureWithCapture } from "@/views/analysis/store/measureCommon";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ts对yml文件对导入导出没有语法支持
import watermarkSvgUrl from "@/assets/icons/company-logo.svg";

const { VUE_APP_VANGOGH_VERSION, VUE_APP_BASE_API_URL } = process.env;
const OTHER_MEASURE_TYPE = ["Quantize", "Mosaic", "Oct", "Cscan"];

// forbid the default contextmenu when right click on page
export const forbidBrowserDefaultContextmenu = () => {
  window.addEventListener("contextmenu", (event: MouseEvent) => {
    event.preventDefault();
  });
};

// hide all contextmenu
export const hideAllContextmenu = () => {
  [...document.querySelectorAll(".contextmenu")].forEach((item: Element) => {
    const ele = item as HTMLElement;
    ele.style.display = "none";
  });
};

// hide context menu when click other areas
export const removeContextmenuHandler = () => {
  window.addEventListener("click", () => {
    hideAllContextmenu();
  });
  window.addEventListener("mousewheel", () => {
    // 鼠标滚轮滚动时，隐藏右键菜单
    hideAllContextmenu();
  });
};

// get the default language
export const getDefaultLang = (): string => {
  return LocalStorageUtil.getItem("lang") || navigator.language || "en";
};

// return formatted date string
export const getFormattedDate = (date: string | number): string => {
  return toDateString(date, ORIGIN_DATE_FORMAT);
};

// 获取给定协议的双眼和对比的分析页面列表
export const getAnalysisListByMode = (
  protocol: string | undefined,
  mode: string
) => {
  if (mode !== AnalysisModeEnum.OU && mode !== AnalysisModeEnum.Change) return;

  if (Protocol.isMosaicProtocol(protocol)) {
    // Mosaic protocol has no ou or change pages.
    return [];
  }

  if (!Protocol.isAnteriorScan(protocol)) {
    // posterior protocols
    if (Protocol.isLineScanProtocol(protocol)) {
      return [
        {
          labelKey: "analysis.posteriorBScan", // Line scan
          value: "posteriorBScanMultiple",
          path: PageRoute.MultipleLineScan
        }
      ];
    }
    if (Protocol.isAngioProtocol(protocol)) {
      return [
        {
          labelKey: "analysis.angiography", // Angiography
          value: "angiographyMultiple",
          path: PageRoute.MultipleAngio
        }
      ];
    }
  }

  // anterior protocols
  return [];
};

// get the analysis pages according to the protocol
export const getAnalysisList = (protocol: string | undefined) => {
  if (Protocol.isMosaicProtocol(protocol)) {
    return [
      {
        labelKey: "analysis.mosaic", // Mosaic page
        value: "mosaic",
        path: PageRoute.Mosaic
      },
      {
        labelKey: "analysis.angioRetinaEnhanced", // Mosaic Angio Retina Enhanced
        value: "mosaicAngioRetinaEnhanced",
        path: PageRoute.MosaicAngioRetinaEnhanced
      },
      {
        labelKey: "analysis.structuralProjection", // Mosaic Structural Projection
        value: "mosaicStructuralProjection",
        path: PageRoute.MosaicStructuralProj
      }
    ];
  }

  // Biometry 【BiometryPro（暂时不开放）】
  if (Protocol.isBiometryProtocol(protocol)) {
    return [
      {
        labelKey: "analysis.anteriorBScan",
        value: "anteriorBScan",
        path: PageRoute.LineScan
      }
    ];
  }

  // Scleral or Fundus or BiometryPro
  if (
    Protocol.isScleralScanProtocol(protocol) ||
    Protocol.isFundusProtocol(protocol) ||
    Protocol.isBiometryProProtocol(protocol)
  ) {
    return;
  }

  if (!Protocol.isAnteriorScan(protocol)) {
    // posterior protocols
    if (Protocol.isLineScanProtocol(protocol)) {
      return [
        {
          labelKey: "analysis.posteriorBScan", // Line scan
          value: "posteriorBScan",
          path: PageRoute.LineScan
        }
      ];
    }
    if (Protocol.isAngioProtocol(protocol)) {
      return [
        {
          labelKey: "analysis.cube", // cube
          value: "cube",
          path: PageRoute.Cube
        },
        {
          labelKey: "analysis.angiography", // Angiography
          value: "angiography",
          path: PageRoute.Angiography
        },
        {
          labelKey: "analysis.angioRetinaEnhanced", // Angio Retina Enhanced
          value: "angioRetinaEnhanced",
          path: PageRoute.AngioRetinaEnhanced
        },
        {
          labelKey: "analysis.posteriorBScan",
          value: "posteriorBScan",
          path: PageRoute.LineScan
        },
        {
          labelKey: "analysis.structuralProjection", // Structural Projection
          value: "structuralProjection",
          path: PageRoute.StructuralProjection
        },
        {
          labelKey: "analysis.advancedSeg", // Advanced Segmentation
          value: "advancedSeg",
          path: PageRoute.AdvancedSeg
        }
      ];
    }
    if (Protocol.isCubeProtocol(protocol)) {
      return [
        {
          labelKey: "analysis.cube", // cube
          value: "cube",
          path: PageRoute.Cube
        },
        {
          labelKey: "analysis.posteriorBScan",
          value: "posteriorBScan",
          path: PageRoute.LineScan
        },
        {
          labelKey: "analysis.structuralProjection", // Structural Projection
          value: "structuralProjection",
          path: PageRoute.StructuralProjection
        },
        {
          labelKey: "analysis.advancedSeg",
          value: "advancedSeg",
          path: PageRoute.AdvancedSeg
        }
      ];
    }
    if (Protocol.isONHScanProtocol(protocol)) {
      return [
        {
          labelKey: "analysis.cube", // cube
          value: "cube",
          path: PageRoute.Cube
        },
        {
          labelKey: "analysis.posteriorBScan",
          value: "posteriorBScan",
          path: PageRoute.LineScan
        },
        {
          labelKey: "analysis.structuralProjection", // Structural Projection
          value: "structuralProjection",
          path: PageRoute.StructuralProjection
        },
        {
          labelKey: "analysis.advancedSeg", // Advanced Segmentation
          value: "advancedSeg",
          path: PageRoute.AdvancedSeg
        }
      ];
    }
  } else {
    // anterior protocols
    if (Protocol.isLineScanProtocol(protocol)) {
      return [
        {
          labelKey: "analysis.anteriorBScan", // AS B-scan
          value: "anteriorBScan",
          path: PageRoute.LineScan
        }
      ];
    }

    if (
      Protocol.isAngioProtocol(protocol) ||
      Protocol.isCubeProtocol(protocol)
    ) {
      return [
        {
          labelKey: "analysis.cube", // cube
          value: "asCube",
          path: PageRoute.AsCube
        },
        {
          labelKey: "analysis.structuralProjection", // AS Structural Projection
          value: "asStructuralProj",
          path: PageRoute.AsStructuralProj
        }
      ];
    }
  }
};

/**
 * 对请求参数对象进行拼接，返回形式为：k1=v1&k2=v2&k3=v3
 */
export const buildQueryString = (params: object) => {
  const queryString = Object.keys(params)
    .map((key: string) => `${key}=${params[key as keyof typeof params]}`)
    .join("&");

  return queryString.length > 0 ? queryString : "";
};

// generate an int array fron 0 to a given integer
export const intToArray = (n: number) => {
  const ret = [];
  for (let i = 0; i < n; i++) {
    ret.push(i);
  }
  return ret;
};

// 关闭浏览器提示
export const beforeCloseNavigator = () => {
  window.addEventListener("beforeunload", function (event) {
    // 使用 sendBeacon 发送数据到服务器
    const measureGlobalData = sessionStorage.getItem("measureGlobalData");
    if (measureGlobalData === "null" || !measureGlobalData) return;
    const global = getPostRequestData(JSON.parse(measureGlobalData));
    for (const key in global) {
      const params: any = {
        captureKey: key,
        userInputData: global[key]
      };
      navigator.sendBeacon(
        `${VUE_APP_BASE_API_URL}/${VUE_APP_VANGOGH_VERSION}/capture/userinput/save`,
        params
      );
    }
  });
  window.addEventListener("unload", function (event) {
    // 使用 sendBeacon 发送数据到服务器
    const measureGlobalData = sessionStorage.getItem("measureGlobalData");
    if (measureGlobalData === "null" || !measureGlobalData) return;
    const global = getPostRequestData(JSON.parse(measureGlobalData));

    for (const key in global) {
      const params: any = {
        captureKey: key,
        userInputData: global[key]
      };
      navigator.sendBeacon(
        `${VUE_APP_BASE_API_URL}/${VUE_APP_VANGOGH_VERSION}/capture/userinput/save`,
        params
      );
    }
  });
};
export const getPostRequestData = (data: MeasureWithCapture) => {
  const globalData: MeasureWithCapture = {};
  for (const key in data) {
    const singleData = data[key];
    for (const k in singleData) {
      if (OTHER_MEASURE_TYPE.includes(k)) {
        delete singleData[k];
      }
    }
    globalData[key] = singleData;
  }
  return globalData;
};

export const getThumbnailListByType = (type: string) => {
  let thumbnailList: LabelKeyValueType[] = [];
  switch (type) {
    case MULTIPLE_IMAGE_TYPE.Angio:
    case MULTIPLE_IMAGE_TYPE.AngioMosaic:
      thumbnailList = ANGIO_LAYER_THUMBNAIL_LIST;
      break;
    case MULTIPLE_IMAGE_TYPE.EnhancedAngio:
    case MULTIPLE_IMAGE_TYPE.EnhancedAngioMosaic:
      thumbnailList = ANGIO_RETINA_ENHANCED_THUMBNAIL_LIST.slice(0, -1);
      break;
    case MULTIPLE_IMAGE_TYPE.Projection:
    case MULTIPLE_IMAGE_TYPE.ProjectionMosaic:
      thumbnailList = StructuralProj_THUMBNAIL_LIST;
      break;
    default:
      break;
  }
  return thumbnailList;
};

/** 根据当前系统显示提起格式 */
export const getDateStandardFormat = (
  onlyDate?: boolean,
  selectDate?: boolean
) => {
  const localLan = localStorage.getItem(
    "_PicassoPersistedPrefix_lang"
  ) as string;
  if (onlyDate) {
    return JSON.parse(localLan) === "zh-CN"
      ? selectDate
        ? STANDARD_CN_DATE_FORMAT.toLocaleUpperCase()
        : STANDARD_CN_DATE_FORMAT
      : selectDate
      ? STANDARD_EN_DATE_FORMAT.toLocaleUpperCase()
      : STANDARD_EN_DATE_FORMAT;
  }
  return JSON.parse(localLan) === "zh-CN"
    ? STANDARD_CN_DATETIME_FORMAT
    : STANDARD_EN_DATETIME_FORMAT;
};

export const loadImageFromBlob = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = err => reject(err);
    const url = URL.createObjectURL(blob);
    img.src = url;
  });
};

export const loadImageFromSVG = () => {
  return new Promise((resolve, reject) => {
    const svg = new Image();
    svg.onload = () => {
      resolve(svg);
    };
    svg.onerror = err => reject(err);
    svg.src = watermarkSvgUrl;
  });
};
