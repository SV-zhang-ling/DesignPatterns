// 全局路由类型声明
import { type RouteComponent, type RouteLocationNormalized } from "vue-router";

declare global {
  interface ToRouteType extends RouteLocationNormalized {
    meta: CustomizedRouteMeta;
  }

  /**
   * @description 完整子路由的meta配置表
   */
  interface CustomizedRouteMeta {
    title: string;
    /** 页面级别权限设置 `可选` */
    roles?: Array<string>;
    /** 按钮级别权限设置 `可选` */
    auths?: Array<string>;
  }

  /**
   * @description 完整子路由配置表
   */
  interface RouteChildrenConfigsTable {
    /** 子路由地址 `必填` */
    path: string;
    /** 路由名字（对应不要重复，和当前组件的`name`保持一致）`必填` */
    name?: string;
    /** 路由重定向 `可选` */
    redirect?: string;
    /** 按需加载组件 `可选` */
    component?: RouteComponent;
    meta?: CustomizedRouteMeta;
    /** 子路由配置项 */
    children?: Array<RouteChildrenConfigsTable>;
  }

  /**
   * @description 整体路由配置表（包括完整子路由）
   */
  interface RouteConfigsTable {
    /** 路由地址 `必填` */
    path: string;
    /** 路由名字（保持唯一）`可选` */
    name?: string;
    /** `Layout`组件 `可选` */
    component?: RouteComponent;
    /** 路由重定向 `可选` */
    redirect?: string;
    meta?: CustomizedRouteMeta;
    /** 子路由配置项 */
    children?: Array<RouteChildrenConfigsTable>;
  }
}

declare module "vue-router" {
  interface RouteMeta extends CustomizedRouteMeta {}
}
