<template>
  <a-card :style="{ width: '96vw' }">
    <template #actions v-if="props.showMessage">
      <span class="icon-hover" @click="onClickStar">
        <IconThumbUp />{{ props.star }}
      </span>
      <span class="icon-hover" @click="onClickMessage">
        <IconMessage />{{ props.comment_count }}
      </span>
      <span class="icon-hover" @click="onClickMore">
        <IconMore />
      </span>
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
          <a-avatar :size="24" :style="{ marginRight: '8px' }">
            <img :src="avatarSrc" :alt="avatarAlter" />
          </a-avatar>
          <a-typography-text>{{ modify_time }}</a-typography-text>
        </div>
      </template>
    </a-card-meta>
  </a-card>
</template>

<script setup lang="ts">
import { imageBaseUrl } from "@/stores/basic-data";
import { computed, onMounted } from "vue";
import { formatDateTime } from "@/utils/formatUrils";
import {
  IconThumbUp,
  IconMessage,
  IconMore,
} from "@arco-design/web-vue/es/icon";
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
});

const modify_time = computed(() => {
  return formatDateTime(props.modify_time, true);
});
const emit = defineEmits([
  "onClickStar",
  "onClickMoreActions",
  "onClickItem",
  "onClickComment",
]);
const onClickStar = () => {
  emit("onClickStar", props.id);
};
const onClickMore = () => {
  emit("onClickMoreActions", props.id);
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
