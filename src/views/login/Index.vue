<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const formRef = ref()

async function onSubmit() {
  try {
    loading.value = true
    await auth.login(form)
    const redirect = (route.query.redirect as string) || '/notes'
    await router.replace(redirect)
  } catch (e: any) {
    console.error('登录错误:', e)
    const errorMessage = e?.response?.data?.message || e?.message || '登录失败'
    window.alert(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style="max-width: 420px; margin: 60px auto">
    <el-card>
      <template #header>
        <div class="card-header">登录</div>
      </template>
      <el-form :model="form" ref="formRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" autocomplete="current-password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="onSubmit">登录</el-button>
          <el-button link @click="$router.push({ name: 'register' })">去注册</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.card-header {
  font-size: 18px;
  font-weight: 600;
}
</style>
