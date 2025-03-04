<template>
  <nut-navbar :title="props.title" left-show @click-back="gotoBack">
    <template #right>
      <slot name="right"></slot>
    </template>
    <template #title-icon>
      <slot name="title-icon"></slot>
    </template>
    <template #content>
      <slot name="content"></slot>
    </template>
  </nut-navbar>
</template>

<script setup lang="ts">
import { gotoBack } from "@/router";

const props = defineProps({
  title: String,
});
</script>

<style scoped></style>
