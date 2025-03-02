import axios from "axios";
import { alertFail, showFail, showSuccess } from "./showMessage";
import { useUserStore } from "@/stores/user";
import qs from "qs";
import { baseUrl } from "@/stores/basic-data";
let userStore: ReturnType<typeof useUserStore>;
const url = baseUrl;
axios.defaults.baseURL = url;
export const axiosClient = axios.create({
  baseURL: url,
  timeout: 3000,
});

axiosClient.interceptors.request.use((config) => {
  if (userStore && userStore.token) {
    console.log("Token in interceptor:", userStore.token);
    config.headers["authorization"] = userStore?.token;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (res) => {
    if (res.status >= 200 && res.status < 300) {
      showSuccess(res?.config?.url, res);
    } else {
      showFail(res?.config?.url, res);
    }
    return Promise.resolve(res);
  },
  (error) => {
    showFail(error?.config?.url, error);
    return Promise.reject(error);
  }
);

export async function apiLogin(loginData: any) {
  userStore = useUserStore();

  try {
    let res = await axiosClient.post("auth/jwt/login", qs.stringify(loginData));
    if (res) {
      let token = "Bearer " + res?.data?.access_token;
      userStore.setToken(token);
      userStore.setLoginState(true);
      userStore.setUserName(loginData.username);
      userStore.setPassword(loginData.password);
      await apiGetProfile();
      return Promise.resolve(res?.data);
    } else {
      userStore.setLoginState(false);
      alertFail(apiLogin.name, "登录发生错误，服务端无响应");
    }
  } catch (e: any) {
    userStore.setLoginState(false);
    alertFail(apiLogin.name, e?.message);
  }
}

export async function apiGetProfile() {
  userStore = useUserStore();
  try {
    var res = await axiosClient.get("users/me");
    var userData = res?.data;
    userStore.setUser(userData);
    return Promise.resolve(userData);
  } catch (e: any) {
    alertFail(apiGetProfile.name, e?.message);
  }
}

export async function apiLogout() {
  userStore = useUserStore();
  let res;
  try {
    res = await axiosClient.post("/auth/jwt/logout");
    userStore.setLoginState(false);
    userStore.setToken("");
    userStore.setUser({});
    return Promise.resolve(res.data ? res.data : res?.statusText);
  } catch (e: any) {
    alertFail(apiLogout.name, e?.message);
    if (res?.status && res.status == 401) {
      userStore.setLoginState(false);
      userStore.setToken("");
      userStore.setUser({});
    }
    return e;
  }
}

async function autoLogin(error: any) {
  if (error.status == 401) {
    userStore = useUserStore();
    let loginData = {
      username: userStore.userName,
      password: userStore.getDecodedPwd,
    };
    let data = await apiLogin(loginData);
    return Promise.resolve(data);
  } else {
    alertFail(error?.message, "");
  }
}
export async function apiDeleteImageByPath(path: unknown) {
  console.log(apiDeleteImageByPath.name, path);
  if (path) {
    try {
      let data = await axiosClient.delete("/deleteimage-bypath" + path);
      showSuccess(apiDeleteImageByPath.name, data);
      return Promise.resolve(data);
    } catch (error) {
      let login = await autoLogin(error);
      if (login) {
        try {
          let data = await axiosClient.delete("/deleteimage-bypath" + path);
          showSuccess(apiDeleteImageByPath.name, data);
          return Promise.resolve(data);
        } catch (error: any) {
          alertFail(apiDeleteImageByPath.name, error?.message);
        }
      }
    }
  } else {
    alertFail(apiDeleteImageByPath.name, "待删除文件path不能为空");
  }
}

export async function apiGetDetailProfile() {
  userStore = useUserStore();
  try {
    let res = await axiosClient.get("users/mine/");
    let userData = res?.data;
    return Promise.resolve(userData);
  } catch (error: any) {
    alertFail(apiGetProfile.name, error?.message);
  }
}

export async function apiRenameMe(postData: Object) {
  try {
    let data = await axiosClient.post("/users/rename/", postData);
    showSuccess(apiRenameMe.name, data);

    return Promise.resolve(data);
  } catch (error: any) {
    alertFail(apiRenameMe.name, error?.message);
  }
}

export async function apiModifyPassword(password: string) {
  try {
    let user = await apiGetProfile();
    if (user) {
      user.password = password;
      let res = await axiosClient.patch("/users/me", user);

      if (res?.data) {
        showSuccess(apiModifyPassword.name, res?.data);
        return Promise.resolve(res.data);
      } else {
        alertFail(apiModifyPassword.name, "Fail to modify password");
      }
    } else {
      alertFail(apiModifyPassword.name, "Fail to modify password");
    }
  } catch (error: any) {
    alertFail(apiRenameMe.name, error?.message);
  }
}

export async function apiRegister(postData: any) {
  postData.is_active = true;
  postData.is_superuser = false;
  postData.is_verified = false;
  try {
    let res = await axiosClient.post("/auth/register", postData);
    if (res?.data) {
      let loginData = { username: postData.email, password: postData.password };
      await apiLogin(loginData);
      let out = await apiRenameMe({ name: postData.email, avatar: "" });
      showSuccess(apiRegister.name, out?.data);
      return Promise.resolve(out?.data);
    } else {
      alertFail(apiRegister.name, "Fail to register");
    }
  } catch (error: any) {
    let detail = error?.response?.data.detail;
    alertFail(apiRegister.name, detail ? detail : error?.message);
  }
}
