export interface User {
  name?: string;
  pwd?: string;
}

export interface UserResultDataType {
  expireTime: null | number;
  shouldChangePwd: boolean;
}

export interface UserResult {
  code: number;
  succeed: string;
  data?: UserResultDataType;
  message?: string;
  route?: string;
}

export interface pwdParams {
  curPwd: string;
  newPwd: string;
}
