/**
 * @description: oculus type emum
 */
export enum OculusTypeEnum {
  OD = "OD",
  OS = "OS",
  OU = "OU"
}

/**
 * analysis page mode enum
 */
export enum AnalysisModeEnum {
  Single = "single",
  OU = "ou",
  Change = "change"
}

/**
 * ou/change max
 */
export enum SelectDataMaxEnum {
  OU = 2,
  LineChange = 2, // 最多支持6个，暂时展示2个
  AngioChange = 2 // 最多支持8个，暂时展示2个
}

/**
 * @description: patient search key emum
 */
export enum PatientSearchKeyEnum {
  LastVisitTime = "LastVisitTime", // last visit time
  Name = "Name", // patient name
  ID = "ID", // patient id
  DateOfBirth = "DateOfBirth", // patient birthday
  Gender = "Gender", // patient gender
  Comment = "Comment", // patient comment
  Protocol = "Protocol", // protocol patient has taken
  Operator = "Operator", // pateint operator
  Physician = "Physician", // pateint physician
  All = "All" // any search key contain the content
}

/**
 * @description: Gender type emum
 */
export enum GenderEnum {
  Male = "Male",
  Female = "Female",
  Other = "Other"
}

/**
 * @description: Image action type emum
 */
export enum ImageActionEnum {
  Navigation = "navigation-line",
  LayerOnBscan = "layer-on-bscan",
  LayerEdit = "layer-edit",
  AngioColor = "angio-color",
  RecogonizedContent = "recogonized-content",
  ScanLine = "scan-line",
  StarLine = "star-line"
}

// Project type enum
export enum ProjectTypeEnum {
  MEAN = 0, // 平均值
  MAX, // 最大值
  MIN, // 最小值
  SUM // 总数
}

export enum SaveImagesClassNameEnum {
  Angio = "angio",
  OCT = "slo"
}

// Contextmenu type enum
export enum ContextmenuTypeEnum {
  SaveImage = "SaveImage",
  SaveBscanSLOImage = "BscanSLO",
  SaveBscanAngioImage = "BscanAngio",
  saveAllBscanAngioImages = "AllBscanAngio",
  saveAllBscanOctImages = "AllBscanOct",
  Angio = "Angio",
  Hot = "Hot",
  Rainbow = "Rainbow",
  Gray = "Gray",
  Inverse = "Inverse",
  Classic = "Classic",
  FullScreen = "FullScreen",
  ExitFullScreen = "ExitFullScreen",
  FastBScan = "FastBScan",
  Smooth = "Smooth",
  Smooth0 = "0",
  Smooth1 = "1",
  Smooth2 = "2",
  Smooth3 = "3",
  StructuralProj = "StructuralProj",
  BScanColor = "BScanColor",
  AutoZoomBScan = "AutoZoomBScan",
  ResetView = "ResetView",
  ShowCorrectedImage = "ShowCorrectedImage",
  Ruler = "Ruler",
  Arrow = "Arrow",
  Text = "Text",
  ClearAll = "ClearAll",
  EditLayer = "EditLayer",
  Range500 = "Range500"
}

// Contextmenu target name enum
export enum ContainerNameEnum {
  AngioProj = "AngioProj",
  SloOct = "SloOct",
  SlowBScanMain = "SlowBScanMain",
  SlowBScanAttach = "SlowBScanAttach",
  FastBScan = "FastBScan",
  LineScan = "LineScan",
  StarScan = "StarScan",
  FullScope = "FullScope",
  OCTScope = "OctScope",
  LineScanSLO = "LineScanSlo",
  LineScanBscan = "LineScanBscan",
  MosaicProj = "MosaicProj",
  MosaicOctProj = "MosaicOctProj",
  AdvancedSegQuantize = "AdvancedSegQuantize",
  AdvancedSegSlo = "AdvancedSegSlo",
  AdvancedSegBscan = "AdvancedSegBscan",
  ThumbnailSLO = "ThumbnailSLO",
  ThicknessMap = "ThicknessMap",
  OCTViewer = "OCTViewer",
  ManualFastBscan = "ManualFastBscan",
  ManualSLO = "ManualSLO",
  ManualBscan = "ManualBscan",
  OctSlowBscan = "OctSlowBscan",
  OctFastBscan = "OctFastBscan",
  StructuralProjOct = "StructuralProjOct",
  CubeSlowBscan = "CubeSlowBscan",
  CubeFastBscan = "CubeFastBscan",
  CubeCscan = "CubeCscan",
  // 保存组合图
  SaveLineScanSLO = "SaveLineScanSLO",
  SaveLineScanBscan = "SaveLineScanBscan",
  SaveAngioProj = "SaveAngioProj",
  SaveSlo = "SaveSlo",
  SaveSlowBScanMain = "SaveSlowBScanMain",
  SaveSlowBScanAttach = "SaveSlowBScanAttach",
  SaveFastBScan = "SaveFastBScan",
  SaveAdvancedSegBscan = "SaveAdvancedSegBscan",
  SaveOctSlowBscan = "SaveOctSlowBscan",
  SaveOctFastBscan = "SaveOctFastBscan"
}

