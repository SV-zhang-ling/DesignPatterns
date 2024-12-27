import { useRoute } from "vue-router";

export const getAnalysisRouteQuery = (): AcitveCaptureInfo => {
  const route = useRoute();
  const {
    query: { captureKey },
    path
  } = route;
  return {
    captureKey,
    path
  } as AcitveCaptureInfo;
};

// map of the page and its path
export const PageRoute = {
  Login: "/login",
  Patient: "/patient",
  Angiography: "/analysis/angio",
  AngioRetinaEnhanced: "/analysis/angioRetinaEnhanced",
  MultipleAngio: "/analysis/angio/multiple",
  LineScan: "/analysis/line",
  MultipleLineScan: "/analysis/line/multiple",
  Mosaic: "/analysis/mosaic",
  MosaicAngioRetinaEnhanced: "/analysis/mosaic/angioRetinaEnhanced",
  MosaicStructuralProj: "/analysis/mosaic/structuralProj",
  AdvancedSeg: "/analysis/advancedSeg",
  StructuralProjection: "/analysis/structuralProj",
  AsStructuralProj: "/analysis/asStructuralProj",
  Cube: "/analysis/cube",
  AsCube: "/analysis/asCube"
};
