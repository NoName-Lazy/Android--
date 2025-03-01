import { createRouter, createWebHistory } from "vue-router";
import MyLogin from "@/views/MyLogin.vue";
import MyProfile from "@/views/MyProfile.vue";
// import MyProfile from "@/views/TestImageuploader.vue";

const routes = [
  { path: "/", name: "home", component: MyProfile },
  { path: "/login", name: "login", component: MyLogin },
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
