export type ListResult<T> = {
  code: number;
  succeed?: boolean;
  data: Array<T> | null;
};

export type GeneralResult<T> = {
  code: number;
  succeed?: boolean;
  data: T | null;
};

export type BooleanResult = {
  code: number;
  succeed?: boolean;
  data?: string;
  message?: string;
};

export interface BaseParamsType {
  captureKey: string;
}
export interface SufraceSubmitParams extends BaseParamsType {
  cancelEdit: number;
}
export interface SurfaceParamsType extends BaseParamsType {
  surf: number | string;
}
export interface editSurfParamsType extends SurfaceParamsType {
  slice: number;
  surfData: number[][];
  anchorData: number[][];
}
export interface AngioLayerParamsType extends BaseParamsType {
  angioLayer: number | string; // 血流Layer
  ceilingSurf: number | string; // Ceiling Surface Index，详见Surface Index
  ceilingShift: number | string; // ceilingSurface需要调整的um数
  floorSurf: number | string; // Floor Surface Index，详见Surface Index
  floorShift: number | string; // floorSurface需要调整的um数
}

export interface OctLayerParamsType extends BaseParamsType {
  octLayer: number | string; // OCT Layer，详见"x.5_后节Layer定义"
  ceilingSurf: number | string; // Ceiling Surface Index，详见Surface Index
  ceilingShift: number | string; // ceilingSurface需要调整的um数
  floorSurf: number | string; // Floor Surface Index，详见Surface Index
  floorShift: number | string; // floorSurface需要调整的um数
}

export interface SLOImageParamsType extends BaseParamsType {
  smartBC?: number;
  saveMode?: number;
  comBright?: number;
  comContrast?: number;
}
export interface OCTImageParamsType extends BaseParamsType {
  smartBC?: number;
  saveMode?: number;
  projType?: number;
  angioLayer?: string;
  octLayer?: number;
  projColor?: string;
  isMosaic?: number;
  corrected?: number;
  comBright?: number;
  comContrast?: number;
  editSurf?: string;
  refSurf?: string;
}

export interface ThicknessImageParamsType extends BaseParamsType {
  smartBC?: number;
  thicknessLayer?: string;
  editSurf?: string;
  refSurf?: string;
  colorMapName?: string;
}

export interface BscanImageParamsType extends SLOImageParamsType {
  slice: number;
  axis: number;
  smooth: number;
  encoder: string;
  quality: number;
  bscanColor?: string;
}

export interface AngioImageParamsType extends SLOImageParamsType {
  projType?: number;
  angioLayer: string;
  isThumb?: number;
  par?: number;
  enhance?: number;
  removeStripLine?: number;
  angioProjColor?: string;
  enhanceBool?: boolean;
  imageType?: string;
}

export interface QuantizeImageParamsType extends SLOImageParamsType {
  quantize?: string;
}

export interface CaptureThumbnailParams extends BaseParamsType {
  type: string;
  isMosaic?: boolean;
  isBiometryPro?: boolean;
  timestamp?: number;
}

export interface rulerParamsType extends BaseParamsType {
  viewerType?: string;
  smartBC?: number | undefined;
  userInputData?: any;
}
export interface selectDataParamsType extends BaseParamsType {
  selectType: number | undefined;
  sortBy?: string;
  orderBy?: string;
}

export interface CscanImageParams extends BaseParamsType {
  cscanType?: number;
  surfShift?: number;
  cscanSurf?: string;
  surfType?: number;
  smartBC?: number;
  smartPosX?: number;
  smartPosY?: number;
  comBright?: number;
  comContrast?: number;
}

export type TrackParamsType = Array<any>;
