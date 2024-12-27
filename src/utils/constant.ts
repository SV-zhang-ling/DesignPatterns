import { ProjectTypeEnum } from "@/enums";

interface KeyValueType {
  value: string | number;
  labelKey: string;
}

export const WEBSOCKET_WORKER = "websocketWorker";

export const CAPTURE_URL_PRE = `${process.env.VUE_APP_BASE_API_URL}${process.env.VUE_APP_VANGOGH_VERSION}/capture`;
export const ANALYSIS_URL_PRE = `${process.env.VUE_APP_BASE_API_URL}${process.env.VUE_APP_VANGOGH_VERSION}/analysis`;

export const BIRTH_DATE_FORMAT = "yyyy-MM-dd";
export const ORIGIN_DATE_FORMAT = "yyyyMMdd";
export const DATETIME_FORMAT = "yyyyMMddHHmmss";
export const TARGET_DATE_FORMAT = "dd/MM/yyyy";
export const TARGET_DATETIME_FORMAT = "dd/MM/yyyy HH:mm:ss";
export const WATERMAKER_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

export const STANDARD_CN_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
export const STANDARD_EN_DATETIME_FORMAT = "dd-MM-yyyy HH:mm:ss";
export const STANDARD_CN_DATE_FORMAT = "yyyy-MM-dd";
export const STANDARD_EN_DATE_FORMAT = "dd-MM-yyyy";

// user friendly delay time
export const USER_FRIENDLY_DELAY_TIME = 100; // ms

export const getValueFromArrayByLabel = (
  keyValuePairs: KeyValueType[],
  label: string
) =>
  keyValuePairs.find(({ labelKey }: KeyValueType) => labelKey === label)?.value;
// basic company information
export const COMPANY_INFO = {
  tele: "+86 400-0379-805",
  email: "info@intalight.com"
};
export const REPORT_OCULUS_TYPE: { [key: string]: string | any } = {
  OS: "L",
  OD: "R"
};

/** 各图name与viewerType */
export const COMPONENTNAME_VIEWERTYPE: { [key: string]: string | any } = {
  AngioProj: "Enface",
  FullScope: "CSSO",
  OctScope: "CSSO",
  SlowBScanMain: "SlowBScan",
  FastBScan: "FastBScan",
  AdvancedSegBscan: "SlowBScan",
  AdvancedSegQuantize: "Quantize",
  MosaicProj: "Mosaic",
  MosaicOctProj: "Mosaic",
  StructuralProjOct: "Oct",
  OctSlowBscan: "SlowBScan",
  OctFastBscan: "FastBScan",
  OCTViewer: "Oct",
  LineScanBscan: "SlowBScan",
  LineScanSlo: "CSSO",
  SaveLineScanSLO: "CSSO",
  SaveLineScanBscan: "SlowBScan",
  SaveAngioProj: "Enface",
  SaveSlo: "CSSO",
  SaveSlowBScanMain: "SlowBScan",
  SaveFastBScan: "FastBScan",
  SaveAdvancedSegBscan: "SlowBScan",
  SaveOctSlowBscan: "SlowBScan",
  SaveOctFastBscan: "FastBScan",
  CubeSlowBscan: "SlowBScan",
  CubeFastBscan: "FastBScan",
  CubeCscan: "Cscan"
};
/** 组合图与常规图对应 */
export const COMPONENTNAME_SAVE: { [key: string]: string | any } = {
  LineScanSlo: "SaveLineScanSLO",
  LineScanBscan: "SaveLineScanBscan",
  AngioProj: "SaveAngioProj",
  FullScope: "SaveSlo",
  SlowBScanMain: "SaveSlowBScanMain",
  SlowBScanAttach: "SaveSlowBScanAttach",
  FastBScan: "SaveFastBScan",
  AdvancedSegBscan: "SaveAdvancedSegBscan",
  OctSlowBscan: "SaveOctSlowBscan",
  OctFastBscan: "SaveOctFastBscan"
};

