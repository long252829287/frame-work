<script setup>
import { commonService } from '../../service';
const router = useRouter()
const loginForm = reactive({
  username: '',
  password: '',
})
function onSubmit() {
  const params = {
    username: loginForm.username,
    password: loginForm.password
  };
  commonService.toLogin(params).then(res => {
    switch (res.data.code) {
      case 200:
        ElMessage({
          message: res.data.message,
          type: 'success',
        })
        router.go(-1);
        break;
      case 400:
        ElMessage({
          message: res.data.message,
          type: 'warning',
        })
        break;
    }
  })
}
</script>

<template>
  <div class="login">
    <div class="login-box">
      <h3 class="login-title">账号登录</h3>
      <el-form
        :model="loginForm"
        style="max-width: 320px"
      >
        <el-form-item>
          <el-input v-model="loginForm.username" placeholder="请输入账号" size="large" clearable/>
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginForm.password" placeholder="请输入密码" size="large" clearable show-password/>
        </el-form-item>
      </el-form>
      <el-button class="full-btn" type="primary" size="large" @click="onSubmit" color="#1E80FF">登录</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  .login-box {
    width: 320px;
    .login-title {
      margin-bottom: 18px;
      font-weight: 500;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .full-btn {
      width: 100%;
    }
  }
}
</style>