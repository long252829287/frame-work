import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { createAuthGuard } from './guards'

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
    path: '/tool',
    name: 'tool',
    component: () => import('@/views/tool/Index.vue'),
  },
  {
    path: '/imageMagic',
    name: 'imageMagic',
    component: () => import('@/views/imageMagic/Index.vue'),
  },
  {
    path: '/lol',
    name: 'lol',
    component: () => import('@/views/lol/Index.vue'),
  },
  {
    path: '/lol/create',
    name: 'lol-create',
    component: () => import('@/views/lol/Create.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  createAuthGuard(useAuthStore)(to, from, next)
})

export default router
