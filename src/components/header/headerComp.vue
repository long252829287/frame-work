<template>
  <header class="cyber-header">
    <!-- 毛玻璃背景 -->
    <div class="header-bg"></div>

    <!-- 科技线条装饰 -->
    <div class="tech-lines">
      <div class="line line-1"></div>
      <div class="line line-2"></div>
      <div class="line line-3"></div>
    </div>

    <!-- 左侧导航区域 -->
    <div class="header-left">
      <!-- 返回按钮 -->
      <div v-if="showBackButton" class="back-button" @click="goBack" :title="'返回'">
        <div class="back-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <span class="back-text">返回</span>
      </div>

      <!-- Logo区域 -->
      <div class="logo-container" @click="router.push({ name: 'home' })">
        <div class="logo-glow"></div>
        <div class="logo-text">
          <span class="logo-main">Osheeep</span>
          <div class="logo-subtitle">Framework</div>
        </div>
      </div>
    </div>

    <!-- 右侧用户区域 -->
    <div class="header-right">
      <div v-if="!auth.isAuthenticated" class="auth-buttons">
        <!-- 登录按钮 -->
        <button class="auth-btn login-btn" @click="router.push({ name: 'login' })">
          <span>登录</span>
          <div class="btn-bg"></div>
        </button>

        <!-- 注册按钮 -->
        <button class="auth-btn register-btn" @click="router.push({ name: 'register' })">
          <span>注册</span>
          <div class="btn-bg"></div>
        </button>
      </div>

      <!-- 用户信息区域 -->
      <div v-else class="user-section">
        <div class="user-dropdown" @click="toggleUserMenu">
          <div class="user-avatar">
            <div class="avatar-ring"></div>
            <img :src="userAvatar" :alt="displayName" class="avatar-img" />
            <div class="status-indicator"></div>
          </div>

          <div class="user-info">
            <div class="user-name">{{ displayName }}</div>
            <div class="user-status">在线</div>
          </div>

          <div class="dropdown-arrow" :class="{ open: showUserMenu }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <!-- 下拉菜单 -->
        <div class="user-menu" :class="{ show: showUserMenu }">
          <div class="menu-item" @click="viewProfile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                cx="12"
                cy="7"
                r="4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>个人资料</span>
          </div>

          <div class="menu-item" @click="viewSettings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
              <path
                d="M19.4 15A1.65 1.65 0 0 0 20.25 13.5L20.4 12L20.25 10.5A1.65 1.65 0 0 0 19.4 9L18.75 8.15A1.65 1.65 0 0 0 17.25 7.85L16 7.5L14.75 7.85A1.65 1.65 0 0 0 13.25 8.15L12.6 9A1.65 1.65 0 0 0 11.75 10.5L11.6 12L11.75 13.5A1.65 1.65 0 0 0 12.6 15L13.25 15.85A1.65 1.65 0 0 0 14.75 16.15L16 16.5L17.25 16.15A1.65 1.65 0 0 0 18.75 15.85L19.4 15Z"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
            <span>设置</span>
          </div>

          <div class="menu-divider"></div>

          <div class="menu-item logout" @click="handleLogout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                points="16,17 21,12 16,7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="21"
                y1="12"
                x2="9"
                y2="12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>退出登录</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 背景点击遮罩 -->
    <div v-if="showUserMenu" class="menu-overlay" @click="showUserMenu = false"></div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const showUserMenu = ref(false)

// 计算属性
const displayName = computed(() => auth.user?.nickname || auth.user?.username || '用户')

const userAvatar = computed(
  () => 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
)

