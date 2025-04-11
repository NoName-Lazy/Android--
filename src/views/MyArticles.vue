<template>
  <nut-searchbar
      v-model="searchVal"
      @clear="clearFun"
      @search="searchFun"
      placeholder="搜索"
  >
    <template #rightin>
      <Search2 @click="searchFun"/>
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
  <div>
    <nut-swiper
        v-if="showSwiper"
        :init-page="0"
        :auto-play="3000"
        pagination-visible
        pagination-color="#426543"
        pagination-unselected-color="#808080"
    >
      <nut-swiper-item v-for="(item, index) in toplist" :key="index" style="height: 300px">
        <img :src="imageBaseUrl + item.src" alt="" style="height: 100%; width: 100%" draggable="false"
             @click="gotoShowArticle(item.id)"/>
      </nut-swiper-item>
    </nut-swiper>
  </div>
  <ArticleList :items="list" @onRefresh="refresh"></ArticleList>
  <div v-if="!isLogin" class="center">
    <nut-button type="info" @click="gotoLogin">去登录界面</nut-button>
  </div>
</template>

<script setup lang="ts">
import {useUserStore} from "@/stores/user";
import {apiGetAllItemsByUserId, apiStarTop5} from "@/utils/apiUtils";
import {useScrollPos} from "@/utils/scrollUtils";
import {storeToRefs} from "pinia";
import {nextTick, onActivated, onMounted, reactive, ref} from "vue";
import ErrorState from "./ErrorState.vue";
import ArticleList from "@/components/ArticleList.vue";
import {gotoLogin, gotoPostArticle, gotoShowArticle} from "@/router";
import {Search2} from "@nutui/icons-vue";
import {imageBaseUrl} from "@/stores/basic-data.ts";

const searchVal = ref("");
const searchValCommit = ref("");
const counter = ref(0);
const useUser = useUserStore();
const userRef = storeToRefs(useUser);
const isLogin = ref(userRef.isLogin);
const uuid = ref(userRef.uuid);
const {list, error, isLoading}: any = apiGetAllItemsByUserId(
    counter,
    uuid,
    searchVal
);

const toplist = ref<any>([])
useScrollPos();

const showSwiper = ref(true);

onActivated(async () => {
  try {
    const res = await apiStarTop5();  // 确保apiStarTop5返回Promise
    toplist.value = res?.data || [];
    console.log('轮播图数据:', toplist.value);
  } catch (e) {
    console.error('获取轮播数据失败:', e);
  }

  refresh();
  // 强制重新渲染轮播图
  showSwiper.value = false;
  nextTick(() => {
    showSwiper.value = true;
  });
});

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


onMounted(async () => {
  try {
    const res = await apiStarTop5();  // 确保apiStarTop5返回Promise
    toplist.value = res?.data || [];
    console.log('轮播图数据:', toplist.value);
  } catch (e) {
    console.error('获取轮播数据失败:', e);
  }
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
