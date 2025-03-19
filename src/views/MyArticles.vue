<template>
  <nut-searchbar
    v-model="searchVal"
    @clear="clearFun"
    @search="searchFun"
    placeholder="搜索"
  >
    <template #rightin>
      <Search2 @click="searchFun" />
    </template>
    <template #rightout>
      <nut-tag type="danger" @click="addArticle">发布文章</nut-tag>
    </template>
  </nut-searchbar>
  <ErrorState
    v-if="error"
    :error="error"
    :isLoading="isLoading"
    @refreshFun="refresh"
  ></ErrorState>
  <ArticleList :items="list" @onRefresh="refresh"></ArticleList>
  <div v-if="!isLogin" class="center">
    <nut-button type="info" @click="gotoLogin">去登录界面</nut-button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { apiGetAllItemsByUserId } from "@/utils/apiUtils";
import { useScrollPos } from "@/utils/scrollUtils";
import { storeToRefs } from "pinia";
import { onActivated, onMounted, ref } from "vue";
import ErrorState from "./ErrorState.vue";
import ArticleList from "@/components/ArticleList.vue";
import { gotoLogin, gotoPostArticle } from "@/router";
import { Search2 } from "@nutui/icons-vue";
const searchVal = ref("");
const searchValCommit = ref("");
const counter = ref(0);
const useUser = useUserStore();
const userRef = storeToRefs(useUser);
const isLogin = ref(userRef.isLogin);
const uuid = ref(userRef.uuid);
const { list, error, isLoading }: any = apiGetAllItemsByUserId(
  counter,
  uuid,
  searchVal
);
useScrollPos();
function refresh() {
  counter.value++;
}
function clearFun() {
  console.log("clearFun");
  searchValCommit.value = searchVal.value;
}
function addArticle() {
  console.log("add article");
  gotoPostArticle();
}
function searchFun() {
  searchValCommit.value = searchVal.value;
  console.log("search", searchValCommit.value);
}
onActivated(() => {
  refresh();
});

onMounted(() => {
  refresh();
});
</script>

<style scoped>
.center {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>