// language dropdown list
export const LANGUAGE_LIST = [
  {
    value: "en",
    label: "English"
  },
  {
    value: "zh-CN",
    label: "中文"
  }
  // {
  //   value: "fr",
  //   label: "Français"
  // }
];

// commonly used comments
export const COMMENT_LIST = [
  {
    labelKey: "analysis.cataract",
    value: "cataract"
  },
  {
    labelKey: "analysis.glaucoma",
    value: "glaucoma"
  }
];

// angio layer thumbnail list
export const ANGIO_LAYER_THUMBNAIL_LIST: Array<LabelKeyValueType> = [
  {
    value: "0",
    labelKey: "analysis.retina", // Retina(视网膜层)
    name: "Retina"
  },
  {
    value: "1",
    labelKey: "analysis.innerRetina", // Inner Retina(视网膜内层)
    name: "InnerRetina"
  },
  {
    value: "2",
    labelKey: "analysis.superficial", // Superficial vascular complex(浅层血管复合体)
    name: "Superficial"
  },
  {
    value: "3",
    labelKey: "analysis.deep", // Deep vascular complex(深层血管复合体)
    name: "Deep"
  },
  {
    value: "4",
    labelKey: "analysis.avascular", // Avascular(视网膜无血管层)
    name: "Avascular"
  },
  {
    value: "5",
    labelKey: "analysis.choriocapillaris", // Choriocapillaris(脉络膜毛细血管层)
    name: "Choriocapillaris"
  },
  {
    value: "6",
    labelKey: "analysis.choroid", // Choroid(脉络膜层)
    name: "Choroid"
  },
  {
    value: "7",
    labelKey: "analysis.vitreous", // Vitreous(玻璃体层)
    name: "Vitreous"
  },
  {
    value: "8",
    labelKey: "analysis.nerveFiber", // Radial peripapillary capillary plexus(放射状毛细血管网)
    name: "NerveFiber"
  },
  {
    value: "9",
    labelKey: "analysis.svp", // Superficial vascular plexus(浅层血管网)
    name: "SVP"
  },
  {
    value: "10",
    labelKey: "analysis.icp", // Intermediate capillary plexus(中层毛细血管网)
    name: "ICP"
  },
  {
    value: "11",
    labelKey: "analysis.dcp", // Deep capillary plexus(深层毛细血管网)
    name: "DCP"
  },
  {
    value: "12",
    labelKey: "analysis.outerRetina", // Out Retina(视网膜外层)
    name: "OuterRetina"
  },
  {
    value: "13",
    labelKey: "analysis.rpebm", // Pigment epithelial detachment(色素上皮脱离层)
    name: "PED"
  },
  {
    value: "14",
    labelKey: "analysis.whole", // Whole(全层)
    name: "Whole"
  }
  // {
  //   angioLayerType: "15",
  //   labelKey: "analysis.snr" // 信噪比
  // }
];

// angio retina enhanced thumbnail list
export const ANGIO_RETINA_ENHANCED_THUMBNAIL_LIST: Array<LabelKeyValueType> = [
  {
    value: "7",
    labelKey: "analysis.vitreous", // Vitreous(玻璃体层)
    name: "Vitreous"
  },
  {
    value: "8",
    labelKey: "analysis.nerveFiber", // Radial peripapillary capillary plexus(放射状毛细血管网)
    name: "NerveFiber"
  },
  {
    value: "2",
    labelKey: "analysis.superficial", // Superficial vascular complex(浅层血管复合体)
    name: "Superficial"
  },
  {
    value: "1",
    labelKey: "analysis.innerRetina", // Inner Retina(视网膜内层)
    name: "InnerRetina"
  },
  {
    value: "0",
    labelKey: "analysis.retina", // Retina(视网膜层)
    name: "Retina"
  },
  {
    value: "5",
    labelKey: "analysis.choriocapillaris", // Choriocapillaris(脉络膜毛细血管层)
    name: "Choriocapillaris"
  },
  {
    value: "6",
    labelKey: "analysis.choroid", // Choroid(脉络膜层)
    name: "Choroid"
  },
  {
    value: "15",
    labelKey: "analysis.retinaPhotocoagulation", // RetinaPhotocoagulation(视网膜光凝)
    name: "RetinaPhotocoagulation"
  }
];

