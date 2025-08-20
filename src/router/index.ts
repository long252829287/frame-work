import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/Index.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/resgister/Index.vue'),
    meta: { public: true },
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('@/views/notes/Index.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // 检查是否有有效的登录状态
  const isAuthenticated = authStore.checkAuth()

  if (to.meta?.requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    // 已登录用户访问登录/注册页，重定向到笔记页
    next({ name: 'notes' })
    return
  }

  next()
})

export default router
