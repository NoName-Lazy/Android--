import { createRouter, createWebHistory } from "vue-router";
import MyLogin from "@/views/MyLogin.vue";
import MyProfile from "@/views/MyProfile.vue";
import path from "path";
import MyRegister from "@/views/MyRegister.vue";
import MyHome from "@/views/MyHome.vue";
import MySettings from "@/views/MySettings.vue";
// import MyProfile from "@/views/TestImageuploader.vue";

const routes = [
  { path: "/", name: "home", component: MyHome },
  { path: "/login", name: "login", component: MyLogin },
  { path: "/register", name: "register", component: MyRegister },
  { path: "/settings", name: "settings", component: MySettings },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
export function gotoLogin() {
  router.push({ name: "login" });
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
