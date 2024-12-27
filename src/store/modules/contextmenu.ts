import { defineStore } from "pinia";
import { camelCase, clone } from "xe-utils";
import { store } from "@/store";
import { ContainerNameEnum, ContextmenuTypeEnum } from "@/enums";
import { VueI18n } from "@/locales/i18n";
import {
  isAngioProtocol,
  isAnteriorScan,
  isBiometryProProtocol,
  isBiometryProtocol,
  isCubeProtocol,
  isONHScanProtocol,
  isSingleLineScanProtocol
} from "@/utils/protocol";
import { useAnalysisCommonStoreHook } from "@/views/analysis/store/analysisCommon";
import { useAngioLayerStoreHook } from "@/views/analysis/posterior/angio/components/store/angioLayer";
import router from "@/router";
import { PageRoute } from "@/utils/route";
import { PosteriorSurfaceEnum } from "@/utils/constant";

export interface ContextmenuState {
  position: Point | null;
  targetName: ContainerNameEnum | null;
  activeMenuName: string;
  activeMenu: ContextmenuItem | null;
  bscanSmooth: number;
  angioProjColor: string;
  bscanColor: string;
  angioProjMenuList: Array<ContextmenuItem>;
  multiAngioProjMenuList: Array<ContextmenuItem>;
  sloOctMenuList: Array<ContextmenuItem>;
  slowBscanMainMenuList: Array<ContextmenuItem>;
  slowBscanAttachMenuList: Array<ContextmenuItem>;
  fastBscanMenuList: Array<ContextmenuItem>;
  lineScanSloMenuList: Array<ContextmenuItem>;
  lineScanBscanMenuList: Array<ContextmenuItem>;
  multiLineScanBscanMenuList: Array<ContextmenuItem>;
  mosaicProjMenuList: Array<ContextmenuItem>;
  angioLineScanBscanMenuList: Array<ContextmenuItem>;
  advancedSegQuantizeMenuList: Array<ContextmenuItem>;
  advancedSegSloMenuList: Array<ContextmenuItem>;
  advancedSegBscanMenuList: Array<ContextmenuItem>;
  asLineScanBscanMenuList: Array<ContextmenuItem>;
  multiSlowBscanMainMenuList: Array<ContextmenuItem>;
  thicknessMapMenuList: Array<ContextmenuItem>;
  octViewerMenuList: Array<ContextmenuItem>;
  manualFastBscanMenuList: Array<ContextmenuItem>;
  manualSloMenuList: Array<ContextmenuItem>;
  octSlowBscanMenuList: Array<ContextmenuItem>;
  structuralProjOctMenuList: Array<ContextmenuItem>;
  mosaicOctProjMenuList: Array<ContextmenuItem>;
}

const FULLSCREEN_MENU_LIST = [
  {
    label: VueI18n("common.resetView"),
    name: ContextmenuTypeEnum.ResetView,
    visible: true
  },
  {
    label: VueI18n("common.fullScreen"),
    name: ContextmenuTypeEnum.FullScreen,
    visible: true
  },
  {
    label: VueI18n("common.exitFullScreen"),
    name: ContextmenuTypeEnum.ExitFullScreen,
    visible: false
  }
];

const SMOOTH_MENU_LIST = [
  {
    label: "0",
    name: ContextmenuTypeEnum.Smooth0,
    showActive: true,
    active: false,
    visible: true
  },
  {
    label: "1",
    name: ContextmenuTypeEnum.Smooth1,
    showActive: true,
    active: false,
    visible: true
  },
  {
    label: "2",
    name: ContextmenuTypeEnum.Smooth2,
    showActive: true,
    active: false,
    visible: true
  },
  {
    label: "3",
    name: ContextmenuTypeEnum.Smooth3,
    showActive: true,
    active: false,
    visible: true
  }
];

