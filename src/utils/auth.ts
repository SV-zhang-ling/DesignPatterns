import router from "@/router";
import LocalStorageUtil from "@/utils/localStorageUtil";

export const TokenKey = "authorized-token";

/** 获取`token` */
export function getToken() {
  //
}

/**
 * @description 设置`token`以及一些必要信息并采用无感刷新`token`方案
 * 无感刷新：后端返回`accessToken`（访问接口使用的`token`）、`refreshToken`（用于调用刷新`accessToken`的接口时所需的`token`，`refreshToken`的过期时间（比如30天）应大于`accessToken`的过期时间（比如2小时））、`expires`（`accessToken`的过期时间）
 * 将`accessToken`、`expires`这两条信息放在key值为authorized-token的cookie里（过期自动销毁）
 * 将`username`、`roles`、`refreshToken`、`expires`这四条信息放在key值为`user-info`的sessionStorage里（浏览器关闭自动销毁）
 */
export function setToken(data: string) {
  //
}

/** 删除`token`以及key值为`user-info`的session信息 */
export function removeToken() {
  // Cookies.remove(TokenKey);
  // sessionStorage.clear();
}

/** 格式化token（jwt格式） */
export const formatToken = (token: string): string => {
  return "Bearer " + token;
};

// clear some information before logout
export const doLogout = () => {
  LocalStorageUtil.removeItem("name");
  sessionStorage.clear();
  if (router) {
    if (router.currentRoute && router.currentRoute.value.name == "login") {
      return;
    }
    router.replace({
      path: "/login"
    });
  }
};
