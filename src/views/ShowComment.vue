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
        v-for="item in comments?.filter(item => !item.hint) "
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
      <a-comment
          align="right"
          v-for="item1 in comments?.filter(item1 => item1.hint && item1.hint.includes(item?.content))"
          :author="item1.owner.name"
          :avatar="imageBaseUrl + item1.owner.avatar"
          :datetime="formatDateTime(item1.create_time)"
          :key="item1.id"
      >
        <template #actions>
          <span @click="setReplyHint(item1)">
            <IconMessage></IconMessage>引用
          </span>
          <span v-if="item1.owner_id == uuid" @click="commitDeleteComment(item1)">
            <IconDelete></IconDelete>删除
          </span>
        </template>
        <template #content>
          <div v-if="item1.hint" style="color: grey">
            {{ item1.hint }}
          </div>
          <div>
            {{ item1.content }}
          </div>
        </template>
      </a-comment>
    </a-comment>
  </div>
  <div v-if="isLogin" class="comment-input-container">
    <a-comment align="right" :avatar="userAvatar">
      <template #actions>
        <a-button
            type="primary"
            @click="refreshFun"
            :key="0"
            v-if="!useCounter.commentCounterEnabled"
            :loading="isLoading"
        >刷新
        </a-button>
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
            placeholder="Here is your reply"
        />
      </template>
    </a-comment>
  </div>
  <nut-cell
      title="未登录，不能评论"
      v-else
      is-link
      @click="gotoLogin(1)"
  ></nut-cell>
</template>

<script setup lang="ts">
import ErrorState from "./ErrorState.vue";
import {imageBaseUrl} from "@/stores/basic-data";
import {useCounterStore} from "@/stores/counter-store";
import {useUserStore} from "@/stores/user";
import {
  apiDeleteCommentById,
  apiGetCommentsByItemId,
  apiGetItemById,
  apiPostComment,
} from "@/utils/apiUtils";
import {Image} from "@nutui/icons-vue"
import {IconMessage, IconDelete} from "@arco-design/web-vue/es/icon";
import {showDialog} from "@nutui/nutui";
import {storeToRefs} from "pinia";
import {computed, onMounted, reactive, ref, watch} from "vue";
import MyHead from "./MyHead.vue";
import MyCard from "./MyCard.vue";
import {formatDateTime} from "@/utils/formatUtils";
import {gotoLogin} from "@/router";
import ImageUploader from "@/views/ImageUploader.vue";

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

const commentsApi = apiGetCommentsByItemId(commentCount, props.id)
const comments = commentsApi.comments
const error = commentsApi.error
const isLoading = commentsApi.isLoading

const itemRefreshCount = ref(0);
const isNoComment = computed(() => {
  return comments == null || (comments.value?.length ?? 0) === 0;
});
const {itemData}: any = apiGetItemById(props.id, itemRefreshCount);
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
  // 检查内容是否为空
  if (!commentData.content.trim()) {
    showDialog({
      title: "提示",
      content: "评论内容不能为空",
      onOk: () => {
      }
    });
    return;
  }

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
  let onCancel = () => {
  };
  let onOk = () => {
    deleteComment(item);
  };
  showDialog({title, content, onCancel, onOk});
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
  padding-bottom: 100px;
}

.comment-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: white;
  padding: 10px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}
</style>