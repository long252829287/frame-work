<template>
  <header :class="headerClasses">
    <!-- 温暖的乡村背景 -->
    <div class="header-bg"></div>

    <!-- 装饰性点点 -->
    <div class="nature-decorations">
      <div class="decoration leaf leaf-1">🍃</div>
      <div class="decoration leaf leaf-2">🌿</div>
      <div class="decoration flower flower-1">🌸</div>
      <div class="decoration flower flower-2">🌼</div>
      <div class="decoration star star-1">✨</div>
      <div class="decoration star star-2">⭐</div>
    </div>

    <!-- 左侧导航区域 -->
    <div class="header-left">
      <!-- 返回按钮 -->
      <div v-if="showBackButton" class="back-button" @click="goBack" :title="'返回'">
        <div class="back-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
        </div>
        <span class="back-text">返回</span>
      </div>

      <!-- Logo区域 -->
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
      <!-- <ThemeSwitcher /> -->

      <div v-if="!auth.isAuthenticated" class="auth-buttons">
        <!-- 登录按钮 -->
        <button class="auth-btn login-btn" @click="router.push({ name: 'login' })">
          <span>🚪 登录</span>
        </button>

        <!-- 注册按钮 -->
        <button class="auth-btn register-btn" @click="router.push({ name: 'register' })">
          <span>📝 注册</span>
        </button>
      </div>

      <!-- 用户信息区域 -->
      <div v-else class="user-section">
        <div class="avatar-frame">🌻</div>
        <div class="status-indicator">💚</div>
        <div class="user-dropdown" @click="toggleUserMenu">
          <div class="user-avatar">
            <img :src="userAvatar" :alt="displayName" class="avatar-img" />
          </div>

          <div class="user-info">
            <div class="user-name">{{ displayName }}</div>
            <div class="user-status">🌱 活跃中</div>
          </div>

          <div class="dropdown-arrow" :class="{ open: showUserMenu }">
            <span class="arrow-icon">🔽</span>
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
// import ThemeSwitcher from '../themeSwitcher/themeSwitcherComp.vue.vue'

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

const showBackButton = computed(() => {
  return route.name !== 'home' && window.history.length > 1
})

// 现代网站特性：滚动时header样式变化
const headerClasses = computed(() => {
  return {
    'stardew-header': true,
    'stardew-header--scrolled': isScrolled.value
  }
})

// 方法
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push({ name: 'home' })
  }
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

// 现代网站特性：监听滚动
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
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
@use '@/assets/scss/themes/theme-manager.scss' as theme;

.stardew-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: theme.$stardew-z-dropdown;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 #{theme.theme-spacing('2xl')};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px #{theme.$stardew-shadow-dark};
  overflow: visible;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  transition: all #{theme.$stardew-transition-slow};

  /* 现代网站特性：滚动时样式变化 */
  &--scrolled {
    height: 60px;
    backdrop-filter: blur(20px);
    box-shadow: 0 2px 20px #{theme.$stardew-shadow-card};

    .header-bg {
      background: #{theme.theme-bg('bg-secondary')};
    }

    .logo-container .logo-icon {
      font-size: 1.8rem;
    }

    .logo-container .logo-text .logo-main {
      font-size: 1.5rem;
    }

    .nature-decorations .decoration {
      opacity: 0.6;
      transform: scale(0.8);
    }
  }

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #{theme.theme-bg('bg-secondary')};
    z-index: -1;
    transition: all #{theme.$stardew-transition-slow};
  }

  .nature-decorations {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: -1;

    .decoration {
      position: absolute;
      font-size: 1.2rem;
      animation: float 4s ease-in-out infinite;
      transition: all #{theme.$stardew-transition-slow};

      &.leaf-1 {
        top: 20%;
        left: 10%;
        animation-delay: 0s;
      }

      &.leaf-2 {
        top: 60%;
        right: 15%;
        animation-delay: 1s;
      }

      &.flower-1 {
        top: 15%;
        right: 58%;
        animation-delay: 2s;
      }

      &.flower-2 {
        top: 60%;
        left: 25%;
        animation-delay: 3s;
      }

      &.star-1 {
        top: 30%;
        left: 70%;
        animation-delay: 0.5s;
      }

      &.star-2 {
        top: 50%;
        right: 40%;
        animation-delay: 2.5s;
      }
    }
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.7;
  }

  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 1;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: #{theme.theme-spacing('xl')};
}

