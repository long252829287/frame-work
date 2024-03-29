import { createRouter, createWebHistory } from 'vue-router'
import homePage from '../views/homePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: homePage
    },
    {
      path: '/play',
      name: 'play',
      component: () => import('../views/play/play.vue')
    },
    {
      path: '/room',
      name: 'room',
      component: () => import('../views/room/room.vue')
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/chatGPT/chat.vue')
    },
    {
      path: '/pictureWall',
      name: 'pictureWall',
      component: () => import('../views/pictureWall/pictureWall.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/login.vue')
    }
  ]
})

export default router
