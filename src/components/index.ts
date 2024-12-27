import type { App, Component } from "vue";
import AngioLayerThumbnailCard from "./angio-layer-thumbnail-card/index.vue";
import AnalysisCaptureInfoBox from "./analysis-capture-info-box/index.vue";
import IconSvg from "./icon-svg/index.vue";
import BscanThumbnailCard from "./bscan-thumbnail-card/index.vue";
import BscanDirection from "./bscan-direction/index.vue";
import CaptureInfoCard from "./capture-info-card/index.vue";
import LoadingContent from "./loading-content/index.vue";
import MaskContent from "./mask-content/index.vue";
import BrightnessContrastCard from "./brightness-contrast-card/index.vue";
import CscanSelector from "./cscan-selector/index.vue";

const components = [
  AngioLayerThumbnailCard,
  AnalysisCaptureInfoBox,
  IconSvg,
  BscanThumbnailCard,
  BscanDirection,
  CaptureInfoCard,
  LoadingContent,
  MaskContent,
  BrightnessContrastCard,
  CscanSelector
];

export function useComponents(app: App) {
  // register components
  components.forEach((component: Component) => {
    app.component(component.name as string, component);
  });
}
