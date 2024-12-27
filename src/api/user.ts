import { http } from "@/utils/http";
import { pApi } from "./common";
import { User, pwdParams } from "@/views/user/store/user.d";

export type RefreshTokenResult = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expires?: Date;
  };
};

/**
 * user login
 */
export const login = (data?: User) => {
  return http.post(pApi("/login"), { data });
};

/**
 * user logout
 */
export const logout = () => {
  return http.post(pApi("/logout"));
};

/**
 * change password
 */
export const changePwd = (params: pwdParams) => {
  return http.post(pApi("/user/changepwd"), { data: params });
};

/**
 * delay 30 days
 */
export const delay = () => {
  return http.post(pApi("/user/changeexpiretime"));
};
