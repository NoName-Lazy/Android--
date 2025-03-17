<template>
  <keep-alive>
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
      v-for="item in List"
      :key="item.name"
      :tab-title="item.title"
      :icon="item.icon"
    ></nut-tabbar-item>
  </nut-tabbar>
</template>

<script setup lang="ts">
import { h, onMounted, ref, watchEffect } from "vue";
import AllArticles from "./AllArticles.vue";
import MyArticles from "./MyArticles.vue";
import MyComments from "./MyComments.vue";
import MyProfile from "./MyProfile.vue";
import { shallowRef } from "vue";
import { Comment, Find, Home, My } from "@nutui/icons-vue";
import { loginOnLaunch } from "@/utils/apiUtils";
import { gotoLogin } from "@/router";
const components = [AllArticles, MyArticles, MyComments, MyProfile];
const activeTab = ref(1);
const currentComponent = shallowRef(components[activeTab.value]);
const List = [
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
    title: "涂亦强",
    icon: h(My),
    name: "my",
  },
];
// onMounted(() => {
//   console.log("触发");

//   loginOnLaunch().catch((e) => {
//     console.log("loginOnLaunch: ", e);
//     gotoLogin();
//   });
//   // tabSwitch(null, activeTab.value);
// });
// const tabSwitch = (_: any, index: any) => {
//   console.log(index);
//   currentComponent.value = components[index];
// };



watchEffect(() => {
  currentComponent.value = components[activeTab.value];
});
</script>

<style scoped></style>
