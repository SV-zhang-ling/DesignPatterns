import type { App } from "vue";
import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persist";

const store = createPinia();

// 在pinia的实例上添加持久化插件
store.use(piniaPersist);

/**
 * 在vue实例对象上注册pinia
 * @param app vue实例对象
 */
export function setupStore(app: App<Element>) {
  app.use(store);
}

export { store };
