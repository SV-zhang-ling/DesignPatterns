import { http } from "@/utils/http";
import { rulerParamsType } from "./types.d";
import { vApi } from "./common";

/**
 * ruler json data list
 */
export const getMeasureList = (data?: rulerParamsType) =>
  http.get(vApi("/capture/userinput/get"), { params: data });

/**
 * save ruler data
 */
export const saveMeasureList = (data?: rulerParamsType) =>
  http.post(vApi("/capture/userinput/save"), { data });
