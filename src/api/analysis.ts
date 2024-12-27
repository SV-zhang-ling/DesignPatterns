import { http } from "@/utils/http";
import { vApi } from "./common";
import { BaseParamsType, selectDataParamsType } from "./types.d";

/**
 * select data list
 */
export const querySelectDataList = (data?: selectDataParamsType) =>
  http.get(vApi("/capture/selectdata/list"), { params: data });

/**
 * get oct 3d data
 */
export const queryOctCscan = (data?: BaseParamsType) =>
  http.get(vApi("/capture/oct/cscan"), { params: data });
