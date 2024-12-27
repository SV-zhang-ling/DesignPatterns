import { App } from "vue";
import { type I18n, createI18n } from "vue-i18n";
import { getDefaultLang } from "@/utils";

// element-plus国际化
import enLocale from "element-plus/es/locale/lang/en";
import zhLocale from "element-plus/es/locale/lang/zh-cn";

import enLang from "./lang/en";
import zhCNLang from "./lang/zh-CN";

export const localesConfigs = {
  "zh-CN": {
    ...zhCNLang,
    ...zhLocale
  },
  en: {
    ...enLang,
    ...enLocale
  }
};

export const $t = (key: string) => key;

export const i18n: I18n = createI18n({
  legacy: false,
  locale: getDefaultLang(),
  fallbackLocale: "en",
  globalInjection: true,
  messages: localesConfigs
});

interface TranslateFnType {
  (key: string): string;
}

export const VueI18n: TranslateFnType = i18n.global.t;

export function useI18n(app: App) {
  app.use(i18n);
}
