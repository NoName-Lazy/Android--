<template>
  <nut-navbar
    title="22211860227 涂亦强"
    left-show
    @click-back="gotoBack"
  ></nut-navbar>
  <nut-row type="flex" justify="center">
    <nut-col :span="18" fill>
      <nut-image
        :src="logoSrc"
        width="100%"
        height="50vh"
        fit="cover"
        radius="10px"
      ></nut-image>
    </nut-col>
  </nut-row>
  <nut-row type="flex" justify="center">
    <nut-col :span="18">
      <nut-form>
        <nut-form-item label="用户名">
          <nut-input v-model="formData.username" type="text"></nut-input>
        </nut-form-item>
        <nut-form-item label="密码">
          <nut-input v-model="formData.password" type="password"></nut-input>
        </nut-form-item>
      </nut-form>
    </nut-col>
  </nut-row>
  <div class="center">
    <nut-button type="info" @click="logIn">登录</nut-button>
  </div>
</template>

<script setup lang="ts">
import { apiLogin } from "@/utils/apiUtils";
import { reactive } from "vue";

import logoSrc from "@/assets/login_logo.jpg";
import { gotoBack } from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
const userStore = useUserStore();
const userStoreRef = storeToRefs(userStore);
const formData = reactive({
  username: userStore.userName,
  password: userStoreRef.getDecodedPwd.value,
});
async function logIn() {
  let data = await apiLogin(formData);
  if (data) {
    userStore.setUser(formData.username);
    userStore.setPassword(formData.password);
    gotoBack();
  }
}
</script>

<style scoped>
.center {
  display: flex;
  justify-content: center;
}
</style>
