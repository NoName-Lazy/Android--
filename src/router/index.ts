import { createRouter, createWebHistory } from "vue-router";
import MyLogin from "@/views/MyLogin.vue";
import MyRegister from "@/views/MyRegister.vue";
import MyHome from "@/views/MyHome.vue";
import MySettings from "@/views/MySettings.vue";
import ShowComment from "@/views/ShowComment.vue";
import ShowArticle from "@/views/ShowArticle.vue";
import PostArticle from "@/views/PostArticle.vue";
import OtherArticles from "@/views/OtherArticles.vue";
import AllArticles from "@/views/AllArticles.vue";
import path from "path";
import MyComments from "@/views/MyComments.vue";
import MyArticles from "@/views/MyArticles.vue";
import MyFollowers from "@/views/MyFollowers.vue";

// import MyProfile from "@/views/TestImageuploader.vue";

const routes = [
  { path: "/", name: "home", component: MyHome },
  { path: "/login/:back?", name: "login", component: MyLogin },
  { path: "/register", name: "register", component: MyRegister },
  { path: "/settings", name: "settings", component: MySettings },
  { path: "/post-article", name: "postArticle", component: PostArticle },
  { path: "/mycomment", name: "myComment", component: MyComments },
  { path: "/myarticle", name: "myArticle", component: MyArticles },
  { path: "/myfollower", name: "myFollower", component: MyFollowers},
  {
    path: "/show-comment/:id",
    name: "showComment",
    component: ShowComment,
    props: true,
  },
  {
    path: "/show-article/:id",
    name: "showArticle",
    component: ShowArticle,
  },
  {
    path: "/otherarticle/:id",
    name: "otherArticle",
    component: OtherArticles,
  },
  {
    path: "/allarticle",
    name: "allArticle",
    component: AllArticles,
  },
];

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    console.log("router", "savedPosition", savedPosition);
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  routes: routes,
});

export default router;
export function gotoLogin(gowhere = 0) {
  router.push({ name: "login", params: { back: gowhere } });
}
export function gotoHome() {
  router.push({ name: "home" });
}
export function gotoBack() {
  router.back();

}
export function gotoRegister() {
  router.push({ name: "register" });
}
export function gotoSettings() {
  router.push({ name: "settings" });
}
export function gotoPostArticle() {
  router.push({ name: "postArticle" });
}
export function gotoAllArticle() {
  router.push({ name: "allArticle" });
}
export function gotoShowComment(itemId: any) {
  router.push({ name: "showComment", params: { id: itemId } });
}
export function gotoShowArticle(itemId: any) {
  router.push({ name: "showArticle", params: { id: itemId } });
}
export function gotoOtherArticle(itemId: any) {
  router.push({ name: "otherArticle", params: { id: itemId } });
}
export function gotoMyComments() {
  router.push({ name: "myComment" });
}
export function gotoMyArticles() {
  router.push({ name: "myArticle" });
}
export function gotoMyFollowers() {
  router.push({name: "myFollower"})
}
export function replaceToShowArticle(itemId: any) {
  router.replace({ name: "showArticle", params: { id: itemId } });
}