export enum MeasureViewTypeEnum {
  Enface = "Enface",
  CSSO = "CSSO",
  SlowBScan = "SlowBScan",
  FastBScan = "FastBScan",
  Thickness = "Thickness",
  Mosaic = "Mosaic",
  Quantize = "Quantize",
  Oct = "Oct",
  CubeCscan = "Cscan"
}

export enum MeasureTypeEnum {
  Ruler = "Rulers",
  Arrow = "Arrows",
  Text = "Texts"
}

export enum AxisEnum {
  SLOW = 0,
  FAST = 1
}

// download image file type enum
export enum IMAGE_TYPE {
  AngioProj = "Angio",
  AngioRetinaEnhanced = "EnhancedAngio",
  SLO = "SLO",
  OCT = "OCT",
  Bscan = "B-scan",
  Quantize = "Quantize",
  Thickness = "Thickness",
  Cscan = "Cscan",
  AngioMosaic = "AngioMosaic",
  EnhanceAngioMosaic = "EnhanceAngioMosaic",
  ProjectionMosaic = "ProjectionMosaic"
}

export enum MULTIPLE_IMAGE_TYPE {
  Angio = "Angio",
  EnhancedAngio = "EnhancedAngio",
  Projection = "Projection",
  AngioMosaic = "AngioMosaic",
  EnhancedAngioMosaic = "EnhancedAngioMosaic",
  ProjectionMosaic = "ProjectionMosaic",
  StructuralProj = "StructuralProj",
  LineScan = "LineScan"
}

// response type enum
export enum ResponseTypeEnum {
  BLOB = "blob",
  Arraybuffer = "arraybuffer"
}

// error code enum
export enum ErrorCodeEnum {
  UNAUTHORIZED_CODE = 401,
  SERVER_LOAD_HEAVY = 30102,
  BEING_USED = 20105,
  SERVER_BUSY = 30103,
  SAVE_USERINPUT_FAIL = 60101,
  NOT_ENOUGH_VOLUME = 60102,
  LoginError = 3010001,
  LoginLock = 3010002,
  PwdError = 3010101,
  PwdFmtError = 3010102,
  PwdFailError = 3010103,
  PwdSameError = 3010104,
  PwdUpdateError = 3010105,
  SaveSurfaceError = 20104 // 编辑分层保存失败
}

// element display enum
export enum ElDisplayEnum {
  BLOCK = "block",
  NONE = "none",
  FLEX = "flex",
  INLINE = "inline",
  INLINE_BLOCK = "inline-block"
}

// scan direction enum
export enum AxisDirectionEnum {
  SLOW = "slow",
  FAST = "fast"
}

// quantization value enum
export enum AlgorithmEnum {
  CHVessel = "0",
  SRF = "1"
}

export enum VesselEnum {
  CVI = "1",
  CVV = "0"
}

export enum SRFEnum {
  SrfIndex = "0",
  SrfThickness = "1"
}

export enum ModeTypeEnum {
  Single = -1,
  Change = 0,
  OU = 1
}
export enum SynchronizeType {
  ZoomAndMoveSync = "zoomAndMoveSync",
  xAxisLinkage = "xAxisLinkage",
  yAxisLinkage = "yAxisLinkage",
  ColorMode = "colorMode",
  bcAdjustment = "bcAdjustment"
}

export enum KeydownEnum {
  UP = "Up",
  DOWN = "Down"
}

export enum ManualLayerToolEnum {
  Edit = "Edit",
  Drag = "Drag",
  Zoom = "Zoom",
  FullScreen = "FullScreen",
  Confirm = "Confirm"
}

export enum WSMsgType {
  Default,
  Connect, //链接成功，服务器会返回connect类型消息
  Msg, // 普通字符串消息
  Disconnect, //服务器关闭返回消息
  QueryMsg // 查询
}

// 请求方法
export enum QueryType {
  GET,
  POST
}

// CScan 轴向切面获取方式
export enum CSCAN_SURF_TYPE {
  Normal = 0,
  Horizontal = 1,
  Smart = 2
}
