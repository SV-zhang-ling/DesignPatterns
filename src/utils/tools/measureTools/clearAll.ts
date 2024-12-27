import * as d3 from "d3";
import { saveViewportMeasures } from "./index";
import { useAnalysisMultipleCommonStoreHook } from "@/views/analysis/store/analysisMultipleCommon";

const MEASURE_CLASS_NAMES = ["ruler-path", "arrow-path", "text-path"];

export const clearMeasureGlobalData = ({
  viewportDom,
  isStay,
  captureKey
}: {
  viewportDom: HTMLElement;
  isStay?: boolean;
  captureKey?: string;
}) => {
  const analysisMultipleCommonStore = useAnalysisMultipleCommonStoreHook();
  if (
    captureKey &&
    captureKey !== analysisMultipleCommonStore.activeCaptureCard?.captureKey
  )
    return;
  /** 清空画布原有测量工具 */
  const svg = d3.select(viewportDom).select(".coordinates");
  MEASURE_CLASS_NAMES.forEach(name => {
    const measures = svg.selectAll(`.${name}`);
    measures && measures.remove();
  });
  !isStay && saveViewportMeasures({ viewportDom, isStay });
};
