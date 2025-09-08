<template>
  <div class="header">
    <div class="header-logo cursor-pointer" :title="'返回首页'" @click="router.push({ name: 'home' })">
      Osheeep
    </div>
    <div class="header-author flex items-center">
      <el-dropdown>
        <el-avatar class="el-dropdown-link cursor-pointer"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="auth.isAuthenticated">
              欢迎，{{ auth.user?.nickname || auth.user?.username }}
            </el-dropdown-item>
            <el-dropdown-item divided v-if="auth.isAuthenticated" @click="auth.logout()">退出登录</el-dropdown-item>
            <el-dropdown-item v-else @click="router.push({ name: 'login' })"
              class="cursor-pointer flex items-center">登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
</script>

<style lang="scss" scoped>
.header {
  height: 60px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}
</style>