const showBackButton = computed(() => {
  return route.name !== 'home' && window.history.length > 1
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
  // TODO: 跳转到个人资料页面
  console.log('查看个人资料')
}

const viewSettings = () => {
  showUserMenu.value = false
  // TODO: 跳转到设置页面
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

// 监听点击外部关闭菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-section')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.cyber-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(15, 23, 42, 0.95) 50%,
      rgba(30, 41, 59, 0.9) 100%
    );
    z-index: -1;
  }

  .tech-lines {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: -1;

    .line {
      position: absolute;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(59, 130, 246, 0.5) 50%,
        transparent 100%
      );
      height: 1px;
      animation: tech-flow 3s ease-in-out infinite;

      &.line-1 {
        top: 20%;
        left: -100%;
        width: 40%;
        animation-delay: 0s;
      }

      &.line-2 {
        top: 60%;
        right: -100%;
        width: 30%;
        animation-delay: 1s;
      }

      &.line-3 {
        top: 80%;
        left: -100%;
        width: 50%;
        animation-delay: 2s;
      }
    }
  }
}

@keyframes tech-flow {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateX(200vw);
    opacity: 0;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(59, 130, 246, 0.2) 50%,
      transparent 100%
    );
    transition: left 0.5s ease;
  }

  &:hover {
    border-color: rgba(59, 130, 246, 0.5);
    color: #3b82f6;
    transform: translateX(-2px);

    &::before {
      left: 100%;
    }
  }

  .back-icon {
    display: flex;
    align-items: center;
    transition: transform 0.3s ease;
  }

  .back-text {
    font-size: 0.875rem;
    font-weight: 500;
  }

  &:hover .back-icon {
    transform: translateX(-2px);
  }
}

.logo-container {
  position: relative;
  cursor: pointer;
  user-select: none;
  padding: 0.5rem;

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover .logo-glow {
    opacity: 1;
    animation: pulse 2s ease-in-out infinite;
  }

  .logo-text {
    position: relative;
    z-index: 1;

    .logo-main {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.5px;
    }

    .logo-subtitle {
      font-size: 0.6rem;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: -2px;
      margin-left: 2px;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.6;
  }
}

.header-right {
  display: flex;
  align-items: center;
}

.auth-buttons {
  display: flex;
  gap: 0.75rem;
}

.auth-btn {
  position: relative;
  padding: 0.625rem 1.25rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  .btn-bg {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
    transition: left 0.3s ease;
    z-index: -1;
  }

  &:hover {
    border-color: rgba(59, 130, 246, 0.6);
    color: #fff;
    transform: translateY(-1px);

    .btn-bg {
      left: 0;
    }
  }

  &.register-btn {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
    border-color: rgba(59, 130, 246, 0.4);

    &:hover {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4));
    }
  }
}

.user-section {
  position: relative;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
  }
}

.user-avatar {
  position: relative;
  width: 40px;
  height: 40px;

  .avatar-ring {
    position: absolute;
    top: -2px;
    left: -2px;
    width: 44px;
    height: 44px;
    border: 2px solid transparent;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6) border-box;
    mask:
      linear-gradient(#fff 0 0) padding-box,
      linear-gradient(#fff 0 0);
    mask-composite: subtract;
    animation: rotate 3s linear infinite;
  }

  .avatar-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .status-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background: #10b981;
    border: 2px solid #0f172a;
    border-radius: 50%;
    animation: heartbeat 2s ease-in-out infinite;
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
    transform: scale(1.1);
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;

  .user-name {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1;
  }

  .user-status {
    font-size: 0.75rem;
    color: #10b981;
    line-height: 1;
  }
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  color: rgba(255, 255, 255, 0.6);

  &.open {
    transform: rotate(180deg);
  }
}

.user-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.5rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);

  &.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &.logout {
    color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
  }

  svg {
    flex-shrink: 0;
  }

  span {
    font-size: 0.875rem;
    font-weight: 500;
  }
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

// 响应式设计
@media (max-width: 768px) {
  .cyber-header {
    padding: 0 1rem;
    height: 60px;
  }

  .header-left {
    gap: 1rem;
  }

  .logo-container .logo-text {
    .logo-main {
      font-size: 1.5rem;
    }

    .logo-subtitle {
      font-size: 0.5rem;
    }
  }

  .auth-buttons {
    gap: 0.5rem;
  }

  .auth-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .back-button {
    padding: 0.375rem 0.75rem;

    .back-text {
      display: none;
    }
  }

  .user-info {
    display: none;
  }
}
</style>
