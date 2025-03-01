<template>
  <nut-uploader
    :url="props.url"
    name="file"
    v-if="props.needCompression"
    :headers="headToken"
    v-model:file-list="defaultFileList"
    @success="onImgSuccess"
    capture
    @delete="deleteImageByFileName"
    list-type="list"
    :before-upload="beforeUpload"
  >
    <nut-button type="info" size="small" v-if="defaultFileList.length == 0"
      >上传图片</nut-button
    >
  </nut-uploader>
  <nut-uploader
    :url="props.url"
    name="file"
    v-else
    :headers="headToken"
    @success="onImgSuccess"
    capture
    @delete="deleteImageByFileName"
  ></nut-uploader>
</template>

<script setup lang="ts">
import { imageBaseUrl, imgUploadUrl } from "@/stores/basic-data";
import { useUserStore } from "@/stores/user";
import { apiDeleteImageByPath } from "@/utils/apiUtils";
import { showFail, showSuccess } from "@/utils/showMessage";
import imageCompression from "browser-image-compression";
import { reactive, watchEffect } from "vue";

const userStore = useUserStore();
const headToken = { authorization: userStore.token };
const props = defineProps({
  needCompression: {
    type: Boolean,
    default: false,
  },
  maxWidthOrHeight: {
    type: Number,
    default: 800,
  },
  url: {
    type: String,
    default: imgUploadUrl,
  },
});
const imgSrc = defineModel("imgSrc", { required: true });
const emit = defineEmits(["onSuccess", "onDelete"]);
const compressOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: props.maxWidthOrHeight,
  useWebWorker: true,
};
const defaultFileList = reactive([
  {
    url: imageBaseUrl + imgSrc.value,
    status: "success",
    type: "image",
    name: imgSrc.value,
  },
]);
watchEffect(() => {
  if (imgSrc.value) {
    if (defaultFileList.length == 0) {
      defaultFileList.push({
        url: imageBaseUrl + imgSrc.value,
        status: "success",
        type: "image",
        name: imgSrc.value,
      });
    } else {
      defaultFileList[0] = {
        url: imageBaseUrl + imgSrc.value,
        status: "success",
        type: "image",
        name: imgSrc.value,
      };
    }
  } else {
    defaultFileList.shift();
  }
});
const beforeUpload = async (files: File[]) => {
  let file = files[0];
  let fileName = file.name;
  console.log(fileName);
  try {
    let blob = await imageCompression(file, compressOptions);
    let f = new File([blob], fileName);
    return [f];
  } catch (error) {
    showFail("图片压缩失败：", error);
    return [];
  }
};
async function deleteImageByFileName() {
  let path = imgSrc.value;
  let res = await apiDeleteImageByPath(path);
  if (res) {
    showSuccess(deleteImageByFileName.name, res);
    imgSrc.value = "";
    emit("onDelete");
  }
}
const onImgSuccess = ({ responseText }: any) => {
  showSuccess(onImgSuccess.name, responseText);
  let resObj = JSON.parse(responseText);
  resObj.src = resObj?.src ?? resObj?.url;
  imgSrc.value = resObj.src;
  console.log(imgSrc.value);

  emit("onSuccess", resObj);
};
</script>

<style scoped></style>