// projection mode list
export const PROJECT_MODE_LIST = [
  {
    value: ProjectTypeEnum.MAX,
    labelKey: "common.max" // 最大值
  },
  {
    value: ProjectTypeEnum.MEAN,
    labelKey: "common.mean" // 平均值
  },
  {
    value: ProjectTypeEnum.SUM,
    labelKey: "common.sum" // 总数
  }
  // {
  //   value: ProjectType.Min,
  //   labelKey: "common.min", // 最小值
  // },
];

export const OCT_PROJECT_MODE_LIST = [
  {
    value: ProjectTypeEnum.MEAN,
    labelKey: "common.mean" // 平均值
  },
  {
    value: ProjectTypeEnum.MAX,
    labelKey: "common.max" // 最大值
  },
  {
    value: ProjectTypeEnum.MIN,
    labelKey: "common.min" // 最小值
  }
];

// algorithm
export const ALGORITHM_LIST = [
  {
    value: "0",
    labelKey: "analysis.choroidVessel",
    name: " ChoroidVessel" // 脉络膜大中血管
  },
  {
    value: "1",
    labelKey: "analysis.srf",
    name: "SRF" // 视网膜下积液
  }
];

// posterior surface AdvancedSeg
export const LAYER_ADVANCEDSEG_LIST = [
  {
    ceilingSurf: "10",
    floorSurf: "9",
    ceilingShift: 50,
    floorShift: 0
  },
  {
    ceilingSurf: "5",
    floorSurf: "8",
    ceilingShift: 0,
    floorShift: 0
  }
];

// quantization value
export const QUANTIZATION_VALUE_VESSEL_LIST = [
  {
    value: "0",
    labelKey: "analysis.cvv",
    name: "CVV" //血管容积
  },
  {
    value: "1",
    labelKey: "analysis.cvi",
    name: "CVI" // 血管指数
  }
];
export const QUANTIZATION_VALUE_SRF_LIST = [
  {
    value: "0",
    labelKey: "analysis.srfIndex",
    name: "SRFIndex" // index
  },
  {
    value: "1",
    labelKey: "analysis.srfThickness",
    name: "SRFThickness" // 厚度
  }
];

// Measure options list
export const MEASURE_LIST = [
  {
    value: "0",
    labelKey: "common.close" // 关闭
  },
  {
    value: "1",
    labelKey: "analysis.vesselDensity" // 血管密度
  },
  {
    value: "2",
    labelKey: "analysis.smallVesselDensity" // 小血管密度
  },
  {
    value: "3",
    labelKey: "analysis.flowArea" // 灌注面积(mm²)
  },
  {
    value: "4",
    labelKey: "analysis.flowVoidArea" // 无灌注面积(mm²)
  },
  {
    value: "5",
    labelKey: "analysis.faz" // 中心凹血管密度
  },
  {
    value: "6",
    labelKey: "analysis.flowVoid" // 无灌注
  }
];

// Quantize options 量化工具
export const QUANTIZE_LIST = [
  {
    value: "0",
    labelKey: "common.close" // 关闭
  },
  {
    value: "1",
    labelKey: "analysis.etdrs" // ETDRS环
  },
  {
    value: "2",
    labelKey: "analysis.grid1" // 1mmx1mm网格
  },
  {
    value: "3",
    labelKey: "analysis.grid3" //  3mmx3mm网格
  },
  {
    value: "4",
    labelKey: "analysis.manualMeasurement" //  手动测量
  }
];

