<template>
  <MyHead :title="computedTitle" @click="changePopStatus"></MyHead>
  <nut-space v-if="showPop" direction="vertical" align="center" fill>
    <MyCard v-bind="itemData"></MyCard>
  </nut-space>
  <div v-if="error">
    <ErrorState
      :error="error"
      :isLoading="isLoading"
      @refreshFun="refreshFun"
    ></ErrorState>
  </div>
  <nut-empty
    image="empty"
    v-if="isNoComment"
    description="无评论信息"
  ></nut-empty>
  <div class="main-body">
    <a-comment
      align="right"
      v-for="item in comments"
      :author="item.owner.name"
      :avatar="imageBaseUrl + item.owner.avatar"
      :datetime="formatDateTime(item.create_time)"
      :key="item.id"
    >
      <template #actions>
        <span @click="setReplyHint(item)">
          <IconMessage></IconMessage>引用
        </span>
        <span v-if="item.owner_id == uuid" @click="commitDeleteComment(item)">
          <IconDelete></IconDelete>删除
        </span>
      </template>
      <template #content>
        <div v-if="item.hint" style="color: grey">
          {{ item.hint }}
        </div>
        <div>
          {{ item.content }}
        </div>
      </template>
    </a-comment>
    <a-comment align="right" v-if="isLogin" :avatar="userAvatar">
      <template #actions>
        <a-button
          type="primary"
          @click="refreshFun"
          :key="0"
          v-if="!useCounter.commentCounterEnabled"
          :loading="isLoading"
          >刷新</a-button
        >
        <a-button type="primary" :key="1" @click="addReply">发送</a-button>
      </template>
      <template #content>
        <div v-if="commentData.hint" style="color: grey">
          <a-input v-model="commentData.hint" readonly>
            <template #append>
              <span @click="() => (commentData.hint = '')">取消引用</span>
            </template>
          </a-input>
        </div>
        <a-input
          v-model="commentData.content"
          placeholder="Here is you reply"
        />
      </template>
    </a-comment>
    <nut-cell
      title="未登录，不能评论"
      v-else
      is-link
      @click="gotoLogin(1)"
    ></nut-cell>
  </div>
</template>

<script setup lang="ts">
import ErrorState from "./ErrorState.vue";
import { imageBaseUrl } from "@/stores/basic-data";
import { useCounterStore } from "@/stores/counter-store";
import { useUserStore } from "@/stores/user";
import {
  apiDeleteCommentById,
  apiGetCommentsByItemId,
  apiGetItemById,
  apiPostComment,
} from "@/utils/apiUtils";
import { IconMessage, IconDelete } from "@arco-design/web-vue/es/icon";
import { showDialog } from "@nutui/nutui";
import { storeToRefs } from "pinia";
import { computed, onMounted, reactive, ref } from "vue";
import MyHead from "./MyHead.vue";
import MyCard from "./MyCard.vue";
import { formatDateTime } from "@/utils/formatUrils";
import { gotoLogin } from "@/router";

const showPop = ref(false);
const useCounter = useCounterStore();
const userState = useUserStore();
const counterRef = storeToRefs(useCounter);
const userRef = storeToRefs(userState);
const isLogin = ref(userRef.isLogin);
const uuid = userState.uuid;
const props = defineProps({
  id: String,
});
const commentData = reactive({
  content: "",
  hint: "",
  order: 0,
});
const userAvatar = imageBaseUrl + userState.avatar;
const commentCount = ref(counterRef.commentCounter);
const { comments, error, isLoading } = apiGetCommentsByItemId(
  commentCount,
  props.id
);
const itemRefreshCount = ref(0);
const isNoComment = computed(() => {
  return comments == null || (comments.value?.length ?? 0) === 0;
});
const { itemData }: any = apiGetItemById(props.id, itemRefreshCount);
const computedTitle = computed(() => {
  return itemData.value?.title ?? "";
});
function changePopStatus() {
  showPop.value = !showPop.value;
  if (showPop.value) {
    itemRefreshCount.value++;
  }
}
function refreshFun() {
  useCounter.incrementCommentCounter();
}
function setReplyHint(item: any) {
  commentData.hint = "引用:" + item.content + "@" + item.owner.name;
}
async function addReply() {
  await apiPostComment(props.id, commentData);
  refreshFun();
  commentData.hint = "";
  commentData.content = "";
}
async function deleteComment(item: any) {
  await apiDeleteCommentById(item.id);
}
async function commitDeleteComment(item: any) {
  let title = "确定删除" + item.owner.name + "的回复?";
  let content = item.content;
  let onCancel = () => {};
  let onOk = () => {
    deleteComment(item);
  };
  showDialog({ title, content, onCancel, onOk });
}
onMounted(async () => {
  refreshFun();
  itemRefreshCount.value++;
});
</script>

<style scoped>
.action {
  display: inline-block;
  padding: 0 4px;
  color: var(--color-text-1);
  line-height: 24px;
  background: transparent;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.1s ease;
}
.action:hover {
  background: var(--color-fill-3);
}
.main-body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  justify-items: center;
  width: 90%;
  margin: auto;
  margin-top: 5%;
}
</style>
