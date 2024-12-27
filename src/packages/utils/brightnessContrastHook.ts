import { onMounted, onUnmounted, Ref } from "vue";
import { ELViewPort } from "../types";
import { ContainerNameEnum, ContextmenuTypeEnum } from "@/enums";
import * as d3 from "d3";
import { loadImage, processImage } from "@/packages/utils/handleImage";

interface ClickOptions {
  target: Ref<ELViewPort>;
  componentName?: ContainerNameEnum;
  smartBc: number;
  getBcAdjustCallback: () => {
    smartBc: number;
    brightness: number;
    contrast: number;
  };
  setBcAdjustCallback: ({ b, c }: { b: number; c: number }) => void;
}

const adjustStep = 0.1;
let isMoving = false;
let bAdjustment = 0;
let cAdjustment = 0;
let brightness = 0;
let contrast = 0;
let smartBc = 0;

const useBrightnessContrastListener = ({
  target,
  componentName,
  getBcAdjustCallback,
  setBcAdjustCallback
}: ClickOptions) => {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;
  const handleMousedown = (e: MouseEvent) => {
    const {
      smartBc: smartBcValue,
      brightness: brightnessValue,
      contrast: contrastValue
    } = getBcAdjustCallback();
    if (e.button === 1) {
      d3.select(target.value?.getViewportDom())
        .select(".coordinates")
        .classed("bc-cursor", true);
      startX = e.clientX;
      startY = e.clientY;
      isMoving = true;
      bAdjustment = 0;
      cAdjustment = 0;
      brightness = brightnessValue;
      contrast = contrastValue;
      smartBc = smartBcValue;
    }
  };

  const handleMousemove = (e: MouseEvent) => {
    if (smartBc === 1) return;
    if (isMoving) {
      endX = e.clientX;
      endY = e.clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        bAdjustment = -deltaY * adjustStep;
      } else {
        cAdjustment = deltaX * adjustStep;
      }
      setBcAdjustCallback({
        b: brightness + bAdjustment,
        c: contrast + cAdjustment
      });
    }
  };

  const handleMouseup = (e: MouseEvent) => {
    d3.select(target.value?.getViewportDom())
      .select(".coordinates")
      .classed("bc-cursor", false);
    if (smartBc === 1) return;
    if (isMoving) {
      isMoving = false;
      setBcAdjustCallback({
        b: brightness + bAdjustment,
        c: contrast + cAdjustment
      });
    }
  };

  onMounted(() => {
    const viewportDom = target.value?.getViewportDom() as HTMLDivElement;
    if (viewportDom) {
      viewportDom.addEventListener("mousedown", handleMousedown);
      viewportDom.addEventListener("mousemove", handleMousemove);
      viewportDom.addEventListener("mouseup", handleMouseup);
      viewportDom.addEventListener("mouseout", handleMouseup);
    }
  });

  onUnmounted(() => {
    const viewportDom = target.value?.getViewportDom() as HTMLDivElement;
    if (viewportDom) {
      viewportDom.addEventListener("mousedown", handleMousedown);
      viewportDom.addEventListener("mousemove", handleMousemove);
      viewportDom.addEventListener("mouseup", handleMouseup);
      viewportDom.addEventListener("mouseout", handleMouseup);
    }
  });
};

export default useBrightnessContrastListener;

export const setBcAdjust = async ({
  dom,
  src,
  b,
  c,
  processorsType
}: {
  dom: HTMLCanvasElement;
  src: string;
  b: number;
  c: number;
  processorsType?: ContextmenuTypeEnum;
}) => {
  const image = await loadImage(src);
  const mat = cv.imread(image);
  const { brightness, contrast, map } = await getNonlinearBCLUT(b, c);
  const lut = cv.matFromArray(1, 256, cv.CV_8UC1, map);
  const dst = new cv.Mat();
  if (processorsType) {
    const matDst = processImage(mat, processorsType);
    cv.LUT(matDst, lut, dst);
  } else {
    cv.LUT(mat, lut, dst);
  }
  cv.imshow(dom, dst);
  lut.delete();
  dst.delete();
  mat.delete();
  return { brightness, contrast };
};

export const getNonlinearBCLUT = (brightness: number, contrast: number) => {
  const b = Math.max(-100, Math.min(brightness, 100));
  const c = Math.max(-100, Math.min(contrast, 100));
  const lookUpTable = [];
  const gammaB = Math.pow(0.98, b);
  const gammaC = Math.pow(0.98, -c);
  for (let i = 0; i < 256; ++i) {
    let adjustC;
    const pixel1f = i / 255;
    if (pixel1f <= 0.5) adjustC = Math.pow(2 * pixel1f, gammaC) * 0.5;
    else adjustC = 1 - Math.pow(2 - 2 * pixel1f, gammaC) * 0.5;
    lookUpTable[i] = Math.max(
      0,
      Math.min(255, Math.round(Math.pow(adjustC, gammaB) * 255))
    );
  }
  return { brightness: b, contrast: c, map: lookUpTable };
};