// posterior surface - 后节分层边界 见https://github.com/SVisions/Picasso-Software/blob/Picasso%23U0/doc/Doc/Vangogh/x.1%E5%90%8E%E8%8A%82Surface%E5%AE%9A%E4%B9%89.md
export const LAYER_BORDER_LIST = [
  {
    value: "0",
    labelKey: "analysis.top" // 顶部
  },
  {
    value: "1",
    labelKey: "analysis.ilm" // 内界膜 又名VitNfl
  },
  {
    value: "2",
    labelKey: "analysis.nfl_gcl" // 神经纤维层/节细胞层
  },
  {
    value: "13",
    labelKey: "analysis.gcc" // 节细胞复合体1/3   Custom(1/3GCC)
  },
  {
    value: "3",
    labelKey: "analysis.ipl_inl" // 内丛状层/内核层
  },
  {
    value: "4",
    labelKey: "analysis.inl_half" // 内核层1/2  InlCenter
  },
  {
    value: "5",
    labelKey: "analysis.inl_opl" // 内核层/外丛状层
  },
  {
    value: "8",
    labelKey: "analysis.rpe" // 色素上皮层  8: RpeCh
  },
  {
    value: "10",
    labelKey: "analysis.bm" // Bruch's膜
  },
  {
    value: "9",
    labelKey: "analysis.choroid" // 脉络膜层  9: ChScl
  },
  {
    value: "12",
    labelKey: "analysis.bottom" // 底层
  }
];

export const POSTERIOR_OCT_LAYER_BORDER_LIST = [
  {
    value: "0",
    labelKey: "analysis.top" // 顶部
  },
  {
    value: "1",
    labelKey: "analysis.ilm" // 内界膜 又名VitNfl
  },
  {
    value: "2",
    labelKey: "analysis.nfl_gcl" // 神经纤维层/节细胞层
  },
  {
    value: "3",
    labelKey: "analysis.ipl_inl" // 内丛状层/内核层
  },
  {
    value: "5",
    labelKey: "analysis.inl_opl" // 内核层/外丛状层
  },
  {
    value: "8",
    labelKey: "analysis.rpe" // 色素上皮层  8: RpeCh
  },
  {
    value: "10",
    labelKey: "analysis.bm" // Bruch's膜
  },
  {
    value: "9",
    labelKey: "analysis.choroid" // 脉络膜层  9: ChScl
  },
  {
    value: "12",
    labelKey: "analysis.bottom" // 底层
  }
];

export const CSCAN_SURFACE_LIST: LabelKeyValueType[] = [
  {
    value: "-2",
    labelKey: "analysis.smart",
    name: "Smart" // 智能,默认为Bruch's层
  },
  {
    value: "-1",
    labelKey: "analysis.horizontal",
    name: "Horizontal" // 水平方向
  },
  {
    value: "1",
    labelKey: "analysis.ilm",
    name: "ILM" // 内界膜 又名VitNfl
  },
  {
    value: "2",
    labelKey: "analysis.nfl_gcl",
    name: "NFL_GCL" // 神经纤维层/节细胞层
  },
  {
    value: "3",
    labelKey: "analysis.ipl_inl",
    name: "IPL_INL" // 内丛状层/内核层
  },
  {
    value: "5",
    labelKey: "analysis.inl_opl",
    name: "INL_OPL" // 内核层/外丛状层
  },
  {
    value: "8",
    labelKey: "analysis.rpe",
    name: "RPE" // 色素上皮层  8: RpeCh
  },
  {
    value: "10",
    labelKey: "analysis.bm",
    name: "BM" // Bruch's膜
  },
  {
    value: "9",
    labelKey: "analysis.choroid",
    name: "Choroid" // 脉络膜层  9: ChScl
  }
];

