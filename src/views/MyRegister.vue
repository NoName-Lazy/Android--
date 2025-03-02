<template>
  <nut-navbar
    title="22211860227 涂亦强"
    left-show
    @click-back="gotoBack"
  ></nut-navbar>
  <nut-row type="flex" justify="center">
    <nut-col :span="8">
      <Add color="darkblue" width="100%" height="40vh"></Add>
    </nut-col>
  </nut-row>
  <nut-row type="flex" justify="center">
    <nut-col :span="18">
      <nut-form
        :model-value="formData"
        ref="formRef"
        :rules="{
          email: [
            { required: true, message: '请输入Email' },
            {
              regex: /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: '输入的Email不合法',
            },
          ],
          password: [
            { required: true, message: '密码不为空' },
            { validator: passwordLengthValidate, message: '密码至少3位' },
          ],
          password2: [
            { required: true, message: '确认密码不为空' },
            { validator: passwordIsSameValidate, message: '密码须一致' },
          ],
        }"
      >
        <nut-form-item label="Email" prop="email">
          <nut-input
            v-model="formData.email"
            placeholder="输入Email"
            clearable
            @blur="customBlurValidate('email')"
            type="text"
          ></nut-input>
        </nut-form-item>

        <nut-form-item label="密码" prop="password">
          <nut-input
            v-model="formData.password"
            placeholder="输入密码"
            clearable
            @blur="customBlurValidate('password')"
            type="password"
          ></nut-input>
        </nut-form-item>

        <nut-form-item label="确定密码" prop="password2">
          <nut-input
            v-model="formData.password2"
            placeholder="再次输入密码"
            clearable
            @blur="customBlurValidate('password2')"
            type="password"
          ></nut-input>
        </nut-form-item>
      </nut-form>
    </nut-col>
  </nut-row>
  <div class="center">
    <nut-button type="info" @click="register">注册</nut-button>
  </div>
</template>

<script setup lang="ts">
import { gotoBack, gotoHome } from "@/router";
import { apiRegister } from "@/utils/apiUtils";
import { alertFail, showFail, showSuccess } from "@/utils/showMessage";
import { reactive, ref } from "vue";
import { Add } from "@nutui/icons-vue";
const formData = reactive({
  email: "",
  password: "",
  password2: "",
});
const formRef = ref(null);
const customBlurValidate = (prop: any) => {
  formRef.value?.validate(prop).then();
};
const passwordLengthValidate = (val: string) => {
  if (val) {
    if (val.length > 2) {
      return Promise.resolve();
    } else {
      return Promise.reject("密码必须大于2位数");
    }
  } else {
    return Promise.reject("密码不能为空");
  }
};
const passwordIsSameValidate = (val: string) => {
  if (val == formData.password) {
    return Promise.resolve();
  } else {
    return Promise.reject("输入密码不一致");
  }
};
async function register() {
  formRef.value?.validate().then(async ({ valid, errors }: any) => {
    showSuccess(register.name, { valid, errors });
    if (valid) {
      let registerData = {
        email: formData.email,
        password: formData.password,
      };
      let data = await apiRegister(registerData);
      if (data) {
        gotoHome();
      }
    } else {
      showFail(register.name, errors);
      alertFail(register.name, errors[0].message);
    }
  });
}
</script>

<style scoped>
.center {
  display: flex;
  justify-content: center;
}
</style>
