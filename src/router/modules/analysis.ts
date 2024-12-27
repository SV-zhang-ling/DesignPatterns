// import { $t } from "@/locales/i18n";
// const Layout = () => import("@/layout/index.vue");
import { PageRoute } from "@/utils/route";

export default [
  {
    path: PageRoute.Angiography,
    component: () => import("@/views/analysis/posterior/angio/index.vue")
  },
  {
    path: PageRoute.AngioRetinaEnhanced,
    component: () =>
      import("@/views/analysis/posterior/angio-retina-enhanced/index.vue")
  },
  {
    path: PageRoute.MultipleAngio,
    component: () =>
      import("@/views/analysis/posterior/angio/multiple/index.vue")
  },
  {
    path: PageRoute.LineScan,
    component: () => import("@/views/analysis/lineScan/single/index.vue")
  },
  {
    path: PageRoute.MultipleLineScan,
    component: () => import("@/views/analysis/lineScan/multiple/index.vue")
  },
  {
    path: PageRoute.Mosaic,
    component: () => import("@/views/analysis/mosaic/index.vue")
  },
  {
    path: PageRoute.MosaicAngioRetinaEnhanced,
    component: () =>
      import("@/views/analysis/mosaic/angio-retina-enhanced/index.vue")
  },
  {
    path: PageRoute.MosaicStructuralProj,
    component: () => import("@/views/analysis/mosaic/structuralProj/index.vue")
  },
  {
    path: PageRoute.AdvancedSeg,
    component: () => import("@/views/analysis/posterior/advancedSeg/index.vue")
  },
  {
    path: PageRoute.StructuralProjection,
    component: () => import("@/views/analysis/structuralProj/index.vue")
  },
  {
    path: PageRoute.AsStructuralProj,
    component: () => import("@/views/analysis/structuralProj/index.vue")
  },
  {
    path: PageRoute.Cube,
    component: () => import("@/views/analysis/cube/index.vue")
  },
  {
    path: PageRoute.AsCube,
    component: () => import("@/views/analysis/cube/index.vue")
  }
] as Array<RouteConfigsTable>;
