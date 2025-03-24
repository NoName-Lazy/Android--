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

  <nut-empty v-if="error" image="error" description="Error">
    <nut-cell>
      <nut-ellipsis
          :content="error"
          direction="end"
          expand-text="展开"
          rows="3"
          class="my-ellipsis"
          collapse-text="收起"
      ></nut-ellipsis>
    </nut-cell>
    <nut-button
        type="primary"
        style="margin-top: 5px"
        :loading="isLoading"
        @click="refreshFun"
    >Refresh
    </nut-button
    >
  </nut-empty>

  <div v-if="allList" class="center">
    <nut-infinite-loading
        v-model="isLoading"
        :has-more="hasMore"
        @scroll-change="scrollChange"
        @load-more="loadMore"
    >
      <nut-space
          v-if="!counterEnableRef"
          direction="vertical"
          align="center"
          fill
      >
        <nut-pull-refresh v-model="isLoading" @refresh="refreshFun">
          <MyCard
              :starlist=starlist
              v-for="[k, item] in filteredList"
              :key="item.id + '-' + item.star"
              v-bind="item"
              @onClickStar="(id) => clickStar(id, item.title,item.star)"
              @onClickComment="gotoShowComment(item.id)"
              @onClickShowArticles="gotoShowArticle(item.id)"
          ></MyCard>
        </nut-pull-refresh>
      </nut-space>
      <nut-space v-else direction="vertical" align="center" fill>
        <MyCard
            :starlist=starlist
            v-for="[k, item] in filteredList"
            :key="item.id + '-' + item.star"
            v-bind="item"
            @onClickStar="(id) => clickStar(id, item.title,item.star)"
            @onClickComment="gotoShowComment(item.id)"
            @onClickShowArticles="gotoShowArticle(item.id)"
        ></MyCard>
      </nut-space>
    </nut-infinite-loading>
  </div>
</template>

<script setup lang="ts">
import {
  apiItemStar,
  apiGetAllItemsByUserId,
  apiGetAllItemsRefresh,
  apiGetCommentsByItemId,
  apiGetMyComments, apiFindStarByUUID,
} from "@/utils/apiUtils";
import {computed, onActivated, onMounted, ref, watch} from "vue";
import MyCard from "./MyCard.vue";
import {useCounterStore} from "@/stores/counter-store";
import {storeToRefs} from "pinia";
import {useScrollPos} from "@/utils/scrollUtils";
import {gotoShowArticle, gotoShowComment} from "@/router";
import {Search2} from "@nutui/icons-vue";
import {useUserStore} from "@/stores/user";

const searchVal = ref("");
const userStore = useUserStore();
const counterStore = useCounterStore();
const counterRefObj = storeToRefs(counterStore);
const counterRef: any = ref(counterRefObj.articleCounter);
const counterEnableRef = ref(counterRefObj.articleCounterEnabled.value);
const counter = ref(1);
const hasMore = ref(true);
const currentPage = ref(0);
var pageSize = 5;
const DEFAULT_PAGE_SIZE = 5;
const q = computed(() => {
  let offset = pageSize * currentPage.value;
  return `skip=${offset}&limit=${pageSize}`;
});

const allList = ref(new Map());
const {list, error, isLoading} = apiGetAllItemsRefresh(counterRef, q);
const starlist = ref<any[]>([]);
const filteredList = computed(() => {
  // console.log(allList);

  if (!searchVal.value) return allList.value;
  const searchLower = searchVal.value.toLowerCase();
  return new Map(
      [...allList.value].filter(([k, item]) => {
        // console.log(item);
        const id = item.id;
        const commentCount = counterRefObj.commentCounter;
        const {comments, error, isLoading} = apiGetCommentsByItemId(
            commentCount,
            id
        );
        // console.log(id, commentCount, comments);

        const titleMatch = item.title.toLowerCase().includes(searchLower);
        const contentMatch = item.content.toLowerCase().includes(searchLower);
        const commentMatch = comments?.some((comment: any) =>
            comment.text.toLowerCase().includes(searchLower)
        );

        return titleMatch || contentMatch || commentMatch;
      })
  );
});

function loadMore() {
  pageSize = DEFAULT_PAGE_SIZE;
  currentPage.value++;
}

function scrollChange(v: any) {
  console.log(`v=${v},currentPage=${currentPage.value}`);
}

watch(list, () => {
  if (list.value && list.value.length > 0) {
    list.value.forEach((item: any) => {
      if (allList.value.has(item.id)) {
        Object.assign(allList.value.get(item.id), item);
      } else {
        allList.value.set(item.id, item);
      }
    });
    hasMore.value = true;
  } else {
    hasMore.value = false;
  }
});

watch(counterRef, () => {
  pageSize = (currentPage.value + 1) * DEFAULT_PAGE_SIZE;
  currentPage.value = 0;
});

watch(starlist, (newVal) => {
  console.log('starlist updated:', newVal)
}, {deep: true});

onActivated(() => {
  refreshFun();
});

useScrollPos();

function refreshFun() {
  counterStore.incrementArticleCounter();
}

function clearFun() {
  searchVal.value = "";
}

function searchFun() {
}

async function clickStar(id: any, itemtitle: any, itemstar: any) {
  console.log(id, itemtitle);
  let data = await apiItemStar(id, userStore.uuid, itemtitle);
  // console.log(data)
  if (data != null) {

    const updatedItem = allList.value.get(id);
    // console.log(starlist.value.data)
    updatedItem.star = itemstar + 1;
    allList.value.set(id, updatedItem);
  } else {
    const updatedItem = allList.value.get(id);
    // console.log(starlist.value.data)
    updatedItem.star = itemstar - 1;
    allList.value.set(id, updatedItem);
  }

  const starIndex = starlist.value.data.findIndex((star: any) => star.item_id === id);

  if (starIndex !== -1) {
    // 取消点赞：从 starlist 中移除该项
    starlist.value.data.splice(starIndex, 1);
  } else {
    // 点赞：添加到 starlist
    starlist.value.data.push({ item_id: id, star: 1 }); // 确保 star 有初始值
  }
  refreshFun();
}


async function FindStar() {
  const data: any = await apiFindStarByUUID();
  starlist.value = data;
  console.log(starlist)
}

onMounted(() => {
  FindStar();
})
</script>

<style scoped>
.center {
  display: block;
  justify-content: center;
}

.my-ellipsis {
  overflow-wrap: break-word;
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
