import { initOpencv } from "@/utils/opencv/index.js";
import { createApp, Directive } from "vue";
import App from "./App.vue";
import "element-plus/dist/index.css";
import { useElementPlus } from "@/plugins/element-plus";
import { usePackages } from "@/packages/index";
import { useComponents } from "@/components/index";
import { setupStore } from "@/store";
import { createEventTracker } from "./event-tracking";

// 引入自定义字体
import "@/assets/font/font.css";
// 导入公共样式
import "@/assets/styles/index.scss";

import router from "@/router";
import { i18n } from "@/locales/i18n";
import { forbidBrowserDefaultContextmenu, beforeCloseNavigator } from "@/utils";
import * as directives from "@/directives";
import "./auto-update";
import { EventTypeEnum } from "./event-tracking";

forbidBrowserDefaultContextmenu();

const app = createApp(App);

// 注册自定义指令
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

// register self-defined components
usePackages(app);
useComponents(app);

// register element plus components
useElementPlus(app);

// Multilingual configuration
// 多语言配置
app.use(i18n);

// Configure routing
// 配置路由
app.use(router);

// Configure Analytics
// 配置埋点
const analytics = createEventTracker(router);
app.use(analytics, { events: [EventTypeEnum.PAGE] });

// Configure store
setupStore(app);

beforeCloseNavigator();

/**
 * app初始化时判断cv是否是一个promise实例，如果是需要等实例加载完成。再在cv上挂载自定义方法和初始化Vue实例；
 * 如果不是说明cv已经初始化完成，直接使用，无需再次在cv上挂载自定义方法（这种情况只会出现在开发模式下ctrl+s保存时出现，production模式不会有这个问题）
 */
if (cv instanceof Promise) {
  cv.then(cv => {
    window.cv = cv;
    initOpencv(cv);
    app.mount("#app");
  });
} else {
  app.mount("#app");
}
