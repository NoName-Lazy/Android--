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
function decryptObject(encoded_object: object) {
  let bytes = CryptoJS.AES.decrypt(JSON.stringify(encoded_object), KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
export const useUserStore = defineStore("userState", {
  state: () => {
    return {
      user: {},
      token: "",
      isLogin: false,
      userName: "aa@wzu.edu.cn",
      passWord: "123456",
    };
  },
  getters: {
    getDecodedPwd(): string {
      return decryptText(this.passWord);
    },
  },
  actions: {
    setUser(userData: any) {
      this.user = userData;
    },
    setToken(token: string) {
      this.token = token;
    },
    setLoginState(isLogin: boolean) {
      this.isLogin = isLogin;
    },
    setUserName(name: string) {
      this.userName = name;
    },
    setPassword(pwd: string) {
      this.passWord = pwd;
    },
  },
  persist: {
    serializer: {
      serialize: (state) => encryptObject(state),
      deserialize: (data: Object) => decryptObject(data),
    },
  },
});
