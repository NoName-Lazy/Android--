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
        >
      </template>
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
import ImageUploader from "@/views/ImageUploader.vue";
import { onMounted, reactive } from "vue";

const itemId: any = defineModel("itemId");
const formData: any = defineModel("formData");
const imgContents: any = defineModel("imgContents");
const emits = defineEmits(["onSubmit"]);
onMounted(() => {
  console.log(formData);
});
function addImageContent() {
  let item = imgContents.value[-1];
  let orderValue = item?.order ? item.order + 1 : 0;
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
  // console.log(formData);
  console.log(itemId, formData.value, imgContents.value);

  let id = await apiPostItemDetail(itemId, formData.value, imgContents.value);
  console.log(submitContent.name, "id", id);
  emits("onSubmit", id);
}
</script>

<style scoped></style>