// anterior surface - 前节边界 见https://github.com/SVisions/Picasso-Software/blob/Picasso%23U0/main/Doc/Vangogh/x.2%E5%89%8D%E8%8A%82Surface%E5%AE%9A%E4%B9%89.md
export const AS_SURFACE_LIST = [
  {
    value: "0",
    surfType: "OcularSurface",
    labelKey: "analysis.OcularSurface" // 眼表面
  },
  {
    value: "1",
    surfType: "StromaFront",
    labelKey: "analysis.StromaFront" // 基质层前表面
  },
  {
    value: "2",
    surfType: "StromaBack",
    labelKey: "analysis.StromaBack" // 基质层后表面
  },
  {
    value: "3",
    surfType: "IrisFront",
    labelKey: "analysis.IrisFront" // 虹膜前表面
  },
  {
    value: "4",
    surfType: "IrisBack",
    labelKey: "analysis.IrisBack" // 虹膜后表面
  },
  {
    value: "5",
    surfType: "LensFront",
    labelKey: "analysis.LensFront" // 晶状体前表面
  },
  {
    value: "6",
    surfType: "LensBack",
    labelKey: "analysis.LensBack" // 晶状体后表面
  }
  // {
  //   value: "7",
  //   labelKey: "analysis.LensFrontExt"
  // },
  // {
  //   value: "8",
  //   labelKey: "analysis.LensBackExt"
  // },
  // {
  //   value: "9",
  //   labelKey: "analysis.LensPlane"
  // },
  // {
  //   value: "10",
  //   labelKey: "analysis.ChoroidFront"
  // },
  // {
  //   value: "11",
  //   labelKey: "analysis.ChoroidBack"
  // },
  // {
  //   value: "11",
  //   labelKey: "analysis.ChoroidBack"
  // },
  // {
  //   value: "12",
  //   labelKey: "analysis.StromaOneThird"
  // },
  // {
  //   value: "13",
  //   labelKey: "analysis.ScleraBack"
  // },
  // {
  //   value: "14",
  //   labelKey: "analysis.ScleraIrisBack"
  // },
  // {
  //   value: "15",
  //   labelKey: "analysis.AnteriorTop"
  // },
  // {
  //   value: "16",
  //   labelKey: "analysis.AnteriorBottom"
  // },
  // {
  //   value: "17",
  //   labelKey: "analysis.ScleralLensFront"
  // },
  // {
  //   value: "18",
  //   labelKey: "analysis.ScleralLensBack"
  // },
  // {
  //   value: "19",
  //   labelKey: "analysis.ICLFront"
  // },
  // {
  //   value: "20",
  //   labelKey: "analysis.ICLBack"
  // }
];

export const ANTERIOR_OCT_LAYER_BORDER_LIST = [
  ...AS_SURFACE_LIST,
  {
    value: "16",
    labelKey: "analysis.AnteriorBottom" // 底层
  }
];

export const AS_LINE_SURFACE_LIST = [
  ...AS_SURFACE_LIST,
  {
    value: "10",
    labelKey: "analysis.rpe"
  },
  {
    value: "11",
    labelKey: "analysis.choroid"
  }
];

// oct opacity list
export const OCT_OPACITY_LIST = [
  {
    value: 1,
    label: "0%"
  },
  {
    value: 0.75,
    label: "25%"
  },
  {
    value: 0.5,
    label: "50%"
  },
  {
    value: 0.25,
    label: "75%"
  },
  {
    value: 0,
    label: "100%"
  }
];

export const POSTERIOR_SURFACE_LIST = [
  {
    value: "1",
    labelKey: "analysis.ilm" // 内界膜
  },
  {
    value: "2",
    labelKey: "analysis.nfl_gcl" // 神经纤维层/节细胞层
  },
  {
    value: "3",
    labelKey: "analysis.ipl_inl" // 内丛状层/内核层
  },
  {
    value: "5",
    labelKey: "analysis.inl_opl"
  },
  {
    value: "99",
    labelKey: "analysis.rpebm" // 色素上皮脱离层
  },
  {
    value: "8",
    labelKey: "analysis.rpe"
  },
  {
    value: "10",
    labelKey: "analysis.bm"
  },
  {
    value: "9",
    labelKey: "analysis.choroid"
  }
];

