/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module "*.js"; // 兼容opencv相关js模块文件的导出
declare module "uuid";
declare module "dom-to-image";
