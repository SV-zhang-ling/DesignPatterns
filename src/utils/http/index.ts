/* eslint-disable */
// @ts-nocheck
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import {
  AxiosHttpError,
  RequestMethods,
  AxiosHttpResponse,
  AxiosHttpRequestConfig
} from "./types.d";
import { doLogout } from "@/utils/auth";
import { ErrorCodeEnum } from "@/enums";
import { ElMessageBox, ElNotification } from "element-plus";
import { VueI18n } from "@/locales/i18n";

// 动态导入图像文件
const warningIcon = require("@/assets/icons/warning.svg");

// 相关配置请参考：www.axios-js.com/zh-cn/docs/#axios-request-config-1
const defaultConfig: AxiosRequestConfig = {
  // 请求超时时间
  baseURL: process.env.VUE_APP_BASE_API_URL,
  timeout: 1200000 // 超时限制20分钟
  // 数组格式参数序列化（https://github.com/axios/axios/issues/5142）
  // paramsSerializer: {
  //   serialize: stringify as unknown as CustomParamsSerializer
  // }
};
let requestCounter = 0;
const BsancRequestUrl = "/bscan";
// const userInputUrl = "/userinput";

let lastPromptTime: number | null = null;
const cooldownDuration3s = 3 * 1000; // 3 seconds cooldown
const cooldownDuration10s = 10 * 1000; // 10 seconds cooldown

const validErrorCodes = [30102, 20105, 30103, 3010002, 60102];
// 根据错误码，获取提示信息
const tipMessage = (errorCode: number, info?: number) => {
  if (!errorCode || !validErrorCodes.includes(errorCode) || !VueI18n) return "";

  const msg = VueI18n(`common.analysisError_${errorCode}`);
  if (!msg) return "";

  // Helper function for safe HTML escape
  const escapeHTML = (str: string): string =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  let sanitizedMessage = msg;

  if (info) {
    let timeRemain = Math.round(info / 60),
      unit = VueI18n(`common.${timeRemain > 1 ? "minutes" : "minute"}`);
    if (info < 60) {
      timeRemain = info;
      unit = VueI18n(`common.${timeRemain > 1 ? "seconds" : "second"}`);
    }

    // Escape dynamic content
    sanitizedMessage = VueI18n(`common.analysisError_${errorCode}`, {
      timeRemain,
      unit
    });
  }

  return `<div class="message-content">
    <img src="${escapeHTML(warningIcon)}" />
    <span class="text">${escapeHTML(sanitizedMessage)}</span>
  </div>`;
};

const showTipBox = (msg: string) => {
  ElMessageBox({
    type: "warning",
    title: "",
    customClass: "custom-icon-message-box",
    message: msg,
    dangerouslyUseHTMLString: true,
    confirmButtonText: VueI18n("common.confirmText"),
    closeOnClickModal: false,
    showClose: false
  });
};

const showToast = (msg?: string) => {
  ElNotification({
    type: "warning",
    message: msg,
    customClass: "custom-notification-center"
  });
};

class AxiosHttp {
  constructor() {
    this.httpInterceptorsRequest();
    this.httpInterceptorsResponse();
  }

  /** token过期后，暂存待执行的请求 */
  private static requests = [];

  /** 防止重复刷新token */
  private static isRefreshing = false;

  /** 初始化配置对象 */
  private static initConfig: AxiosHttpRequestConfig = {};

  /** 保存当前Axios实例对象 */
  private static axiosInstance: AxiosInstance = Axios.create(defaultConfig);

  /** 重连原始请求 */
  // private static retryOriginalRequest(config: AxiosHttpRequestConfig) {
  //   return new Promise(resolve => {
  //     AxiosHttp.requests.push((token: string) => {
  //       config.headers["Authorization"] = formatToken(token);
  //       resolve(config);
  //     });
  //   });
  // }

