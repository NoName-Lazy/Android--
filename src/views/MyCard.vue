<template>
  <nut-badge value="NEW" color="purple" right="13" top="5" :hidden="isAlreadyRead || !props.src">
    <a-card :style="{ width: '96vw' }">
      <template #actions v-if="props.showMessage">
      <span class="icon-hover" @click="onClickShowArticles">
        <icon-redo/>详情
      </span>
        <span v-if="isStarred" class="icon-hover" @click="onClickStar">
        <HeartFill/>{{ props.star }}
      </span>
        <span v-else class="icon-hover" @click="onClickStar">
        <IconThumbUp/>{{ props.star }}
      </span>
        <span class="icon-hover" @click="onClickMessage">
        <IconMessage/>{{ props.comment_count }}
      </span>
        <a-trigger position="top" auto-fit-position :unmount-on-close="false">
          <span class="icon-hover">
            <IconMore/>
          </span>
          <template #content>
            <div @click="onClickFollower">
              <IconUserAdd size="32" />
            </div>
          </template>
        </a-trigger>
      </template>
      <template #cover>
        <div class="cover">
          <img
              :src="imageSrc"
              alt="cover"
              class="cover-img"
              @click="onClickItem"
          />
        </div>
      </template>
      <a-card-meta :title="props.title" :description="props.owner.name">
        <template #avatar>
          <div class="avatar">
            <a-avatar
                :size="24"
                :style="{ marginRight: '8px' }"
                @click="gotoOtherArticle(props.id)"
            >
              <img :src="avatarSrc" :alt="avatarAlter"/>
            </a-avatar>
            <a-typography-text>{{ modify_time }}</a-typography-text>
          </div>
        </template>
      </a-card-meta>
    </a-card>
  </nut-badge>
</template>

<script setup lang="ts">
import {imageBaseUrl} from "@/stores/basic-data";
import {computed, onActivated, onMounted, reactive, ref} from "vue";
import {formatDateTime} from "@/utils/formatUtils";
import {
  IconThumbUp,
  IconMessage,
  IconMore,
  IconRedo,
  IconUserAdd,
} from "@arco-design/web-vue/es/icon";
import {HeartFill} from "@nutui/icons-vue"
import {gotoOtherArticle} from "@/router";
import {useUserStore} from "@/stores/user.ts";
import {
  apiAddFollower,
  apiAlreadyReadItems,
  apiFindStar,
  apiFindStarByUUID,
  apiGetItemDataById
} from "@/utils/apiUtils.ts";

const userStore = useUserStore();

const props = defineProps({
  src: String,
  title: String,
  description: String,
  star: Number,
  id: Number,
  modify_time: String,
  comment_count: Number,
  showMessage: {
    type: Boolean,
    default() {
      return true;
    },
  },
  owner: {
    type: Object,
    default() {
      return {
        name: "",
        avatar: "",
      };
    },
  },
  starlist: {
    type: Array,
    default: () => [],
  },
  alreadyreaditemlist: {
    type: Array,
    default: () => [],
  },
})

const isAlreadyRead = computed(() => {
  // 确保 alreadyreaditemlist.data 存在且是数组
  if (!props.alreadyreaditemlist?.data || !Array.isArray(props.alreadyreaditemlist.data)) {
    console.error('alreadyreaditemlist.data 不是一个数组:', props.alreadyreaditemlist);
    return false;
  }
  // 检查当前文章ID是否在已读列表中
  return props.alreadyreaditemlist.data.some(
      (item: any) => item.item_id === props.id
  );
});

const isStarred = computed(() => {
  if (!Array.isArray(props.starlist?.data)) {
    console.error('starlist 不是一个数组:', props.starlist);
    return false;
  }
  return props.starlist?.data.some((star: any) => star.item_id === props.id);
});

const modify_time = computed(() => {
  return formatDateTime(props.modify_time, true);
});

const emit = defineEmits([
  "onClickShowArticles",
  "onClickStar",
  "onClickFollower",
  "onClickItem",
  "onClickComment",
]);

async function onClickShowArticles() {
  emit("onClickShowArticles", props.id, props.title);
  let res = await apiAlreadyReadItems(props.id)
  console.log(res)

};

const onClickStar = () => {
  emit("onClickStar", props.id);
};
const onClickFollower = () => {
  emit("onClickFollower", props.id);
  FindFollowerUUid(props.id)
};
const onClickItem = () => {
  emit("onClickItem", props.id);
};
const onClickMessage = () => {
  emit("onClickComment", props.id);
};
const avatarAlter = computed(() => {
  return props.owner?.name ? props.owner.name : "";
});
const avatarSrc = computed(() => {
  return imageBaseUrl + props.owner.avatar;
});
const imageSrc = computed(() => {
  return imageBaseUrl + props.src;
});


async function FindFollowerUUid(follower_id: any) {
  let itemData = await apiGetItemDataById(follower_id)
  // console.log(itemData.data.owner_id)
  await apiAddFollower(itemData.data.owner_id)
}

onMounted(() => {
  console.log("MyCard", props);
});
</script>

<style scoped>
.icon-hover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.1s;
}

.icon-hover:hover {
  background-color: rgb(var(--gray-2));
}

.cover {
  height: 204px;
  overflow: hidden;
  justify-content: center;
  display: flex;
}

.cover-img {
  width: 92%;
  transform: translateY(10px);
  margin: auto;
}

.avatar {
  display: flex;
  align-items: center;
}
</style>
