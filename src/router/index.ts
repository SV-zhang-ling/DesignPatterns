import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import NProgress from "@/utils/progress";
import { PageRoute } from "@/utils/route";
import analysisRouteModule from "./modules/analysis";
import Layout from "@/layout/index.vue";
import AnalysisLayout from "@/views/analysis/index.vue";

const routes: Array<RouteConfigsTable> = [
  // {
  //   path: "/playground",
  //   name: "Playground",
  //   component: () => import("@/views/PlaygroundView.vue")
  // },
  // {
  //   path: "/playground-bscan",
  //   name: "PlaygroundBscan",
  //   component: () => import("@/views/PlaygroundBscanView.vue")
  // },
  {
    path: "/",
    redirect: "login"
  },
  {
    path: PageRoute.Login,
    name: "login",
    component: () => import("@/views/user/LoginView.vue")
  },
  {
    path: "/",
    name: "Home",
    component: Layout,
    children: [
      {
        // 展示基本控件
        path: "basics",
        name: "BasicComponents",
        component: () => import("@/views/BasicComponents.vue")
      },
      {
        path: "patient",
        name: "Patient",
        component: () => import("@/views/patient/index.vue")
      },
      // {
      //   path: "capture",
      //   component: () => import("@/views/"),
      // },
      {
        path: "analysis",
        component: AnalysisLayout,
        redirect: "analysis/angio",
        children: [...analysisRouteModule]
      }
    ]
  },
  {
    path: "/redirect",
    // component: Layout,
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/layout/RedirectView.vue")
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(process.env.VUE_APP_PUBLIC_PATH),
  routes: routes as Array<RouteRecordRaw>
});

// 导航守卫，后续增加是否登录判断
router.beforeEach(() => {
  NProgress.start();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
