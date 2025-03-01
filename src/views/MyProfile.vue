<template>
  <nut-navbar
    title="22211860227 涂亦强"
    left-show
    @click-back="gotoBack"
  ></nut-navbar>
  <div v-if="userStoreRef.isLogin.value">
    <div>
      <p>
        {{ userStoreRef.user }}
      </p>
    </div>
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
import { apiGetProfile, apiLogin, apiLogout } from "@/utils/apiUtils";
import { storeToRefs } from "pinia";
import { gotoBack, gotoLogin as login } from "@/router";
import { onMounted } from "vue";
const userStore = useUserStore();
const userStoreRef = storeToRefs(userStore);
async function logout() {
  await apiLogout();
}
function gotoLogin() {
  login();
}
onMounted(async () => {
  await apiGetProfile();
});
</script>

<style scoped>
.center {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>
