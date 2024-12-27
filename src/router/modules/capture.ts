// import { $t } from "@/locales/i18n";
// const Layout = () => import("@/layout/index.vue");

export default [
  {
    path: "/capture",
    // component: Layout,
    component: () => import("@/views/patient/index.vue")
  }
] as Array<RouteConfigsTable>;
