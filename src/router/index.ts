import { createRouter, createWebHistory } from "vue-router";
import MyLogin from "@/views/MyLogin.vue";
import MyProfile from "@/views/MyProfile.vue";
import path from "path";
import MyRegister from "@/views/MyRegister.vue";
import MyHome from "@/views/MyHome.vue";
import MySettings from "@/views/MySettings.vue";
import ShowComment from "@/views/ShowComment.vue";
// import MyProfile from "@/views/TestImageuploader.vue";

const routes = [
  { path: "/", name: "home", component: MyHome },
  { path: "/login/:back?", name: "login", component: MyLogin },
  { path: "/register", name: "register", component: MyRegister },
  { path: "/settings", name: "settings", component: MySettings },
  {
    path: "/show-comment/:id",
    name: "showComment",
    component: ShowComment,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
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
export function gotoShowComment(itemId: any) {
  router.push({ name: "showComment", params: { id: itemId } });
}