const MEASURE_MENU_LIST = [
  {
    label: VueI18n("common.ruler"),
    name: ContextmenuTypeEnum.Ruler,
    icon: "measure-ruler",
    divided: false,
    visible: true
  },
  {
    label: VueI18n("common.arrow"),
    name: ContextmenuTypeEnum.Arrow,
    icon: "measure-arrow",
    divided: false,
    visible: true
  },
  {
    label: VueI18n("common.text"),
    name: ContextmenuTypeEnum.Text,
    icon: "measure-text",
    divided: false,
    visible: true
  },
  {
    label: VueI18n("common.clearAll"),
    name: ContextmenuTypeEnum.ClearAll,
    icon: "clear-all",
    divided: true,
    visible: true
  }
];

const IMAGE_COLOR_MENU_LIST = [
  {
    label: VueI18n("analysis.gray"),
    name: ContextmenuTypeEnum.Gray,
    showActive: true,
    active: true,
    visible: true
  },
  {
    label: VueI18n("analysis.inverse"),
    name: ContextmenuTypeEnum.Inverse,
    showActive: true,
    active: false,
    visible: true
  }
];

export const useContextmenuStore = defineStore({
  id: "contextmenu",
  state: (): ContextmenuState => ({
    position: null,
    targetName: null,
    activeMenuName: "",
    activeMenu: null,
    bscanSmooth: 0,
    angioProjColor: ContextmenuTypeEnum.Gray,
    bscanColor: ContextmenuTypeEnum.Gray,
    angioProjMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.angioColorMenu"),
        name: ContextmenuTypeEnum.Angio,
        divided: true,
        visible: true,
        children: [
          ...clone(IMAGE_COLOR_MENU_LIST, true),
          {
            label: VueI18n("analysis.hot"),
            name: ContextmenuTypeEnum.Hot,
            showActive: true,
            active: false,
            visible: true
          },
          {
            label: VueI18n("analysis.rainbow"),
            name: ContextmenuTypeEnum.Rainbow,
            showActive: true,
            active: false,
            visible: true
          }
        ]
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    multiAngioProjMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    sloOctMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.structuralProj"),
        name: ContextmenuTypeEnum.StructuralProj,
        divided: true,
        visible: true,
        children: [...clone(IMAGE_COLOR_MENU_LIST, true)]
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    slowBscanMainMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanSLOImage"),
        name: ContextmenuTypeEnum.SaveBscanSLOImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanAngioImage"),
        name: ContextmenuTypeEnum.SaveBscanAngioImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveAllBscanAngioImages"),
        name: ContextmenuTypeEnum.saveAllBscanAngioImages,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.bscanColor"),
        name: ContextmenuTypeEnum.BScanColor,
        visible: true,
        children: [...clone(IMAGE_COLOR_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.smooth"),
        name: ContextmenuTypeEnum.Smooth,
        visible: true,
        children: [...clone(SMOOTH_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.autoZoomBscan"),
        divided: true,
        name: ContextmenuTypeEnum.AutoZoomBScan,
        showActive: true,
        active: true,
        visible: true
      },
      {
        label: VueI18n("analysis.editLayer"),
        name: ContextmenuTypeEnum.EditLayer,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    multiSlowBscanMainMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanAngioImage"),
        name: ContextmenuTypeEnum.SaveBscanAngioImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.bscanColor"),
        name: ContextmenuTypeEnum.BScanColor,
        visible: true,
        children: [...clone(IMAGE_COLOR_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.smooth"),
        name: ContextmenuTypeEnum.Smooth,
        visible: true,
        children: [...clone(SMOOTH_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.autoZoomBscan"),
        divided: true,
        name: ContextmenuTypeEnum.AutoZoomBScan,
        showActive: true,
        active: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    slowBscanAttachMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanSLOImage"),
        name: ContextmenuTypeEnum.SaveBscanSLOImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanAngioImage"),
        name: ContextmenuTypeEnum.SaveBscanAngioImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveAllBscanAngioImages"),
        name: ContextmenuTypeEnum.saveAllBscanAngioImages,
        divided: true,
        visible: true
      },
      {
        label: VueI18n("analysis.bscanColor"),
        name: ContextmenuTypeEnum.BScanColor,
        visible: true,
        children: [...clone(IMAGE_COLOR_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.smooth"),
        name: ContextmenuTypeEnum.Smooth,
        visible: true,
        children: [...clone(SMOOTH_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.autoZoomBscan"),
        name: ContextmenuTypeEnum.AutoZoomBScan,
        showActive: true,
        active: true,
        visible: true
      },
      {
        label: VueI18n("analysis.fastBscan"),
        divided: true,
        name: ContextmenuTypeEnum.FastBScan,
        showActive: true,
        active: false,
        visible: true
      },
      {
        label: VueI18n("analysis.editLayer"),
        name: ContextmenuTypeEnum.EditLayer,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    fastBscanMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanSLOImage"),
        name: ContextmenuTypeEnum.SaveBscanSLOImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanAngioImage"),
        name: ContextmenuTypeEnum.SaveBscanAngioImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveAllBscanAngioImages"),
        name: ContextmenuTypeEnum.saveAllBscanAngioImages,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.bscanColor"),
        name: ContextmenuTypeEnum.BScanColor,
        visible: true,
        children: [...clone(IMAGE_COLOR_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.smooth"),
        name: ContextmenuTypeEnum.Smooth,
        visible: true,
        children: [...clone(SMOOTH_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.autoZoomBscan"),
        name: ContextmenuTypeEnum.AutoZoomBScan,
        showActive: true,
        active: true,
        visible: true
      },
      {
        label: VueI18n("analysis.fastBscan"),
        divided: true,
        name: ContextmenuTypeEnum.FastBScan,
        showActive: true,
        active: false,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    lineScanSloMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    lineScanBscanMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanSLOImage"),
        name: ContextmenuTypeEnum.SaveBscanSLOImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveAllBscanOctImages"),
        name: ContextmenuTypeEnum.saveAllBscanOctImages,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.bscanColor"),
        name: ContextmenuTypeEnum.BScanColor,
        visible: true,
        children: [
          ...clone(IMAGE_COLOR_MENU_LIST, true),
          {
            label: VueI18n("analysis.classic"),
            name: ContextmenuTypeEnum.Classic,
            showActive: true,
            active: false,
            visible: true
          }
        ]
      },
      {
        label: VueI18n("analysis.autoZoomBscan"),
        divided: true,
        name: ContextmenuTypeEnum.AutoZoomBScan,
        showActive: true,
        active: false,
        visible: true
      },
      {
        label: VueI18n("analysis.editLayer"),
        name: ContextmenuTypeEnum.EditLayer,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    multiLineScanBscanMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanSLOImage"),
        name: ContextmenuTypeEnum.SaveBscanSLOImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.bscanColor"),
        name: ContextmenuTypeEnum.BScanColor,
        visible: true,
        children: [
          ...clone(IMAGE_COLOR_MENU_LIST, true),
          {
            label: VueI18n("analysis.classic"),
            name: ContextmenuTypeEnum.Classic,
            showActive: true,
            active: false,
            visible: true
          }
        ]
      },
      {
        label: VueI18n("analysis.autoZoomBscan"),
        divided: true,
        name: ContextmenuTypeEnum.AutoZoomBScan,
        showActive: true,
        active: false,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    mosaicProjMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    mosaicOctProjMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.structuralProj"),
        name: ContextmenuTypeEnum.StructuralProj,
        divided: true,
        visible: true,
        children: [...clone(IMAGE_COLOR_MENU_LIST, true)]
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    angioLineScanBscanMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanSLOImage"),
        name: ContextmenuTypeEnum.SaveBscanSLOImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.bscanColor"),
        name: ContextmenuTypeEnum.BScanColor,
        visible: true,
        children: [
          ...clone(IMAGE_COLOR_MENU_LIST, true),
          {
            label: VueI18n("analysis.classic"),
            name: ContextmenuTypeEnum.Classic,
            showActive: true,
            active: false,
            visible: true
          }
        ]
      },
      {
        label: VueI18n("analysis.smooth"),
        name: ContextmenuTypeEnum.Smooth,
        visible: true,
        children: [...clone(SMOOTH_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.autoZoomBscan"),
        name: ContextmenuTypeEnum.AutoZoomBScan,
        divided: true,
        showActive: true,
        active: false,
        visible: true
      },
      {
        label: VueI18n("analysis.editLayer"),
        name: ContextmenuTypeEnum.EditLayer,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    asLineScanBscanMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanSLOImage"),
        name: ContextmenuTypeEnum.SaveBscanSLOImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.showCorrectedImage"),
        name: ContextmenuTypeEnum.ShowCorrectedImage,
        divided: true,
        showActive: true,
        active: true,
        visible: true
      },
      {
        label: VueI18n("analysis.editLayer"),
        name: ContextmenuTypeEnum.EditLayer,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    advancedSegQuantizeMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    advancedSegSloMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.structuralProj"),
        name: ContextmenuTypeEnum.StructuralProj,
        divided: true,
        visible: true,
        children: [...clone(IMAGE_COLOR_MENU_LIST, true)]
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    advancedSegBscanMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: false,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanSLOImage"),
        name: ContextmenuTypeEnum.SaveBscanSLOImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.bscanColor"),
        name: ContextmenuTypeEnum.BScanColor,
        visible: true,
        children: [
          ...clone(IMAGE_COLOR_MENU_LIST, true),
          {
            label: VueI18n("analysis.classic"),
            name: ContextmenuTypeEnum.Classic,
            showActive: true,
            active: false,
            visible: true
          }
        ]
      },
      {
        label: VueI18n("analysis.smooth"),
        name: ContextmenuTypeEnum.Smooth,
        visible: true,
        children: [...clone(SMOOTH_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.autoZoomBscan"),
        divided: true,
        name: ContextmenuTypeEnum.AutoZoomBScan,
        showActive: true,
        active: true,
        visible: true
      },
      {
        label: VueI18n("analysis.editLayer"),
        name: ContextmenuTypeEnum.EditLayer,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    thicknessMapMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    octViewerMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      {
        label: VueI18n("analysis.structuralProj"),
        name: ContextmenuTypeEnum.StructuralProj,
        divided: true,
        visible: true,
        children: [...clone(IMAGE_COLOR_MENU_LIST, true)]
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    manualFastBscanMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    manualSloMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    octSlowBscanMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      {
        label: VueI18n("common.saveBscanSLOImage"),
        name: ContextmenuTypeEnum.SaveBscanSLOImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.bscanColor"),
        name: ContextmenuTypeEnum.BScanColor,
        visible: true,
        children: [
          ...clone(IMAGE_COLOR_MENU_LIST, true),
          {
            label: VueI18n("analysis.classic"),
            name: ContextmenuTypeEnum.Classic,
            showActive: true,
            active: false,
            visible: true
          }
        ]
      },
      {
        label: VueI18n("analysis.smooth"),
        name: ContextmenuTypeEnum.Smooth,
        divided: false,
        visible: true,
        children: [...clone(SMOOTH_MENU_LIST, true)]
      },
      {
        label: VueI18n("analysis.autoZoomBscan"),
        divided: true,
        name: ContextmenuTypeEnum.AutoZoomBScan,
        showActive: true,
        active: true,
        visible: true
      },
      {
        label: VueI18n("analysis.editLayer"),
        name: ContextmenuTypeEnum.EditLayer,
        divided: true,
        visible: true
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ],
    structuralProjOctMenuList: [
      {
        label: VueI18n("common.saveImage"),
        name: ContextmenuTypeEnum.SaveImage,
        divided: true,
        visible: true
      },
      ...clone(MEASURE_MENU_LIST, true),
      {
        label: VueI18n("analysis.structuralProj"),
        name: ContextmenuTypeEnum.StructuralProj,
        divided: true,
        visible: true,
        children: [...clone(IMAGE_COLOR_MENU_LIST, true)]
      },
      ...clone(FULLSCREEN_MENU_LIST, true)
    ]
  }),
  getters: {
    menuList(state): ContextmenuItem[] {
      if (!state.targetName) return [];

      const path = router.currentRoute.value.path;
      const analysisCommonStore = useAnalysisCommonStoreHook();
      const { protocolName } = analysisCommonStore;
      const isAsBscan =
        isAnteriorScan(protocolName) ||
        isBiometryProtocol(protocolName) ||
        isBiometryProProtocol(protocolName);

      switch (state.targetName) {
        case ContainerNameEnum.SloOct:
        case ContainerNameEnum.FullScope:
        case ContainerNameEnum.OCTScope:
          return state.sloOctMenuList;
        case ContainerNameEnum.LineScanBscan: {
          if (path === PageRoute.MultipleLineScan) {
            return state.multiLineScanBscanMenuList;
          }

          // AS B-scan
          if (isAsBscan) {
            return isSingleLineScanProtocol(protocolName)
              ? state.asLineScanBscanMenuList.filter(
                  menu => menu.name !== ContextmenuTypeEnum.EditLayer
                )
              : state.asLineScanBscanMenuList;
          }

          const isCubeData =
            isAngioProtocol(protocolName) ||
            isCubeProtocol(protocolName) ||
            isONHScanProtocol(protocolName);
          if (isCubeData) {
            return state.angioLineScanBscanMenuList;
          }
          return protocolName?.includes("Single-line")
            ? state.lineScanBscanMenuList.filter(
                item => item.name !== ContextmenuTypeEnum.saveAllBscanOctImages
              )
            : state.lineScanBscanMenuList;
        }
        case ContainerNameEnum.AngioProj: {
          const angioLayerStore = useAngioLayerStoreHook();
          state.angioProjMenuList[1].visible =
            angioLayerStore.activeAngioLayerType !==
            PosteriorSurfaceEnum.Photocoagulation;
          return path === PageRoute.Angiography ||
            path === PageRoute.AngioRetinaEnhanced
            ? state.angioProjMenuList
            : state.multiAngioProjMenuList;
        }
        case ContainerNameEnum.SlowBScanMain:
          return path === PageRoute.Angiography ||
            path === PageRoute.AngioRetinaEnhanced
            ? state.slowBscanMainMenuList
            : state.multiSlowBscanMainMenuList;
        case ContainerNameEnum.OctSlowBscan:
        case ContainerNameEnum.OctFastBscan: {
          if (isAsBscan) {
            const asProjMenuList = state.octSlowBscanMenuList.filter(
              menu =>
                ![
                  ContextmenuTypeEnum.AutoZoomBScan,
                  ContextmenuTypeEnum.SaveBscanSLOImage
                ].includes(menu.name as ContextmenuTypeEnum)
            );
            const smoothMenu = asProjMenuList.findIndex(
              menu => menu.name === ContextmenuTypeEnum.Smooth
            );
            asProjMenuList[smoothMenu].divided = true;
            return asProjMenuList;
          }

          return state.octSlowBscanMenuList;
        }
        case ContainerNameEnum.CubeSlowBscan:
        case ContainerNameEnum.CubeFastBscan: {
          const cubeMenuList = state.octSlowBscanMenuList.filter(
            menu =>
              ![
                ContextmenuTypeEnum.EditLayer,
                ContextmenuTypeEnum.SaveBscanSLOImage
              ].includes(menu.name as ContextmenuTypeEnum)
          );
          if (isAsBscan) {
            const asCubeMenuList = cubeMenuList.filter(
              menu => menu.name !== ContextmenuTypeEnum.AutoZoomBScan
            );
            const smoothMenu = asCubeMenuList.findIndex(
              menu => menu.name === ContextmenuTypeEnum.Smooth
            );
            asCubeMenuList[smoothMenu].divided = true;
            return asCubeMenuList;
          }
          return cubeMenuList;
        }
        case ContainerNameEnum.CubeCscan:
          return state.advancedSegQuantizeMenuList;
        default: {
          const menuListKey = `${camelCase(
            state.targetName as string
          )}MenuList`;
          const menuList = state[
            menuListKey as keyof typeof state
          ] as Array<ContextmenuItem>;
          return menuList;
        }
      }
    }
  },
  actions: {
    syncSmoothStatus(smooth: string) {
      this.bscanSmooth = Number(smooth);
      const smoothStr = `${smooth}`;
      // keep smooth the same in three menu list
      [
        this.slowBscanMainMenuList,
        this.slowBscanAttachMenuList,
        this.multiSlowBscanMainMenuList,
        this.fastBscanMenuList,
        this.advancedSegBscanMenuList,
        this.angioLineScanBscanMenuList,
        this.octSlowBscanMenuList
      ].forEach((menuList: ContextmenuItem[]) => {
        const smoothMenu = this.getMenuByName(
          menuList,
          ContextmenuTypeEnum.Smooth
        );
        smoothMenu?.children?.forEach((subMenu: ContextmenuItem) => {
          subMenu.active = subMenu.name == smoothStr;
        });
      });
    },
    syncBscanColorStatus(item: ContextmenuItem) {
      this.bscanColor = item.name;
      // keep bscan color the same in three menu list
      [
        this.slowBscanMainMenuList,
        this.slowBscanAttachMenuList,
        this.fastBscanMenuList,
        this.advancedSegBscanMenuList
      ].forEach((menuList: ContextmenuItem[]) => {
        const subMenuList = this.getMenuByName(
          menuList,
          ContextmenuTypeEnum.BScanColor
        );
        subMenuList?.children?.forEach((subMenu: ContextmenuItem) => {
          subMenu.active = subMenu.name == item.name;
        });
      });
    },
    syncFastBscanMenuStatus(item: ContextmenuItem) {
      [this.slowBscanAttachMenuList, this.fastBscanMenuList].forEach(
        (menuList: ContextmenuItem[]) => {
          const menu = this.getMenuByName(
            menuList,
            ContextmenuTypeEnum.FastBScan
          );
          menu && (menu.active = item.active);
        }
      );
    },
    syncOctProcessorTypeStatus(item: ContextmenuItem) {
      [this.structuralProjOctMenuList, this.sloOctMenuList].forEach(
        (menuList: ContextmenuItem[]) => {
          const subMenuList = this.getMenuByName(
            menuList,
            ContextmenuTypeEnum.StructuralProj
          );
          subMenuList?.children?.forEach((subMenu: ContextmenuItem) => {
            subMenu.active = subMenu.name == item.name;
          });
        }
      );
    },
    updateFullScreen(item?: ContextmenuItem) {
      const selMenu = item ? item : this.activeMenu;
      if (!selMenu) return;

      this.menuList.forEach((menu: ContextmenuItem) => {
        if (menu.name === ContextmenuTypeEnum.FullScreen) {
          menu.visible = selMenu.name === ContextmenuTypeEnum.ExitFullScreen;
        }
        if (menu.name === ContextmenuTypeEnum.ExitFullScreen) {
          menu.visible = selMenu.name === ContextmenuTypeEnum.FullScreen;
        }
      });
    },
    getMenuByName(
      menuList: ContextmenuItem[],
      name: string
    ): ContextmenuItem | undefined {
      const idx = menuList.findIndex(
        (menu: ContextmenuItem) => menu.name === name
      );
      return idx > -1 ? menuList[idx] : undefined;
    },
    setPosition(p: Point) {
      this.position = p;
    },
    setTargetName(tgt: ContainerNameEnum) {
      this.targetName = tgt;
    },
    setActiveMenuName(menuName: string) {
      this.activeMenuName = menuName;
    },
    resetActiveMenu() {
      this.activeMenuName = "";
      this.activeMenu = null;
    },
    setActiveMenu(item?: ContextmenuItem) {
      if (!item || !this.targetName) return;

      switch (item.name) {
        case ContextmenuTypeEnum.FastBScan:
          this.syncFastBscanMenuStatus(item);
          break;
        case ContextmenuTypeEnum.Smooth0:
        case ContextmenuTypeEnum.Smooth1:
        case ContextmenuTypeEnum.Smooth2:
        case ContextmenuTypeEnum.Smooth3:
          this.syncSmoothStatus(item.name);
          break;
        case ContextmenuTypeEnum.Gray:
        case ContextmenuTypeEnum.Inverse:
          // bscan
          [
            ContainerNameEnum.SlowBScanMain,
            ContainerNameEnum.SlowBScanAttach,
            ContainerNameEnum.FastBScan,
            ContainerNameEnum.AdvancedSegBscan
          ].includes(this.targetName) && this.syncBscanColorStatus(item);

          // structural projection
          [
            ContainerNameEnum.StructuralProjOct,
            ContainerNameEnum.FullScope,
            ContainerNameEnum.OCTScope
          ].includes(this.targetName) && this.syncOctProcessorTypeStatus(item);
          break;
        case ContextmenuTypeEnum.FullScreen:
        case ContextmenuTypeEnum.ExitFullScreen:
          this.updateFullScreen(item);
          break;
        case ContextmenuTypeEnum.AutoZoomBScan:
          this.syncAutoZoomBScanActive(item);
          break;
        default:
          break;
      }
      this.setActiveMenuName(item.name);
      this.activeMenu = item;
    },
    syncAutoZoomBScanActive(item: ContextmenuItem) {
      const { active } = item;
      [
        this.slowBscanMainMenuList,
        this.slowBscanAttachMenuList,
        this.fastBscanMenuList,
        this.advancedSegBscanMenuList,
        this.octSlowBscanMenuList
      ].forEach((menuList: ContextmenuItem[]) => {
        const menu = this.getMenuByName(
          menuList,
          ContextmenuTypeEnum.AutoZoomBScan
        ) as ContextmenuItem;
        menu.active = active;
      });
    },
    setExitFullScreenMenuActive(targetName: ContainerNameEnum) {
      if (targetName !== this.targetName) return;

      const exitFullScreenItem = this.getMenuByName(
        this.menuList,
        ContextmenuTypeEnum.ExitFullScreen
      );
      this.setActiveMenu(exitFullScreenItem);
    },
    setFullScreenMenuActive(targetName: ContainerNameEnum) {
      if (targetName !== this.targetName) return;

      const fullScreenItem = this.getMenuByName(
        this.menuList,
        ContextmenuTypeEnum.FullScreen
      );
      this.setActiveMenu(fullScreenItem);
    },
    setAngioMenuList(list: []) {
      this.angioProjMenuList = list;
    },
    setSloOctMenuList(list: []) {
      this.sloOctMenuList = list;
    },
    setSlowBscanMenuMainList(list: []) {
      this.slowBscanMainMenuList = list;
    },
    setSlowBscanMenuAttachList(list: []) {
      this.slowBscanAttachMenuList = list;
    },
    setFastBscanMenuList(list: []) {
      this.fastBscanMenuList = list;
    },
    resetEditLayerMenus() {
      // 恢复结构投射图上菜单颜色初始值
      this.octViewerMenuList.forEach((menu: ContextmenuItem) => {
        if (menu.name === ContextmenuTypeEnum.StructuralProj) {
          menu.children?.forEach((subMenu: ContextmenuItem) => {
            subMenu.active = subMenu.name === ContextmenuTypeEnum.Gray;
          });
        }
      });
    }
  }
});

export function useContextmenuStoreHook() {
  return useContextmenuStore(store);
}
