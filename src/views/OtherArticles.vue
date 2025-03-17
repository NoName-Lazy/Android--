<template>
  <nut-navbar
    title="用户文章列表"
    left-show
    @click-back="gotoAllArticle"
  ></nut-navbar>
  <nut-searchbar
    v-model="searchVal"
    @clear="clearFun"
    @search="searchFun"
    placeholder="搜索"
  >
    <template #rightin>
      <Search2 @click="searchFun" />
    </template>
  </nut-searchbar>
  <ArticleList :items="list" @onRefresh="refresh"></ArticleList>
  <div v-if="!isLogin" class="center">
    <nut-button type="info" @click="gotoLogin">去登录界面</nut-button>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { apiGetAllItemDataByUUID, apiGetItemDataById } from "@/utils/apiUtils";
import { useScrollPos } from "@/utils/scrollUtils";
import { storeToRefs } from "pinia";
import { onActivated, onMounted, ref } from "vue";
import ArticleList from "@/components/ArticleList.vue";
import { gotoAllArticle, gotoLogin } from "@/router";
import { Search2 } from "@nutui/icons-vue";
import { useRoute } from "vue-router";

const route = useRoute();
const routeId = Number(route.params.id);

const searchVal = ref("");
const searchValCommit = ref("");
const counter = ref(0);
const useUser = useUserStore();
const userRef = storeToRefs(useUser);
const isLogin = ref(userRef.isLogin);
const uuid = ref(userRef.uuid);
const list = ref([]); // 使用 ref 包装
useScrollPos();

onMounted(async () => {
  try {
    const itemData = await apiGetItemDataById(routeId);
    uuid.value = itemData?.data?.owner_id;
    const response = await apiGetAllItemDataByUUID(uuid.value);
    console.log("API 返回的数据:", response);

    // 确保数据结构正确
    if (response?.data) {
      list.value = response.data;
      console.log(list.value);
    } else {
      console.error("API 返回的数据格式不正确:", response);
    }
  } catch (err) {
    console.error("加载失败:", err);
  }
});

function refresh() {
  counter.value++;
}
function clearFun() {
  console.log("clearFun");
  searchValCommit.value = searchVal.value;
}

function searchFun() {
  searchValCommit.value = searchVal.value;
  console.log("search", searchValCommit.value);
}
onActivated(() => {
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
