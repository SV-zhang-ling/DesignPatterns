import { http } from "@/utils/http";
import { vApi } from "./common";
import { SearchForm } from "@/views/patient/utils/patient.d";
import { BaseParamsType } from "./types.d";

/**
 * query patient list
 */
export const queryPatientList = (data?: SearchForm) =>
  http.get(vApi("/patient/list"), { params: data });

/**
 * query capture list
 */
export const queryCaptureList = (data?: SearchForm) =>
  http.get(vApi("/capture/list"), { params: data });

/**
 * query capture detail
 */
export const queryCaptureDetail = (data?: BaseParamsType) =>
  http.get(vApi("/capture/detail"), { params: data });

/**
 * update patient comment
 */
export const updatePatientComment = (params?: object) =>
  http.get(vApi("/updatepatient/comment"), { params });

/**
 * update capture comment
 */
export const updateCaptureComment = (params?: object) =>
  http.get(vApi("/updatecapture/comment"), { params });
