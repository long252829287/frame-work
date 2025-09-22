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
    component: () => import('@/views/register/Index.vue'),
    meta: { public: true },
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('@/views/notes/Index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/shared-notes',
    name: 'shared-notes',
    component: () => import('@/views/sharedNotes/Index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/shared-notes/:id',
    name: 'shared-notes-detail',
    component: () => import('@/views/sharedNotes/Detail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/credentials',
    name: 'credentials',
    component: () => import('@/views/credentials/Index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/study',
    name: 'study',
    component: () => import('@/views/study/Index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/study/:id',
    name: 'study-detail',
    component: () => import('@/views/study/Detail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/todo',
    name: 'todo',
    component: () => import('@/views/todo/Index.vue'),
  },
  {
    path: '/tool',
    name: 'tool',
    component: () => import('@/views/tool/Index.vue'),
  },
  {
    path: '/imageMagic',
    name: 'imageMagic',
    component: () => import('@/views/imageMagic/Index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 检查是否有有效的登录状态
  const isAuthenticated = authStore.checkAuth()

  // 记录最后访问的路由（排除登录和注册页面）
  if (from.name && from.name !== 'login' && from.name !== 'register' && isAuthenticated) {
    authStore.setLastRoute(from.fullPath)
  }

  if (to.meta?.requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    // 已登录用户访问登录/注册页，重定向到最后访问的页面或首页
    const redirectTo = authStore.lastRoute || '/home'
    next(redirectTo)
    return
  }

  next()
})

export default router
