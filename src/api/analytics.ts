import { TrackParamsType } from "./types.d";
import { pApi } from "./common";
import { http } from "@/utils/http";
/**
 * save user interaction data
 */
export const saveTrackData = (data?: TrackParamsType) =>
  http.post(pApi("/event"), { data });
