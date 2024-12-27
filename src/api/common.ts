import { http } from "@/utils/http";
import { BaseParamsType } from "./types.d";

const { VUE_APP_PICASSO_VERSION, VUE_APP_VANGOGH_VERSION } = process.env;

/**
 * common get full api path function
 * @param path
 * @returns
 */
export const pApi = (path: string) => `${VUE_APP_PICASSO_VERSION}${path}`;
export const vApi = (path: string) => `${VUE_APP_VANGOGH_VERSION}${path}`;

/**
 * call api to release server cache
 */
export const releaseServerCache = (data?: BaseParamsType) =>
  http.get(vApi("/capture/release"), { params: data });
