import Axios, {
  Method,
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig
} from "axios";

export type resultType = {
  accessToken?: string;
};

export type RequestMethods = Extract<Method, "GET" | "POST" | "PUT" | "DELETE">;

export interface AxiosHttpError extends AxiosError {
  isCancelRequest?: boolean;
}

export interface AxiosHttpResponse extends AxiosResponse {
  config: AxiosHttpRequestConfig;
}

export interface AxiosHttpRequestConfig extends AxiosRequestConfig {
  beforeRequestCallback?: (request: AxiosHttpRequestConfig) => void;
  beforeResponseCallback?: (response: AxiosHttpResponse) => void;
}

export default class AxiosHttp {
  request<T>(
    method: RequestMethods,
    url: string,
    param?: AxiosRequestConfig,
    axiosConfig?: AxiosHttpRequestConfig
  ): Promise<T>;
  post<T, P>(
    url: string,
    params?: T,
    config?: AxiosHttpRequestConfig
  ): Promise<P>;
  get<T, P>(
    url: string,
    params?: T,
    config?: AxiosHttpRequestConfig
  ): Promise<P>;
}
