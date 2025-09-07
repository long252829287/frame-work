import axios, { type AxiosRequestConfig } from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const http = axios.create({
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as any).Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {    
    // 检查响应中是否包含过期令牌消息
    const responseData = response.data
    if (responseData && typeof responseData === 'object') {
      const message = responseData.message || responseData.error || responseData.msg
      if (typeof message === 'string' && message.includes('访问令牌已过期，请重新登录')) {
        handleTokenExpired()
        return Promise.reject(new Error(message))
      }
    }
    
    return response;
  },
  (error) => {
    // 检查错误响应中是否包含过期令牌消息
    if (error.response?.data) {
      const errorData = error.response.data
      const message = errorData.message || errorData.error || errorData.msg
      if (typeof message === 'string' && message.includes('访问令牌已过期，请重新登录')) {
        handleTokenExpired()
        return Promise.reject(new Error(message))
      }
    }
    
    return Promise.reject(error)
  },
)

// 处理令牌过期的函数
function handleTokenExpired() {
  console.warn('访问令牌已过期，正在清理登录状态并重定向到登录页')
  
  // 获取当前路由路径，用于登录后重定向
  const currentPath = router.currentRoute.value.fullPath
  
  // 清理认证状态
  const authStore = useAuthStore()
  authStore.logout().catch(() => {
    // 即使logout API调用失败，也要清理本地状态
    authStore.setToken(null)
    authStore.setUser(null)
  })
  
  // 重定向到登录页，并保存当前路径用于登录后跳转
  if (router.currentRoute.value.name !== 'login') {
    router.push({
      name: 'login',
      query: { redirect: currentPath !== '/login' ? currentPath : '/home' }
    })
  }
}

type AxiosConfig = AxiosRequestConfig

const fetch = {
  get<T = unknown>(url: string, config?: AxiosConfig) {
    return http.get<T>(url, config)
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosConfig) {
    return http.post<T>(url, data, config)
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosConfig) {
    return http.put<T>(url, data, config)
  },
  delete<T = unknown>(url: string, config?: AxiosConfig) {
    return http.delete<T>(url, config)
  },
}

export default fetch
