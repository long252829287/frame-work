import axios, { type AxiosRequestConfig } from 'axios'

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
  (response) => response,
  (error) => Promise.reject(error),
)

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
