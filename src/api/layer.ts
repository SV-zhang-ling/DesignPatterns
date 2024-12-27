import { http } from "@/utils/http";
import { vApi } from "./common";
import { ResponseTypeEnum } from "@/enums";
import {
  BaseParamsType,
  SurfaceParamsType,
  AngioLayerParamsType,
  editSurfParamsType,
  SufraceSubmitParams,
  OctLayerParamsType
} from "./types.d";

// 血流层操作
export const fetchPosteriorAngioLayer = (params: BaseParamsType) =>
  http.get(vApi("/analysis/posterior/angio/layer"), { params });

export const UpdatePosteriorAngioLayer = (params: AngioLayerParamsType) =>
  http.get(vApi("/analysis/posterior/angio/layer/update"), { params });

export const ResetPosteriorAngioLayer = (params: BaseParamsType) =>
  http.get(vApi("/analysis/posterior/angio/layer/reset"), { params });

// surface 获取
export const fetchPosteriorSurface = (params: SurfaceParamsType) =>
  http.get(
    vApi("/analysis/posterior/surface"),
    { params },
    {
      responseType: ResponseTypeEnum.Arraybuffer
    }
  );

export const fetchAnteriorSurface = (params: SurfaceParamsType) =>
  http.get(
    vApi("/analysis/anterior/surface"),
    { params },
    {
      responseType: ResponseTypeEnum.Arraybuffer
    }
  );

export const editPosteriorSurface = (data: any) =>
  http.post(vApi("/analysis/posterior/surface/edit"), { data });

export const editAnteriorSurface = (data: any) =>
  http.post(vApi("/analysis/anterior/surface/edit"), { data });

export const resetSurface = (params: BaseParamsType) =>
  http.get(vApi("/analysis/surface/reset"), { params });

export const submitSurface = (params: SufraceSubmitParams) =>
  http.get(vApi("/analysis/surface/save"), { params });

// 获取前节Surface有效区域，见https://github.com/SVisions/Picasso-Software/blob/Picasso%23U0/addAnteriorSurfUpdateDoc/Doc/Vangogh/3.26%E8%8E%B7%E5%8F%96%E5%89%8D%E8%8A%82Surface%E6%9C%89%E6%95%88%E5%8C%BA%E5%9F%9F.md
export const fetchAnteriorSurfaceMask = (params: BaseParamsType) =>
  http.get(vApi("/analysis/anterior/surface/mask"), { params });

// 获取后节结构Layer
export const fetchPosteriorOctLayer = (params: BaseParamsType) =>
  http.get(vApi("/analysis/posterior/oct/layer"), { params });

// 修改后节结构Layer
export const updatePosteriorOctLayer = (params: OctLayerParamsType) =>
  http.get(vApi("/analysis/posterior/oct/layer/update"), { params });

// 重置后节结构Layer
export const resetPosteriorOctLayer = (params: BaseParamsType) =>
  http.get(vApi("/analysis/posterior/oct/layer/reset"), { params });

// 获取前节结构Layer
export const fetchAnteriorOctLayer = (params: BaseParamsType) =>
  http.get(vApi("/analysis/anterior/oct/layer"), { params });

// 修改后节结构Layer
export const updateAnteriorOctLayer = (params: OctLayerParamsType) =>
  http.get(vApi("/analysis/anterior/oct/layer/update"), { params });

// 重置后节结构Layer
export const resetAnteriorOctLayer = (params: BaseParamsType) =>
  http.get(vApi("/analysis/anterior/oct/layer/reset"), { params });
