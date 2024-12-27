import { defineStore } from "pinia";
import { store } from "@/store";
import LocalStorageUtil from "@/utils/localStorageUtil";
import { login, logout, changePwd, delay } from "@/api/user";
import { User, UserResult, pwdParams } from "./user.d";

interface UserState {
  name?: string;
  pwd?: string;
  roles?: Array<string>;
}

export const useUserStore = defineStore({
  id: "user",
  state: (): UserState => ({
    name: "",
    pwd: "",
    roles: []
  }),
  actions: {
    SET_USERNAME(username: string | undefined) {
      LocalStorageUtil.setItem("name", username);
      this.name = username;
    },
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    async login(params: User): Promise<UserResult> {
      try {
        const data = await login(params);
        this.SET_USERNAME(params.name);
        return data as UserResult;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async logout(): Promise<UserResult> {
      try {
        const data = await logout();
        return data as UserResult;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async changePwd(params: pwdParams): Promise<UserResult> {
      try {
        const data = await changePwd(params);
        return data as UserResult;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async delay30Days(): Promise<UserResult> {
      try {
        const data = await delay();
        return data as UserResult;
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
