<template>
  <nut-navbar
    title="22211860227 涂亦强"
    left-show
    @click-back="gotoBack"
  ></nut-navbar>
  <div v-if="userStoreRef.isLogin.value">
    <nut-cell title="头像" is-link @click="changeUploaderView">
      <template #desc>
        <nut-avatar size="large">
          <img :src="userDetail.avatar" />
        </nut-avatar>
      </template>
    </nut-cell>
    <ImageUploader
      v-if="uploaderView"
      v-model:img-src="renameData.avatar"
      need-compression
      @on-delete="modifyProfile"
      @on-success="modifyProfile"
    ></ImageUploader>
    <nut-cell :title="'UUID ' + userDetail.uuid"></nut-cell>
    <nut-cell title="姓名" is-link @click="changeNameView">
      <template #desc>
        <span>{{ userDetail.name }}</span>
      </template>
    </nut-cell>
    <nut-input
      v-model="renameData.name"
      placeholder="请输入姓名"
      clearable
      v-if="nameView"
    >
      <template #right>
        <nut-button type="info" size="small" @click="modifyProfile"
          >确定</nut-button
        >
      </template>
    </nut-input>
    <nut-cell title="Email">
      <template #desc>
        <span>{{ userDetail.email }}</span>
      </template>
    </nut-cell>
    <nut-cell title="修改密码" is-link @click="changePwdView"></nut-cell>
    <nut-input
      v-model="newPwd"
      placeholder="请输入新密码"
      clearable
      v-if="pwdView"
      :type="pwdStyle"
    >
      <template #left>
        <Eye @click="changePwdStyle"></Eye>
      </template>
      <template #right>
        <nut-button type="info" size="small" @click="changePassWord"
          >确定</nut-button
        >
      </template>
    </nut-input>
    <nut-cell title="发表文章数" is-link @click="gotoMyArticles">
      <template #desc>
        <span>{{ userDetail.items.length }}</span>
      </template>
    </nut-cell>
    <nut-cell title="发表评论数" is-link @click="gotoMycomments">
      <template #desc>
        <span>{{ userDetail.comments.length }}</span>
      </template>
    </nut-cell>
    <nut-cell title="参数设置" is-link @click="gotoSettings"></nut-cell>
    <div class="center">
      <nut-button type="primary" @click="logout">登出</nut-button>
    </div>
  </div>
  <div v-else class="center">
    <nut-button type="info" @click="gotoLogin">去登录界面</nut-button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { Eye } from "@nutui/icons-vue";
import {
  apiGetDetailProfile,
  apiLogout,
  apiModifyPassword,
  apiRenameMe,
} from "@/utils/apiUtils";
import { storeToRefs } from "pinia";
import { gotoBack, gotoSettings, gotoLogin as login } from "@/router";
import { onActivated, onMounted, reactive, ref } from "vue";
import { imageBaseUrl } from "@/stores/basic-data";
import ImageUploader from "./ImageUploader.vue";
const userStore = useUserStore();
const userStoreRef = storeToRefs(userStore);
const userDetail = reactive({
  name: "",
  avatar: "",
  id: 0,
  uuid: "",
  items: [],
  comments: [],
  email: "",
});

const renameData = reactive({
  name: "",
  avatar: "",
});
const nameView = ref(false);
const uploaderView = ref(false);
const pwdView = ref(false);
const newPwd = ref(userStore.getDecodedPwd);
const inputTypes = ["password", "text"];
const pwdStyle: any = ref(inputTypes[0]);
async function modifyProfile() {
  console.log(renameData);

  await apiRenameMe(renameData);

  await getProfileDetail();
}
async function changePassWord() {
  let data = await apiModifyPassword(newPwd.value);
  if (data) {
    userStore.setPassword(newPwd.value);
  }
}
function changePwdStyle() {
  if (pwdStyle.value == inputTypes[0]) {
    pwdStyle.value = inputTypes[1];
  } else {
    pwdStyle.value = inputTypes[0];
  }
}
function changeNameView() {
  nameView.value = !nameView.value;
}
function changePwdView() {
  pwdView.value = !pwdView.value;
  if (pwdView.value) {
    newPwd.value = userStore.getDecodedPwd;
  }
}
function changeUploaderView() {
  uploaderView.value = !uploaderView.value;
}
async function logout() {
  await apiLogout();
}
function gotoLogin() {
  login();
}
async function getProfileDetail() {
  let data = await apiGetDetailProfile();
  if (data) {
    Object.assign(userDetail, data);
    userDetail.avatar = imageBaseUrl + data.avatar;
    renameData.name = userDetail.name;
    renameData.avatar = data.avatar;
    console.log(renameData);
  }
}

function gotoMyArticles() {}
function gotoMycomments() {}
onMounted(() => {
  if (userStore.isLogin) {
    getProfileDetail();
  }
});
onActivated(() => {
  getProfileDetail();
});
</script>

<style scoped>
.center {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
span {
  color: black;
  margin-right: 15px;
}
</style>
