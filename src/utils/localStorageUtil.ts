class LocalStorageUtil {
  private static namespace = "_PicassoPersistedPrefix_"; // 系统命名空间前缀

  // 获取 localStorage 中的值
  static getItem<T>(key: string): T | undefined {
    try {
      const namespacedKey = `${LocalStorageUtil.namespace}${key}`;
      const serializedValue = localStorage.getItem(namespacedKey);
      if (serializedValue === null) {
        return undefined;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${error}`);
      return undefined;
    }
  }

  // 设置 localStorage 中的值
  static setItem<T>(key: string, value: T): void {
    try {
      const namespacedKey = `${LocalStorageUtil.namespace}${key}`;
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(namespacedKey, serializedValue);
    } catch (error) {
      console.error(`Error setting item in localStorage: ${error}`);
    }
  }

  // 移除 localStorage 中的值
  static removeItem(key: string): void {
    try {
      const namespacedKey = `${LocalStorageUtil.namespace}${key}`;
      localStorage.removeItem(namespacedKey);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${error}`);
    }
  }

  // 清空 localStorage
  static clear(): void {
    try {
      // 注意：这里清空的是所有带有命名空间前缀的项
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LocalStorageUtil.namespace)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
    }
  }
}

export default LocalStorageUtil;
