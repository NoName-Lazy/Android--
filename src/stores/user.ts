import { defineStore } from "pinia";
import CryptoJS from "crypto-js";

const KEY = "dsf234dsj342";

function encryptText(text: string) {
  return CryptoJS.AES.encrypt(text, KEY).toString();
}
function decryptText(encoded_text: string) {
  let bytes = CryptoJS.AES.decrypt(encoded_text, KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
function encryptObject(object: object) {
  return CryptoJS.AES.encrypt(JSON.stringify(object), KEY).toString();
}
function decryptObject(encoded_string: string) {
  let bytes = CryptoJS.AES.decrypt(encoded_string, KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
export const useUserStore = defineStore("userState", {
  state: () => {
    return {
      user: {},
      avatar: "",
      nickName: "",
      token: "",
      uuid: "",
      isLogin: false,
      userName: "aa@wzu.edu.cn",
      passWord: "",
    };
  },
  getters: {
    getDecodedPwd(): any {
      return decryptText(this.passWord);
    },
  },
  actions: {
    setUser(userData: any) {
      this.user = userData;
    },
    setToken(token: any) {
      this.token = token;
    },
    setLoginState(isLogin: any) {
      this.isLogin = isLogin;
    },
    setUserName(name: any) {
      this.userName = name;
    },
    setPassword(pwd: any) {
      this.passWord = pwd;
    },
    setUserDetail(userDetail: any) {
      this.avatar = userDetail?.avatar ?? "";
      this.nickName = userDetail?.name ?? "";
      this.uuid = userDetail?.uuid ?? "";
    },
  },
  persist: {
    serializer: {
      serialize: (state) => encryptObject(state),
      deserialize: (data: any) => decryptObject(data),
    },
  },
});
