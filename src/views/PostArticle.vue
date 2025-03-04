<template>
  <MyHead title="发布文章"></MyHead>
  <nut-cell
    title="请先登录"
    desc="未登录不能发布文章"
    v-if="!isLogin"
    @click="gotoLogin(1)"
  ></nut-cell>
  <div v-else>
    <PostComponent
      v-model:item-id="itemId"
      v-model:form-data="formData"
      v-model:img-contents="imgContents"
      @onSubmit="(id) => replaceView(id)"
    ></PostComponent>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { url } from "inspector";
import { storeToRefs } from "pinia";
import { title } from "process";
import { reactive, ref } from "vue";
import MyHead from "./MyHead.vue";
import { gotoLogin, replaceToShowArticle } from "@/router";
import PostComponent from "@/components/PostComponent.vue";

const userStore = useUserStore();
const userRef = storeToRefs(userStore);
const isLogin = ref(userRef.isLogin.value);
const itemId = ref(0);
const formData = ref({
  title: "",
  description: "",
  price: 0,
  vipPrice: 0,
  content: "",
  src: "",
  id: 0,
});
const imgContents = ref([
  reactive({
    name: "",
    url: "",
    img_content: "",
    order: 0,
    id: 0,
  }),
]);
function replaceView(id: any) {
  console.log(replaceView.name, "id", id);
  replaceToShowArticle(id);
}
</script>

<style scoped></style>
