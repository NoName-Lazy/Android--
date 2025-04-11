<script setup lang="ts">
import {ref, onMounted, onActivated} from 'vue';
import {
  apiFindAlreadyReadItems,
  apiFindFollowerByUUid,
  apiGetAllItemDataByUUID,
} from "@/utils/apiUtils.ts";
import {gotoLogin, gotoPostArticle} from "@/router";
import ArticleList from "@/components/ArticleList.vue";
import { Search2 } from "@nutui/icons-vue";
import {useUserStore} from "@/stores/user.ts";
import {storeToRefs} from "pinia";
import {useScrollPos} from "@/utils/scrollUtils.ts";
const FollowerList = ref<string[]>([]);
const FollowerItemList = ref<any[]>([]);
const OwnerItemList = ref<any>(null);
const finalResult = ref<any[]>([]);
const mergedData = ref<any[]>([]);

async function FindFollower() {
  try {

    const res = await apiFindFollowerByUUid();
    FollowerList.value = res?.data?.map((item: any) => item.followed_uuid) || [];


    FollowerItemList.value = await Promise.all(
        FollowerList.value.map(uuid => apiGetAllItemDataByUUID(uuid))
    );


    OwnerItemList.value = await apiFindAlreadyReadItems();


    processItems();
  } catch (error) {
    console.error('获取数据失败:', error);
  }
}

function processItems() {
  if (!OwnerItemList.value?.data || !FollowerItemList.value) return;


  const itemIds = OwnerItemList.value.data.map((item: any) => item.item_id);


  const filtered = FollowerItemList.value
      .map(group => ({
        ...group,
        data: (group.data || []).filter((item: any) => !itemIds.includes(item.id))
      }))
      .filter(group => group.data?.length > 0);

  finalResult.value = filtered;


  mergedData.value = finalResult.value.flatMap(group => group.data);
}

onActivated(()=>{
  FindFollower();
})

onMounted(() => {
  FindFollower();
  console.log(mergedData)
});

const searchVal = ref("");
const searchValCommit = ref("");
const counter = ref(0);
const useUser = useUserStore();
const userRef = storeToRefs(useUser);
const isLogin = ref(userRef.isLogin);
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
  </nut-searchbar>
  <ArticleList :items="mergedData" @onRefresh="refresh"></ArticleList>
  <div v-if="!isLogin" class="center">
    <nut-button type="info" @click="gotoLogin">去登录界面</nut-button>
  </div>
</template>

<style scoped>
.center {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>