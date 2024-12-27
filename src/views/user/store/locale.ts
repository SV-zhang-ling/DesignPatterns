import { defineStore } from "pinia";
import { store } from "@/store";
import LocalStorageUtil from "@/utils/localStorageUtil";

interface LocaleState {
  lang?: string;
}

export const useLocaleStore = defineStore({
  id: "locale",
  state: (): LocaleState => ({
    lang: ""
  }),
  actions: {
    SET_LANG(lang: string) {
      LocalStorageUtil.setItem("lang", lang);
      this.lang = lang;
    }
  }
});

export function useLocaleStoreHook() {
  return useLocaleStore(store);
}
