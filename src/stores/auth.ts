import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { commonService } from '@/service'
import type { ApiLoginData } from '@/types'

export interface UserInfo {
  uid: string
  username: string
  nickname?: string
}

export const useAuthStore = defineStore('auth', () => {
  // 从 localStorage 初始化状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const savedUserRaw = localStorage.getItem('user')
  const user = ref<UserInfo | null>(savedUserRaw ? JSON.parse(savedUserRaw) : null)

  // 最后访问的路由（用于登录后跳转）
  const lastRoute = ref<string | null>(localStorage.getItem('lastRoute') || '/home')

  const isAuthenticated = computed(() => Boolean(token.value))

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  function setUser(newUser: UserInfo | null) {
    user.value = newUser
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  }

  async function login(payload: { username: string; password: string }) {
    const res = await commonService.apiLogin(payload)
    const raw = res?.data as any
    const data: any = raw?.token ? raw : (raw?.data ?? raw?.result ?? raw?.payload)
    const newToken: string | undefined = data?.token
    const newUser: UserInfo | null | undefined = data?.user

    if (!newToken) {
      throw new Error('登录失败：未返回有效 token')
    }

    setToken(newToken)
    setUser(newUser ?? null)
  }

  async function register(payload: { username: string; password: string; nickname?: string }) {
    await commonService.apiRegister(payload)
  }

  async function logout() {
    try {
      await commonService.apiLogout()
    } catch (_) {
      // ignore network errors for logout
    }
    setToken(null)
    setUser(null)
  }

  function setLastRoute(route: string | null) {
    lastRoute.value = route
    if (route) {
      localStorage.setItem('lastRoute', route)
    } else {
      localStorage.removeItem('lastRoute')
    }
  }

  // 检查登录状态
  function checkAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken) {
      token.value = savedToken
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser)
        } catch {
          user.value = null
        }
      }
      return true
    }
    return false
  }

  return {
    token,
    user,
    lastRoute,
    isAuthenticated,
    setToken,
    setUser,
    setLastRoute,
    login,
    register,
    logout,
    checkAuth,
  }
})
