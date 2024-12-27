import type { App, Component } from "vue";
import "./assets/styles/index.scss";
import ViewPort from "./components/viewport/index.vue";
import ImageViewer from "./components/image-viewer/index.vue";
import GeneralImageViewer from "./components/image-viewer/general-image-viewer/index.vue";
import CaptureDataCard from "./components/capture-data-card/index.vue";
import ConfirmDialog from "./components/confirm-dialog/index.vue";
import SVDialog from "./components/sv-dialog/index.vue";
import SVCollapseItem from "./components/sv-collapse-item/index.vue";
import SlowBscan from "@/packages/components/b-scan/SlowBscan.vue";
import ManualLayerBscan from "@/packages/components/b-scan/ManualLayerBscan.vue";
import FastBscan from "@/packages/components/b-scan/FastBscan.vue";
import SloOct from "@/packages/components/slo-oct/index.vue";
import ProjViewer from "@/packages/components/proj-viewer/index.vue";
import SVContextmenu from "@/packages/components/sv-contextmenu/index.vue";
import ScanThumbnail from "./components/b-scan/ScanThumbnail.vue";
import LineScanBscan from "./components/b-scan/LineScanBscan.vue";
import SloViewer from "./components/slo-viewer/index.vue";
import AdvancedImageViewer from "./components/advanced-image-viewer/index.vue";
import AdvancedSegQuantize from "./components/advanced-seg-quantize/index.vue";
import AdvancedSegBscan from "./components/b-scan/AdvancedSegBscan.vue";
import SLOThumbnailViewer from "./components/slo-thumbnail-viewer/index.vue";
import ThicknessMap from "./components/thickness-map/index.vue";
import OctViewer from "./components/oct-viewer/index.vue";
import ManualLayerFastBscan from "./components/b-scan/ManualLayerFastBscan.vue";
import MeasureTextDialog from "./components/measure-tools/MeasureTextDialog.vue";
import FullScope from "./components/slo-oct/FullScope.vue";
import ChangePwdDialog from "./components/change-password/index.vue";
import CscanViewer from "./components/cscan-viewer/index.vue";

const components = [
  ViewPort,
  ImageViewer,
  GeneralImageViewer,
  CaptureDataCard,
  ConfirmDialog,
  SloOct,
  SVDialog,
  SVCollapseItem,
  SlowBscan,
  FastBscan,
  ProjViewer,
  SVContextmenu,
  ScanThumbnail,
  LineScanBscan,
  SloViewer,
  AdvancedImageViewer,
  AdvancedSegQuantize,
  AdvancedSegBscan,
  SLOThumbnailViewer,
  ManualLayerBscan,
  ThicknessMap,
  OctViewer,
  ManualLayerFastBscan,
  MeasureTextDialog,
  FullScope,
  ChangePwdDialog,
  CscanViewer
];

export function usePackages(app: App) {
  // register components
  components.forEach((component: Component) => {
    app.component(component.name as string, component);
  });
}
