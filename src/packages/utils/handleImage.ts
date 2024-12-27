import { ProcessorFnType } from "../types";
import { ContextmenuTypeEnum } from "@/enums";
import { doLogout } from "@/utils/auth";
import { de } from "element-plus/es/locale";

export const handleBscanTransform = (
  matrix: number[],
  aspectRatioFactor: number
) =>
  matrix.map((value, index) =>
    index === 1 ? value * aspectRatioFactor : value
  );
// 对后台返回的仿射矩阵调整顺序适配web css3 Matrix
export const reverseMatrix = ([a, b, c, d, e, f]: number[]) => [
  a,
  d,
  b,
  e,
  c,
  f
];
export const initialSize = (
  element: HTMLCanvasElement,
  width: number,
  height: number
) => {
  element.width = width;
  element.height = height;
};
export const transform = (
  element: HTMLElement | SVGElement,
  matrix: number[]
) => {
  element.style.transform = "matrix(" + reverseMatrix(matrix).join(", ") + ")";
  // 当bscan设置了transform之后，获取 transform后的独立渲染块BFC的宽和高
};
// 修改image.onload为promise,优化代码逻辑为同步代码编写模式，避免地狱嵌套
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = error => {
      reject(error);
      // doLogout();
    };
    image.src = src;
  });
};

export const gray: ProcessorFnType = mat => {
  const dst = new cv.Mat();
  cv.cvtColor(mat, dst, cv.COLOR_RGBA2GRAY, 0);
  // 灰度图
  // 联调时再根据实际返回图像定义灰度图处理方式
  return dst;
};

export const inverse: ProcessorFnType = mat => {
  // 反色图
  cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
  mat = cv.revertColor(mat);
  return mat;
};

export const classic: ProcessorFnType = mat => {
  cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
  // 经典图
  const lut = cv.createColorTable(cv.ColorMap_Classic);
  // 应用LUT
  const dst = cv.applyColorMap(mat, lut);
  return dst;
};

export const hot: ProcessorFnType = mat => {
  cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
  // 经典图
  const lut = cv.createColorTable(cv.ColorMap_Hot);
  // 应用LUT
  const dst = cv.applyColorMap(mat, lut);
  return dst;
};

export const rainbow: ProcessorFnType = mat => {
  cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY, 0);
  // 彩虹色图
  const lut = cv.createColorTable(cv.ColorMap_Rainbow);
  // 应用LUT
  const dst = cv.applyColorMap(mat, lut);
  return dst;
};

export interface ProcessorMapType {
  [key: string]: ProcessorFnType;
}

export const processorMap: Readonly<ProcessorMapType> = {
  [ContextmenuTypeEnum.Gray]: gray,
  [ContextmenuTypeEnum.Inverse]: inverse,
  [ContextmenuTypeEnum.Hot]: hot,
  [ContextmenuTypeEnum.Rainbow]: rainbow,
  [ContextmenuTypeEnum.Classic]: classic
};

export const processImage = (
  mat: Mat,
  processorType: ContextmenuTypeEnum | undefined
): Mat => {
  if (!mat || !processorType) return mat;

  if (!Object.keys(processorMap).includes(processorType)) {
    return mat;
  }

  // 验证 processorType 是否存在于 processorMap 中
  if (!Object.prototype.hasOwnProperty.call(processorMap, processorType)) {
    console.warn(`Processor not found for type: ${processorType}`);
    return mat;
  }

  const processor = processorMap[processorType];
  if (typeof processor !== "function") {
    console.warn(`Invalid processor function for type: ${processorType}`);
    return mat;
  }

  // 处理图像
  try {
    const dst = processor(mat);
    return dst;
  } catch (error) {
    console.error(`Error processing image with type: ${processorType}`, error);
    return mat;
  }
};
