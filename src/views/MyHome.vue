<template>
  <keep-alive :include="cachedComponents">
    <component :is="currentComponent"></component>
  </keep-alive>
  <nut-tabbar
      v-model="activeTab"
      unactive-color="#505050"
      bottom
      safe-area-inset-bottom
      placeholder
  >
    <nut-tabbar-item
        v-for="item in tabList"
        :key="item.name"
        :tab-title="item.title"
        :icon="item.icon"
    ></nut-tabbar-item>
  </nut-tabbar>
</template>

<script setup lang="ts">
import {ref, shallowRef, watchEffect, onMounted, computed, h, watch} from "vue";
import {useUserStore} from "@/stores/user";
import {useRouter} from "vue-router";


import AllArticles from "./AllArticles.vue";
import MyArticles from "./MyArticles.vue";
import MyComments from "./MyComments.vue";
import MyProfile from "./MyProfile.vue";
import MyFollowers from "@/views/MyFollowers.vue";
import {Follow, Comment, Find, Home, My} from "@nutui/icons-vue";

const router = useRouter();
const userStore = useUserStore();


const activeTab = ref(0);
const components = [
  AllArticles,
  MyArticles,
  MyComments,
  MyFollowers,
  MyProfile
];
const currentComponent = shallowRef(components[activeTab.value]);


const cachedComponents = computed(() => {
  return components.map(comp => comp.name || comp.__name);
});


const tabList = computed(() => [
  {
    title: "所有文章",
    icon: h(Find),
    name: "find",
  },
  {
    title: "我的文章",
    icon: h(Home),
    name: "home",
  },
  {
    title: "我的评论",
    icon: h(Comment),
    name: "comment",
  },
  {
    title: "我的关注",
    icon: h(Follow),
    name: "follow"
  },
  {
    title: userStore.nickName || "我的",
    icon: h(My),
    name: "my",
  }
]);


watchEffect(() => {
  currentComponent.value = components[activeTab.value];
});


onMounted(() => {

  if (!userStore.isLogin) {
    router.push('/login');
    return;
  }


  const savedTab = sessionStorage.getItem('activeTab');
  if (savedTab) {
    activeTab.value = parseInt(savedTab);
  }
});


watch(activeTab, (newVal) => {
  sessionStorage.setItem('activeTab', newVal.toString());
});
</script>

<style scoped>
.keep-alive-content {
  transition: opacity 0.3s ease;
}
</style>