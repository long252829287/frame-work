<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-primary border-b border-primary transition-all duration-300"
    :class="{ 'h-14 shadow-sm': isScrolled, 'h-16': !isScrolled }">
    <!-- 内容容器 - 使用 Tailwind container -->
    <div class="container mx-auto h-full px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-full">
        <!-- 左侧Logo区域 -->
        <div class="flex items-center gap-6">
          <button @click="router.push({ name: 'home' })"
            class="flex items-center gap-3 p-2 rounded-lg transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 group">
            <div class="text-3xl transition-transform duration-200 group-hover:scale-110">🏡</div>
            <div class="flex flex-col">
              <span class="text-2xl font-bold text-primary tracking-tight">Osheeep</span>
              <div class="text-xs text-tertiary uppercase tracking-wider -mt-0.5">diy everyThing</div>
            </div>
          </button>
        </div>

        <!-- 右侧操作区域 -->
        <div class="flex items-center gap-3">

          <!-- 未登录状态 - 显示登录/注册按钮 -->
          <div v-if="!auth.isAuthenticated" class="flex gap-2">
            <button @click="router.push({ name: 'login' })"
              class="btn-secondary px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200">
              登录
            </button>
            <button @click="router.push({ name: 'register' })"
              class="btn-primary px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200">
              注册
            </button>
          </div>

          <!-- 已登录状态 - 显示用户菜单 -->
          <div v-else class="relative user-dropdown">
            <button @click="toggleUserMenu"
              class="flex items-center gap-3 px-3 py-2 rounded-full transition-colors duration-200 hover:bg-secondary cursor-pointer">
              <img :src="userAvatar" :alt="displayName"
                class="w-9 h-9 rounded-full object-cover border-2 border-primary" />
              <div class="hidden sm:flex flex-col gap-0.5">
                <div class="text-sm font-medium text-primary leading-none">{{ displayName }}</div>
                <div class="text-xs text-success leading-none">在线</div>
              </div>
            </button>

            <!-- 下拉菜单 -->
            <Transition name="menu">
              <div v-if="showUserMenu"
                class="absolute top-full right-0 mt-2 min-w-[200px] bg-primary border border-primary rounded-xl shadow-2xl p-2 z-50 user-menu">
                <button @click="viewProfile"
                  class="cursor-pointer menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary transition-all duration-200 hover:bg-secondary hover:text-accent">
                  <span class="text-base flex-shrink-0">👤</span>
                  <span>个人资料</span>
                </button>

                <button @click="viewSettings"
                  class="cursor-pointer menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary transition-all duration-200 hover:bg-secondary hover:text-accent">
                  <span class="text-base flex-shrink-0">⚙️</span>
                  <span>设置</span>
                </button>

                <div class="h-px bg-border my-2"></div>

                <button @click="handleLogout"
                  class="cursor-pointer menu-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-error transition-all duration-200 hover:bg-error-light">
                  <span class="text-base flex-shrink-0">🚪</span>
                  <span>退出登录</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const showUserMenu = ref(false)
const isScrolled = ref(false)

// 计算属性
const displayName = computed(() => auth.user?.nickname || auth.user?.username || '用户')

const userAvatar = computed(
  () => 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
)

const headerClasses = computed(() => {
  return {
    'modern-header': true,
    'modern-header--scrolled': isScrolled.value
  }
})

// 方法
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const viewProfile = () => {
  showUserMenu.value = false
  console.log('查看个人资料')
}

const viewSettings = () => {
  showUserMenu.value = false
  console.log('查看设置')
}

const handleLogout = async () => {
  showUserMenu.value = false
  try {
    await auth.logout()
    router.push({ name: 'home' })
  } catch (error) {
    console.error('登出失败:', error)
  }
}

// 监听滚动
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

// 监听点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-dropdown') && !target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Menu transition animations */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Custom Tailwind-like utility classes for theme variables */
.bg-primary {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.bg-secondary {
  background: var(--color-bg-secondary);
}

.bg-border {
  background: var(--color-border-primary);
}

.border-primary {
  border-color: var(--color-border-primary);
}

.text-primary {
  color: var(--color-text-primary);
}

.text-tertiary {
  color: var(--color-text-tertiary);
}

.text-success {
  color: var(--color-success);
}

.text-error {
  color: var(--color-error);
}

.text-accent {
  color: var(--color-accent-primary);
}

.bg-error-light {
  background: var(--color-error-light);
}

/* Button styles using theme mixins */
.btn-primary {
  background: var(--color-accent-primary);
  color: var(--color-text-inverse);
  border: none;

  &:hover:not(:disabled) {
    background: var(--color-accent-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-secondary);

  &:hover:not(:disabled) {
    background: var(--color-bg-secondary);
    border-color: var(--color-accent-primary);
    color: var(--color-accent-primary);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}
</style>