.back-button {
  display: flex;
  align-items: center;
  gap: #{theme.theme-spacing('sm')};
  padding: #{theme.theme-spacing('sm')} #{theme.theme-spacing('lg')};
  border-radius: 20px;
  color: #{theme.theme-color('text-primary')};
  cursor: pointer;
  transition: all #{theme.$stardew-transition-slow};
  font-weight: #{theme.$stardew-font-weight-semibold};

  &:hover {
    background: rgba(139, 69, 19, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px #{theme.$stardew-shadow-dark};
  }

  .back-icon {
    display: flex;
    align-items: center;
    transition: transform #{theme.$stardew-transition-slow};
  }

  .back-text {
    font-size: 0.875rem;
    font-weight: #{theme.$stardew-font-weight-semibold};
  }

  &:hover .back-icon {
    transform: translateX(-3px);
  }
}

.logo-container {
  position: relative;
  cursor: pointer;
  user-select: none;
  padding: #{theme.theme-spacing('sm')};
  display: flex;
  align-items: center;
  gap: #{theme.theme-spacing('md')};
  transition: transform #{theme.$stardew-transition-slow};

  &:hover {
    transform: scale(1.05);
  }

  .logo-icon {
    font-size: 2rem;
    animation: bounce 2s ease-in-out infinite;
    transition: all #{theme.$stardew-transition-slow};
  }

  .logo-text {
    .logo-main {
      font-size: 1.75rem;
      font-weight: #{theme.$stardew-font-weight-bold};
      background: linear-gradient(45deg, #{theme.theme-color('primary-dark')}, #{theme.theme-color('primary')}, #{theme.theme-color('primary-light')});
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 2px 2px 4px #{theme.$stardew-shadow-dark};
      transition: all #{theme.$stardew-transition-slow};
    }

    .logo-subtitle {
      font-size: 0.7rem;
      color: #{theme.theme-color('text-primary')};
      text-transform: none;
      letter-spacing: 1px;
      margin-top: -2px;
      opacity: 0.8;
    }
  }
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: #{theme.theme-spacing('md')};
}

.auth-buttons {
  display: flex;
  gap: #{theme.theme-spacing('md')};
}

.auth-btn {
  position: relative;
  padding: #{theme.theme-spacing('md')} #{theme.theme-spacing('xl')};
  @include theme.theme-button('default');
  border-radius: 25px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all #{theme.$stardew-transition-slow};

  &:hover {
    transform: translateY(-2px);
  }

  &.register-btn {
    @include theme.theme-button('secondary');
  }
}

.user-section {
  position: relative;

  .avatar-frame {
    position: absolute;
    top: 0px;
    left: -700px;
    font-size: 2.5rem;
    z-index: 1;
    animation: rotate 6s linear infinite;
  }

  .status-indicator {
    position: absolute;
    top: 0px;
    left: -250px;
    font-size: 1rem;
    z-index: 3;
    animation: heartbeat 2s ease-in-out infinite;
  }
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: #{theme.theme-spacing('md')};
  padding: #{theme.theme-spacing('sm')} #{theme.theme-spacing('lg')};
  border-radius: 25px;
  cursor: pointer;
  transition: all #{theme.$stardew-transition-slow};
  border: 2px solid #{theme.theme-color('border-primary')};

  &:hover {
    background: #{theme.theme-bg('bg-secondary')};
    transform: translateY(-1px);
  }
}

.user-avatar {
  position: relative;
  width: 40px;
  height: 40px;

  .avatar-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #{theme.theme-color('text-inverse')};
    position: relative;
    z-index: 2;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes heartbeat {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;

  .user-name {
    font-size: 0.875rem;
    font-weight: #{theme.$stardew-font-weight-semibold};
    color: #{theme.theme-color('text-primary')};
    line-height: 1;
  }

  .user-status {
    font-size: 0.75rem;
    color: #{theme.theme-color('accent-green')};
    line-height: 1;
    font-weight: #{theme.$stardew-font-weight-semibold};
  }
}

.dropdown-arrow {
  transition: transform #{theme.$stardew-transition-slow};

  .arrow-icon {
    font-size: 0.8rem;
    color: #{theme.theme-color('text-primary')};
  }

  &.open {
    transform: rotate(180deg);
  }
}

.user-menu {
  @include theme.theme-card;
  position: absolute;
  top: calc(100% + #{theme.theme-spacing('sm')});
  right: 0;
  min-width: 200px;
  padding: #{theme.theme-spacing('sm')};
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all #{theme.$stardew-transition-slow};
  z-index: theme.$stardew-z-dropdown;

  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: #{theme.theme-spacing('md')};
  padding: #{theme.theme-spacing('md')};
  border-radius: #{theme.theme-radius('md')};
  color: #{theme.theme-color('text-primary')};
  cursor: pointer;
  transition: all #{theme.$stardew-transition-normal};
  font-weight: #{theme.$stardew-font-weight-semibold};

  &:hover {
    background: #{theme.theme-color('secondary-light')};
    transform: translateX(5px);
  }

  &.logout {
    color: #{theme.theme-color('error')};

    &:hover {
      background: rgba(220, 20, 60, 0.1);
      color: #{theme.theme-color('error')};
    }
  }

  .menu-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  span:last-child {
    font-size: 0.875rem;
    font-weight: #{theme.$stardew-font-weight-semibold};
  }
}

.menu-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #{theme.theme-color('border-primary')}, transparent);
  margin: #{theme.theme-spacing('sm')} 0;
  border-radius: 1px;
}

// 响应式设计
@media (max-width: 768px) {
  .stardew-header {
    padding: 0 #{theme.theme-spacing('lg')};
    height: 60px;

    &--scrolled {
      height: 50px;
    }
  }

  .header-left {
    gap: #{theme.theme-spacing('lg')};
  }

  .logo-container .logo-text {
    .logo-main {
      font-size: 1.5rem;
    }

    .logo-subtitle {
      font-size: 0.6rem;
    }
  }

  .auth-buttons {
    gap: #{theme.theme-spacing('sm')};
  }

  .auth-btn {
    padding: #{theme.theme-spacing('sm')} #{theme.theme-spacing('lg')};
    font-size: 0.8rem;
  }

  .back-button {
    padding: 0.375rem #{theme.theme-spacing('md')};

    .back-text {
      display: none;
    }
  }

  .user-info {
    display: none;
  }

  .nature-decorations .decoration {
    font-size: 1rem;
  }
}

/* 现代网站优化：减少动画偏好 */
@media (prefers-reduced-motion: reduce) {

  .stardew-header,
  .decoration,
  .logo-icon,
  .avatar-frame,
  .status-indicator {
    animation: none;
    transition: none;
  }
}

/* 现代网站优化：高对比度模式 */
@media (prefers-contrast: high) {
  .stardew-header {
    border-bottom: 2px solid currentColor;
  }

  .user-dropdown,
  .auth-btn {
    border-width: 2px;
  }
}
</style>