export enum PosteriorSurfaceEnum {
  ILM = "1",
  RPE = "8",
  BM = "10",
  RPEBM = "99", // 虚拟层
  Photocoagulation = "15"
}

export enum AnteriorSurfaceEnum {
  OcularSurface = "0",
  StromaFront = "1",
  StromaBack = "2",
  IrisFront = "3",
  IrisBack = "4",
  LensFront = "5",
  LensBack = "6",
  RPE = "10",
  CHOROID = "11"
}

// posterior structural projection thumbnail list (https://github.com/SVisions/Picasso-Software/blob/Picasso%23U0/main/Doc/Vangogh/x.5%E5%90%8E%E8%8A%82Layer%E5%AE%9A%E4%B9%89.md)
export const StructuralProj_THUMBNAIL_LIST = [
  {
    value: "0",
    labelKey: "analysis.rnfl", // 神经纤维层
    name: "RNFL"
  },
  {
    value: "1",
    labelKey: "analysis.gcl_ipl", // 节细胞+内丛状层
    name: "GCL+IPL"
  },
  {
    value: "2",
    labelKey: "analysis.inl", // 内核层
    name: "INL"
  },
  {
    value: "3",
    labelKey: "analysis.outerRetina", // 视网膜外层
    name: "OuterRetina"
  },
  {
    value: "4",
    labelKey: "analysis.rpebm", // 色素上皮脱离层
    name: "RPE-BM"
  },
  {
    value: "5",
    labelKey: "analysis.choroid", // 脉络膜层
    name: "Choroid"
  },
  {
    value: "6",
    labelKey: "analysis.retina", // 视网膜层
    name: "Retina"
  },
  {
    value: "7",
    labelKey: "analysis.rnfl_gcl_ipl", // 神经节细胞复合体层
    name: "RNFL+GCL+IPL"
  },
  {
    value: "8",
    labelKey: "analysis.vitreous", // 玻璃体层
    name: "Vitreous"
  },
  {
    value: "9",
    labelKey: "analysis.belowChoroid", // 脉络膜以下
    name: "BelowChoroid"
  }
];

// anterior structural projection thumbnail list (https://github.com/SVisions/Picasso-Software/blob/Picasso%23U0/main/Doc/Vangogh/x.6%E5%89%8D%E8%8A%82Layer%E5%AE%9A%E4%B9%89.md)
export const AS_StructuralProj_THUMBNAIL_LIST = [
  {
    value: "0",
    labelKey: "analysis.kEpiConj",
    name: "KEpiConj" // 角膜上皮/结膜
  },
  {
    value: "1",
    labelKey: "analysis.kStromaSclera",
    name: "KStromaSclera" // 角膜基质/巩膜
  },
  {
    value: "2",
    labelKey: "analysis.kAnteriorChamber",
    name: "KAnteriorChamber" // 前房
  },
  {
    value: "3",
    labelKey: "analysis.kIris",
    name: "KIris" // 虹膜
  },
  {
    value: "4",
    labelKey: "analysis.kLens",
    name: "KLens" // 晶体
  },
  {
    value: "5",
    labelKey: "analysis.kAnteriorVitreousLayer",
    name: "KAnteriorVitreousLayer" // 前玻璃体
  }
];

export const REPORT_OPTIONS_LISTS = [
  {
    value: "horizontal",
    labelKey: "analysis.A4Horizontal"
  },
  {
    value: "vertical",
    labelKey: "analysis.A4Vertical"
  }
];
export const REPORT_TEMPLATES_LISTS = [
  {
    value: "default",
    labelKey: "analysis.default"
  }
];
