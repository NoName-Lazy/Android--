<template>
  <div>
    <RouterView v-slot="{ Component }">
      <KeepAlive include="MyHome">
        <component :is="Component" :key="$route.path"></component>
      </KeepAlive>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import { useCounterStore } from "./stores/counter-store";
import { onMounted, onUnmounted } from "vue";
const counterStore = useCounterStore();
onMounted(() => {
  counterStore.startTimer();
});
onUnmounted(() => {
  counterStore.stopTimer();
});
</script>

<style scoped></style>
