<template>
  <nut-navbar title="参数设置" left-show @click-back="gotoBack"></nut-navbar>
  <nut-cell title="开启评论自动刷新">
    <template #desc>
      <nut-switch
        v-model="commentCounterStatus"
        active-color="deepskyblue"
        @change="statusChange"
      ></nut-switch>
    </template>
  </nut-cell>
  <nut-cell
    :title="counterRef.commentCounter"
    desc="当前评论计数器值"
  ></nut-cell>
  <nut-cell title="开启文章自动刷新">
    <template #desc>
      <nut-switch
        v-model="articleCounterStatus"
        active-color="deepskyblue"
        @change="statusChange"
      ></nut-switch>
    </template>
  </nut-cell>
  <nut-cell
    :title="counterRef.articleCounter"
    desc="当前文章计数器值"
  ></nut-cell>
  <nut-cell title="设置刷新间隔(ms)">
    <template #desc>
      <nut-input-number
        v-model="rangeVal"
        :max="20000"
        :min="100"
        :step="100"
        @change="intervalChange"
      ></nut-input-number>
    </template>
  </nut-cell>
</template>

<script setup lang="ts">
import { gotoBack } from "@/router";
import { useCounterStore } from "@/stores/counter-store";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const counterStore = useCounterStore();
const counterRef = storeToRefs(counterStore);
const rangeVal = ref(counterStore.interval);
const articleCounterStatus = ref(counterStore.articleCounterEnabled);
const commentCounterStatus = ref(counterStore.commentCounterEnabled);
function statusChange() {
  counterStore.setCommentCounterEnabled(commentCounterStatus.value);
  counterStore.setArticleCounterEnabled(articleCounterStatus.value);
}
function intervalChange() {
  counterStore.setInterval(rangeVal.value);
}
</script>

<style scoped></style>
