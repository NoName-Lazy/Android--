import axios from "axios";
import { alertFail, showFail, showSuccess } from "./showMessage";
import { useUserStore } from "@/stores/user";
import qs from "qs";
import { baseUrl } from "@/stores/basic-data";
import { ref, toValue, watch, watchEffect } from "vue";
import { gotoLogin } from "@/router";
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
      userStore.setUserDetail({});
    }
    gotoLogin();
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
    userStore.setUserDetail(userData);
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

export function apiGetAllItemsRefresh(
  timeCounter: any,
  query = ref("skip=0&limit=100")
) {
  let list: any = ref(null);
  let error = ref(null);
  let isLoading = ref(true);
  let url;
  watchEffect(() => {
    url = "/items/auto-refresh/${toValue(timeCounter)}?${toValue(query)}";
    isLoading.value = true;
    axiosClient
      .get(url)
      .then((res) => {
        if (res?.data) {
          list.value = res.data;
        }
        isLoading.value = false;
        error.value = null;
      })
      .catch((e) => {
        error.value = e?.message ? e.message : JSON.stringify(e, null, 1);
        isLoading.value = false;
      });
  });
  return { list, error, isLoading };
}

export async function loginOnLaunch() {
  userStore = useUserStore();
  if (userStore.isLogin) {
    let loginData = {
      username: userStore.userName,
      password: userStore.getDecodedPwd,
    };
    try {
      let data = await apiLogin(loginData);
      if (data) {
        let userDetail = await apiGetDetailProfile();
        if (userDetail) {
          userStore.setUserDetail(userDetail);
        }
        return Promise.resolve(data);
      } else {
        return Promise.reject("Login failed");
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export function apiGetAllItemsByUserId(
  timeCounter: any,
  user_UUID: any,
  query = ref("")
) {
  let list = ref(null);
  let error = ref(null);
  let isLoading = ref(true);
  let url;
  let watchData = [
    () => toValue(timeCounter),
    () => toValue(user_UUID),
    () => toValue(query),
  ];
  watch(watchData, () => {
    let q = toValue(query);
    let uuid = toValue(user_UUID);
    console.log(apiGetAllItemsByUserId.name, "UUID", uuid);
    if (!uuid) {
      list.value = null;
      isLoading.value = false;
    } else {
      url = `/items/users/${uuid}`;
      if (q) {
        url = `${url}?keyword=${q}`;
      }
      isLoading.value = true;
      axiosClient
        .get(url)
        .then((res) => {
          if (res?.data) {
            list.value = res.data;
          }
          isLoading.value = false;
          error.value = null;
        })
        .catch((e) => {
          if (e.status == 404) {
            showFail(apiGetAllItemsByUserId.name, "无数据");
            list.value = null;
            error.value = null;
          } else {
            error.value = e?.message ? e.message : JSON.stringify(e, null, 1);
          }
          isLoading.value = false;
        });
    }
  });
  console.log(list, isLoading);

  return { list, error, isLoading };
}
export async function apiDeleteImageById(id: any) {
  try {
    let res = await axiosClient.delete(`/deleteimage-byid/${id}`);
    return Promise.resolve(res?.data);
  } catch (error: any) {
    alertFail(apiDeleteImageById.name, error?.message);
  }
}

export async function apiAddOrEditImageById(itemId: any, params: any) {
  try {
    let res = await axiosClient.post(
      `/modifyimage/${itemId}/${params.id}`,
      params
    );
    return Promise.resolve(res?.data);
  } catch (error: any) {
    alertFail(apiAddOrEditImageById.name, error?.message);
  }
}

export async function apiPostItemTitle(params: any) {
  try {
    let res = await axiosClient.post("/items/", params);
    return Promise.resolve(res?.data);
  } catch (error: any) {
    alertFail(apiPostItemTitle.name, error?.message);
  }
}

export async function apiModifyItemTitle(itemId: any, params: any) {
  try {
    let res = await axiosClient.post("/items/put/" + itemId, params);
    return Promise.resolve(res?.data);
  } catch (error: any) {
    alertFail(apiModifyItemTitle.name, error?.message);
  }
}

export function apiGetItemById(itemId: any, refreshCount = ref(0)) {
  const error = ref(null);
  const itemData = ref(null);
  const isLoading = ref(true);
  watch(
    () => toValue(refreshCount),
    () => {
      isLoading.value = true;
      axiosClient
        .get("/items/" + itemId)
        .then((res) => {
          console.log("res", res);
          if (res?.data) {
            itemData.value = res.data;
            console.log(apiGetItemById.name, "itemData", itemData);
          }
          isLoading.value = false;
          error.value = null;
        })
        .catch((e) => {
          alertFail(apiGetItemById.name, e?.message);
          error.value = e?.message;
          isLoading.value = false;
        });
    }
  );
  return { itemData, error, isLoading };
}

export async function apiDeleteItemById(itemId: any) {
  try {
    let res = await axiosClient.delete("/deleteitem-byid/", itemId);
    return Promise.resolve(res?.data);
  } catch (error: any) {
    alertFail(apiDeleteItemById.name, error?.message);
  }
}

export function apiGetCommentsByItemId(counter = ref(1), itemId: any) {
  const comments: any = ref(null);
  const error = ref(null);
  const isLoading = ref(true);
  const watchData = [() => toValue(counter), () => toValue(itemId)];
  watch(watchData, () => {
    let url = "/comments/by-itemid/" + toValue(itemId);
    console.log("comment_url", url);
    isLoading.value = true;
    axiosClient
      .get(url)
      .then((res) => {
        if (res?.data) {
          comments.value = res.data;
        }
        isLoading.value = false;
        error.value = null;
      })
      .catch((e) => {
        console.log("e", e);
        if (e.status == 404) {
          showFail(apiGetCommentsByItemId.name, "无评论数据");
          comments.value = [];
        } else {
          alertFail(apiGetCommentsByItemId.name, e?.message);
          error.value = e?.message;
        }
        isLoading.value = false;
      });
  });
  return { comments, error, isLoading };
}

export async function apiDeleteCommentById(commentId: any) {
  try {
    let res = await axiosClient.delete("/delete-comment/" + commentId);
    return Promise.resolve(res?.data);
  } catch (error: any) {
    alertFail(apiDeleteCommentById.name, error?.message);
  }
}
export async function apiPostComment(itemId: any, params: any) {
  try {
    let res = await axiosClient.post("/comments/" + itemId, params);
    return Promise.resolve(res?.data);
  } catch (error: any) {
    alertFail(apiPostComment.name, error?.message);
  }
}
export async function apiAddItemStar(itemId: any) {
  try {
    let res = await axiosClient.post("/items/put/addstar/" + itemId);
    return Promise.resolve(res?.data);
  } catch (error: any) {
    alertFail(apiAddItemStar.name, error?.message);
  }
}
export function apiGetMyComments(counter = ref(1)) {
  const comments: any = ref(null);
  const error = ref(null);
  const isLoading = ref(true);
  const watchData = [() => toValue(counter)];
  watch(watchData, () => {
    let url = "/comments/mine/";
    isLoading.value = true;
    axiosClient
      .get(url)
      .then((res) => {
        if (res?.data) {
          comments.value = res.data;
        }
        isLoading.value = false;
        error.value = null;
      })
      .catch((e) => {
        console.log("e", e);
        if (e.status == 404 || e.status == 401) {
          showFail(apiGetCommentsByItemId.name, "无评论数据");
          comments.value = [];
        } else {
          alertFail(apiGetCommentsByItemId.name, e?.message);
          error.value = e?.message;
        }
        isLoading.value = false;
      });
  });
  return { comments, error, isLoading };
}

export async function apiPostItemDetail(
  itemIdRef: any,
  titleForm: any,
  imgContents: any
) {
  let itemId = itemIdRef.value;
  if (itemId == 0) {
    let item = await apiPostItemTitle(titleForm);
    itemIdRef.value = item.id;
    itemId = item.id;
    console.log(
      apiPostItemDetail.name,
      "itemIdRef未立即生效",
      "itemIdRef",
      itemIdRef.value,
      "itemId",
      itemId
    );
  } else {
    await apiModifyItemTitle(itemId, titleForm);
  }
  for (let i = 0; i < imgContents.length; i++) {
    let imgContent = imgContents[i];
    await apiAddOrEditImageById(itemId, imgContent);
  }
  console.log("异步循环结束的itemIdRef", itemIdRef.value);
  return Promise.resolve(itemId);
}
