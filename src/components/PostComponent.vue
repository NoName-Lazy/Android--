<template>
  <nut-form>
    <nut-form-item label="文章标题">
      <nut-textarea
        v-model="formData.title"
        :rows="1"
        autosize
        :max-length="40"
      ></nut-textarea>
    </nut-form-item>

    <nut-form-item label="简介">
      <nut-textarea
        v-model="formData.content"
        :rows="3"
        autosize
        :max-length="2000"
        limit-show
      ></nut-textarea>
    </nut-form-item>
    <nut-form-item label="封面图片">
      <ImageUploader v-model:img-src="formData.src" />
    </nut-form-item>
  </nut-form>
  <nut-swipe-group lock>
    <nut-swipe :name="item.order" v-for="item in imgContents" :key="item.order">
      <nut-textarea
        v-model="item.img_content"
        :rows="3"
        autosize
        :max-length="2000"
        limit-show
      />
      <ImageUploader
        v-model:img-src="item.url"
        @onSuccess="(res) => onImgContentSuccess(item, res)"
      ></ImageUploader>

      <template #right>
        <nut-button
          type="danger"
          shape="square"
          style="height: 100%"
          @click="() => deleteImageByItemId(item)"
          >删除</nut-button
        > </template
      ><nut-button type="primary" @click="moveUp(item)" size="small"
        >上移</nut-button
      >
      <nut-button
        type="primary"
        @click="moveDown(item)"
        size="small"
        style="margin-left: 5px"
        >下移</nut-button
      >
    </nut-swipe>
  </nut-swipe-group>
  <nut-space :gutter="20" style="margin-top: 10px">
    <nut-button type="info" size="small" @click="addImageContent"
      >添加内容</nut-button
    >
    <nut-button type="primary" size="small" @click="submitContent"
      >提交</nut-button
    >
  </nut-space>
</template>

<script setup lang="ts">
import {
  apiDeleteImageById,
  apiDeleteImageByPath,
  apiPostItemDetail,
} from "@/utils/apiUtils";
import { alertFail } from "@/utils/showMessage";
import ImageUploader from "@/views/ImageUploader.vue";

import { nextTick, onMounted, reactive, ref } from "vue";
import {gotoBack, gotoShowArticle} from "@/router";

const itemId: any = defineModel("itemId");
const formData: any = defineModel("formData");
const imgContents: any = defineModel("img-contents");
const emits = defineEmits(["onSubmit"]);
onMounted(() => {
  console.log(formData);
});
function addImageContent() {
  console.log("imgContents", imgContents.value);
  // 获取最后一个元素
  let item = imgContents.value[imgContents.value.length - 1];
  console.log("item", item);
  // 如果 item 存在，则 order 值加 1，否则为 0
  let orderValue = item ? item.order + 1 : 0;
  let imgItem = reactive({
    name: "",
    url: "",
    img_content: "",
    order: orderValue,
    id: 0,
  });
  imgContents.value.push(imgItem);
  console.log(addImageContent.name, "imgContents", imgContents.value);
}

async function deleteImageByItemId(item: any) {
  let index = imgContents.value.indexOf(item);
  if (item.id > 0) {
    await apiDeleteImageById(item.id);
  } else {
    if (item?.url) {
      await apiDeleteImageByPath(item.url);
    }
  }
  imgContents.value.splice(index, 1);
}

async function onImgContentSuccess(item: any, resObj: any) {
  item.name = resObj.name;
}
async function submitContent() {
  console.log("提交前的 imgContents:", imgContents.value);
  try {
    let id = await apiPostItemDetail(itemId, formData.value, imgContents.value);
    console.log(submitContent.name, "id", id);
    emits("onSubmit", id);

    // 强制更新视图
    await nextTick();

    // 添加以下代码，提交后返回到 ShowArticle 页面
    window.location.href = `/show-article/${id}`;
  } catch (error) {
    console.error("提交失败:", error);
    alertFail(submitContent.name, "提交失败，请检查数据是否正确");
  }
}

function moveUp(item: any) {
  console.log(item);
  let i = item.order;
  let j = item.order - 1;
  if (i != 0) {
    let temp = imgContents.value[i];
    imgContents.value[i] = imgContents.value[j];
    imgContents.value[j] = temp;
    imgContents.value[i].order = item.order;
    imgContents.value[j].order = item.order - 1;
    console.log(imgContents.value);
  } else {
    alertFail(moveUp.name, "已经是第一张图片了");
  }
}

function moveDown(item: any) {
  console.log(item);
  let i = item.order;
  let j = item.order + 1;
  if (i != imgContents.value.length - 1) {
    let temp = imgContents.value[i];
    imgContents.value[i] = imgContents.value[j];
    imgContents.value[j] = temp;
    imgContents.value[i].order = item.order;
    imgContents.value[j].order = item.order + 1;
    console.log(imgContents.value);
  } else {
    alertFail(moveDown.name, "已经是最后一张图片了");
  }
}
</script>

<style scoped></style>