  /** 请求拦截 */
  private httpInterceptorsRequest(): void {
    AxiosHttp.axiosInstance.interceptors.request.use(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (config: AxiosHttpRequestConfig): Promise<any> => {
        const maskDom = document.getElementById("loadingMask") as HTMLElement;
        if (config.url && config.url?.indexOf(BsancRequestUrl) === -1)
          requestCounter++;
        if (
          !window.noLoadingMask &&
          requestCounter &&
          !window.isSaveImages &&
          !window.isAllSaveImages
        ) {
          maskDom && (maskDom.style.display = "flex");
        }
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof config.beforeRequestCallback === "function") {
          config.beforeRequestCallback(config);
          return config;
        }
        if (AxiosHttp.initConfig.beforeRequestCallback) {
          AxiosHttp.initConfig.beforeRequestCallback(config);
          return config;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
  }

  /** 响应拦截 */
  private httpInterceptorsResponse(): void {
    const instance = AxiosHttp.axiosInstance;
    instance.interceptors.response.use(
      async (response: AxiosHttpResponse) => {
        const maskDom = document.getElementById("loadingMask") as HTMLElement;
        if (response.request.responseURL.indexOf(BsancRequestUrl) === -1)
          requestCounter--;
        if (
          requestCounter == 0 &&
          !window.isSaveImages &&
          !window.isAllSaveImages
        ) {
          maskDom && (maskDom.style.display = "none");
        }
        if (
          response.data instanceof Blob &&
          response.data.type.includes("json")
        ) {
          const jsonText = await response.data.text();
          const resJson = JSON.parse(jsonText);
          response.data = resJson;
        }

        if (response.data.code && !response.data.succeed) {
          const currentTime = Date.now();
          const { code, data } = response.data;
          // Error code definition see: https://github.com/SVisions/Picasso-Software/blob/Picasso%23U0/main/Doc/Vangogh/x.0%E9%94%99%E8%AF%AF%E4%BB%A3%E7%A0%81%E5%AE%9A%E4%B9%89.md
          switch (code) {
            case ErrorCodeEnum.UNAUTHORIZED_CODE:
              // user unauthorized condition: redirect to login
              doLogout();
              break;
            case ErrorCodeEnum.LoginError:
              showToast(VueI18n("common.loginFail"));
              break;
            case ErrorCodeEnum.PwdError:
            case ErrorCodeEnum.PwdFmtError:
            case ErrorCodeEnum.PwdFailError:
            case ErrorCodeEnum.PwdSameError:
            case ErrorCodeEnum.PwdUpdateError:
              showToast(VueI18n(`common.commonError_${code}`));
              break;
            case ErrorCodeEnum.LoginLock:
              showTipBox(tipMessage(code, data.timeRemain));
              break;
            case ErrorCodeEnum.BEING_USED:
              if (
                !lastPromptTime ||
                currentTime - lastPromptTime >= cooldownDuration3s
              ) {
                showTipBox(tipMessage(code));
                lastPromptTime = currentTime;
              }
              break;
            case ErrorCodeEnum.SERVER_BUSY:
              if (
                !lastPromptTime ||
                currentTime - lastPromptTime >= cooldownDuration3s
              ) {
                showTipBox(tipMessage(code));
                lastPromptTime = currentTime;
              }
              break;
            case ErrorCodeEnum.SERVER_LOAD_HEAVY:
              // if VG is in use, show this tip.
              // 增加二次请求失败时给提示
              if (
                !lastPromptTime ||
                currentTime - lastPromptTime >= cooldownDuration10s
              ) {
                showTipBox(tipMessage(code));
                lastPromptTime = currentTime;
              }
              break;
            case ErrorCodeEnum.SAVE_USERINPUT_FAIL:
              showToast(VueI18n(`common.dataError_${code}`));
              break;
            case ErrorCodeEnum.NOT_ENOUGH_VOLUME:
              showTipBox(tipMessage(code));
              break;
            case ErrorCodeEnum.SaveSurfaceError:
              showToast(VueI18n(`common.analysisError_${code}`));
              break;
            default:
              console.log(`No such error code! ${code}`);
          }
          return;
        }

        const $config = response.config;
        // 优先判断post/get等方法是否传入回调，否则执行初始化设置等回调
        if (typeof $config.beforeResponseCallback === "function") {
          $config.beforeResponseCallback(response);
          return response;
        }
        if (AxiosHttp.initConfig.beforeResponseCallback) {
          AxiosHttp.initConfig.beforeResponseCallback(response);
          return response.data;
        }
        return response.data;
      },
      (error: AxiosHttpError) => {
        const maskDom = document.getElementById("loadingMask") as HTMLElement;
        requestCounter = 0;
        maskDom && (maskDom.style.display = "none");
        const $error = error;
        $error.isCancelRequest = Axios.isCancel($error);
        // 所有的响应异常 区分来源为取消请求/非取消请求
        return Promise.reject($error);
      }
    );
  }

  /** 通用请求工具函数 */
  public request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: AxiosHttpRequestConfig
  ): Promise<T> {
    const config = {
      method,
      url,
      ...param,
      ...axiosConfig
    } as AxiosHttpRequestConfig;

    // 单独处理自定义请求/响应回调
    return new Promise((resolve, reject) => {
      AxiosHttp.axiosInstance
        .request(config)
        .then((response: AxiosResponse) => {
          resolve(response as unknown as Promise<T>);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /** 单独抽离的post工具函数 */
  public post<T, P>(
    url: string,
    data?: AxiosRequestConfig<T>,
    config?: AxiosHttpRequestConfig
  ): Promise<P> {
    return this.request<P>("POST", url, data, config);
  }

  /** 单独抽离的get工具函数 */
  public get<T, P>(
    url: string,
    params?: AxiosRequestConfig<T>,
    config?: AxiosHttpRequestConfig
  ): Promise<P> {
    return this.request<P>("GET", url, params, config);
  }
}

export const http = new AxiosHttp();
