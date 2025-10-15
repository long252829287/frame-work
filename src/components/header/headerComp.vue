<template>
  <header :class="headerClasses">
    <!-- 左侧导航区域 -->
    <div class="header-left">
      <div class="logo-container" @click="router.push({ name: 'home' })">
        <div class="logo-icon">🏡</div>
        <div class="logo-text">
          <span class="logo-main">Osheeep</span>
          <div class="logo-subtitle">diy everyThing</div>
        </div>
      </div>
    </div>

    <!-- 右侧用户区域 -->
    <div class="header-right">
      <!-- 主题切换器 -->
      <ThemeSwitcher />

      <div v-if="!auth.isAuthenticated" class="auth-buttons">
        <!-- 登录按钮 -->
        <button class="auth-btn login-btn" @click="router.push({ name: 'login' })">
          <span>登录</span>
        </button>

        <!-- 注册按钮 -->
        <button class="auth-btn register-btn" @click="router.push({ name: 'register' })">
          <span>注册</span>
        </button>
      </div>

      <!-- 用户信息区域 -->
      <div v-else class="user-section">
        <div class="user-dropdown" @click="toggleUserMenu">
          <div class="user-avatar">
            <img :src="userAvatar" :alt="displayName" class="avatar-img" />
          </div>

          <div class="user-info">
            <div class="user-name">{{ displayName }}</div>
            <div class="user-status">在线</div>
          </div>
        </div>

        <!-- 下拉菜单 -->
        <div class="user-menu" :class="{ show: showUserMenu }">
          <div class="menu-item" @click="viewProfile">
            <span class="menu-icon">👤</span>
            <span>个人资料</span>
          </div>

          <div class="menu-item" @click="viewSettings">
            <span class="menu-icon">⚙️</span>
            <span>设置</span>
          </div>

          <div class="menu-divider"></div>

          <div class="menu-item logout" @click="handleLogout">
            <span class="menu-icon">🚪</span>
            <span>退出登录</span>
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
import ThemeSwitcher from '../ThemeSwitcher.vue'

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

<style lang="scss" scoped>
@use '@/assets/scss/themes/modern-minimal.scss' as theme;

.modern-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: var(--z-fixed);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border-primary);
  transition: all var(--transition-base);

  /* Backdrop blur for modern glass effect */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);

  /* Scrolled state */
  &--scrolled {
    height: 56px;
    box-shadow: var(--shadow-sm);
    border-bottom-color: var(--color-border-secondary);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.logo-container {
  cursor: pointer;
  user-select: none;
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: transform var(--transition-fast);
  border-radius: var(--radius-md);

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  .logo-icon {
    font-size: 1.75rem;
    transition: transform var(--transition-fast);
  }

  &:hover .logo-icon {
    transform: scale(1.1);
  }

  .logo-text {
    .logo-main {
      font-size: 1.5rem;
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
    }

    .logo-subtitle {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: -2px;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.auth-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.auth-btn {
  @include theme.button-base;
  padding: 8px 16px;
  font-size: var(--font-size-sm);

  &.login-btn {
    @include theme.button-secondary;
  }

  &.register-btn {
    @include theme.button-primary;
  }
}

.user-section {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-bg-secondary);
  }
}

.user-avatar {
  .avatar-img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--color-border-primary);
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .user-name {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    line-height: 1;
  }

  .user-status {
    font-size: var(--font-size-xs);
    color: var(--color-success);
    line-height: 1;
  }
}

.user-menu {
  @include theme.card;
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  min-width: 200px;
  padding: var(--spacing-sm);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-fast);
  z-index: var(--z-dropdown);

  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);

  &:hover {
    background: var(--color-bg-secondary);
    color: var(--color-accent-primary);
  }

  &.logout {
    color: var(--color-error);

    &:hover {
      background: var(--color-error-light);
      color: var(--color-error);
    }
  }

  .menu-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }
}

.menu-divider {
  height: 1px;
  background: var(--color-border-primary);
  margin: var(--spacing-sm) 0;
}

// Responsive Design
@media (max-width: 768px) {
  .modern-header {
    padding: 0 var(--spacing-md);
    height: 56px;

    &--scrolled {
      height: 48px;
    }
  }

  .logo-container .logo-text {
    .logo-main {
      font-size: 1.25rem;
    }

    .logo-subtitle {
      font-size: 0.625rem;
    }
  }

  .user-info {
    display: none;
  }
}
</style>
