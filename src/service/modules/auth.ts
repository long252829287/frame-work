import fetch from '../fetch'
import type { ApiLoginData } from '@/types'

export default {
  async apiRegister(payload: { username: string; password: string; nickname?: string }) {
    return fetch.post<{ message?: string } | Record<string, unknown>>('/api/auth/register', payload)
  },

  async apiLogin(payload: { username: string; password: string }) {
    return fetch.post<ApiLoginData>('/api/auth/login', payload)
  },

  async apiLogout() {
    return fetch.post<{ message?: string } | Record<string, unknown>>('/api/auth/logout')
  },
}