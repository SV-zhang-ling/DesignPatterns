import { http } from "@/utils/http";
import { vApi } from "./common";
import { ResponseTypeEnum } from "@/enums";
import {
  SLOImageParamsType,
  OCTImageParamsType,
  BscanImageParamsType,
  AngioImageParamsType,
  QuantizeImageParamsType,
  CaptureThumbnailParams,
  ThicknessImageParamsType,
  CscanImageParams
} from "./types";

/**
 * get angio projection iamge
 */
export const getProjectionImage = (params: AngioImageParamsType) =>
  http.get(
    vApi("/capture/angio/projection"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB
    }
  );

/**
 * get slo/csso image
 */
export const getSloImage = (params: SLOImageParamsType) =>
  http.get(
    vApi("/capture/slo"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB
    }
  );

/**
 * get oct image
 */
export const getOctImage = (params: OCTImageParamsType) =>
  http.get(
    vApi("/capture/oct/projection"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB
    }
  );
/**
 * get thickness image
 */
export const getThicknessImage = (params: ThicknessImageParamsType) =>
  http.get(
    vApi("/analysis/thickness/map"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB
    }
  );

/**
 * get as thickness image
 */
export const getAsThicknessImage = (params: ThicknessImageParamsType) =>
  http.get(
    vApi("/analysis/anterior/thickness/map"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB
    }
  );

/**
 * get bscan image
 */
export const getBscanImage = (params: BscanImageParamsType) =>
  http.get(
    vApi("/capture/oct/bscan"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB
    }
  );

/**
 * get quantize vessel image
 */
export const getChVesselQuantizeImage = (params: QuantizeImageParamsType) =>
  http.get(
    vApi("/analysis/chvessel/map"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB
    }
  );

/**
 * get quantize srf image
 */
export const getSRFQuantizeImage = (params: QuantizeImageParamsType) =>
  http.get(
    vApi("/analysis/srf/map"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB
    }
  );

/**
 * get capture thumbnail image
 */
export const getCaptureThumbnailImage = (params: CaptureThumbnailParams) =>
  http.get(
    vApi("/capture/thumbnail"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB,
      beforeResponseCallback() {
        // console.log(response.headers);
      }
    }
  );

/**
 * get cscan image
 */
export const getCscanImage = (params: CscanImageParams) =>
  http.get(
    vApi("/capture/oct/cscan"),
    { params },
    {
      responseType: ResponseTypeEnum.BLOB
    }
  );
