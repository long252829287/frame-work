import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { commonService } from '@/service'
import type { ApiLoginData } from '@/types'

export interface UserInfo {
  uid: string
  username: string
  nickname?: string
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserInfo | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  async function login(payload: { username: string; password: string }) {
    const res = await commonService.apiLogin(payload)
    const data = res.data as ApiLoginData
    setToken(data?.token)
    user.value = data?.user ?? null
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
    user.value = null
    router.replace({ name: 'login' })
  }

  return {
    token,
    user,
    isAuthenticated,
    setToken,
    login,
    register,
    logout,
  }
})
