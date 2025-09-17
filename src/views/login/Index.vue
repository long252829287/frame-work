<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const formRef = ref()

async function onSubmit() {
  try {
    loading.value = true
    await auth.login(form)

    // 优先使用URL参数中的redirect，其次使用lastRoute，最后默认到首页
    const redirect = (route.query.redirect as string) || auth.lastRoute || '/home'
    await router.replace(redirect)
  } catch (e: any) {
    console.error('登录错误:', e)
    const errorMessage = e?.response?.data?.message || e?.message || '登录失败'
    window.alert(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="stardew-login-container">
    <!-- 背景装饰 -->
    <div class="background-decorations">
      <div class="decoration cloud cloud-1">☁️</div>
      <div class="decoration cloud cloud-2">⛅</div>
      <div class="decoration tree tree-1">🌲</div>
      <div class="decoration tree tree-2">🌳</div>
      <div class="decoration flower flower-1">🌸</div>
      <div class="decoration flower flower-2">🌼</div>
      <div class="decoration flower flower-3">🌻</div>
      <div class="decoration star star-1">✨</div>
      <div class="decoration star star-2">⭐</div>
      <div class="decoration heart heart-1">💕</div>
    </div>

    <div class="login-card">
      <div class="card-header">
        <div class="header-icon" @click="$router.push({ name: 'home' })" title="返回首页">🏠</div>
        <h2 class="header-title">欢迎回家</h2>
        <p class="header-subtitle">登录到你的小屋</p>
      </div>

      <form @submit.prevent="onSubmit" class="login-form">
        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">👤</span>
            <span class="label-text">用户名</span>
          </label>
          <input v-model="form.username" type="text" class="form-input" autocomplete="username" placeholder="输入你的用户名"
            required />
        </div>

        <div class="form-group">
          <label class="form-label">
            <span class="label-icon">🔐</span>
            <span class="label-text">密码</span>
          </label>
          <input v-model="form.password" type="password" class="form-input" autocomplete="current-password"
            placeholder="输入你的密码" required />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span class="btn-icon">🚪</span>
            <span class="btn-text">{{ loading ? '登录中...' : '进入小屋' }}</span>
          </button>

          <button type="button" class="btn btn-secondary" @click="$router.push({ name: 'register' })">
            <span class="btn-icon">📝</span>
            <span class="btn-text">注册新家</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stardew-login-container {
  min-height: 100vh;
  background: linear-gradient(135deg,
      #87ceeb 0%,
      #98fb98 25%,
      #f0e68c 50%,
      #dda0dd 75%,
      #ffa07a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  position: relative;
  overflow: hidden;
}

.background-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;

  .decoration {
    position: absolute;
    font-size: 2rem;
    animation: float 6s ease-in-out infinite;

    &.cloud-1 {
      top: 10%;
      left: 15%;
      animation-delay: 0s;
    }

    &.cloud-2 {
      top: 20%;
      right: 10%;
      animation-delay: 3s;
    }

    &.tree-1 {
      bottom: 10%;
      left: 5%;
      font-size: 3rem;
      animation-delay: 1s;
    }

    &.tree-2 {
      bottom: 15%;
      right: 8%;
      font-size: 2.5rem;
      animation-delay: 4s;
    }

    &.flower-1 {
      top: 60%;
      left: 8%;
      animation-delay: 2s;
    }

    &.flower-2 {
      top: 70%;
      right: 15%;
      animation-delay: 5s;
    }

    &.flower-3 {
      bottom: 40%;
      left: 12%;
      font-size: 2.5rem;
      animation-delay: 1.5s;
    }

    &.star-1 {
      top: 30%;
      left: 70%;
      font-size: 1.5rem;
      animation-delay: 0.5s;
    }

    &.star-2 {
      top: 80%;
      right: 30%;
      font-size: 1.2rem;
      animation-delay: 3.5s;
    }

    &.heart-1 {
      top: 50%;
      right: 5%;
      font-size: 1.8rem;
      animation-delay: 2.5s;
    }
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.8;
  }

  50% {
    transform: translateY(-15px) scale(1.1);
    opacity: 1;
  }
}

.login-card {
  background: linear-gradient(135deg, rgba(255, 248, 220, 0.95) 0%, rgba(255, 239, 213, 0.9) 100%);
  backdrop-filter: blur(10px);
  border: 2px solid #8b4513;
  border-radius: 25px;
  padding: 2.5rem;
  box-shadow: 0 15px 35px rgba(139, 69, 19, 0.3);
  max-width: 450px;
  width: 100%;
  position: relative;
  z-index: 2;
  transform: translateY(0);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(139, 69, 19, 0.4);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;

  .header-icon {
    font-size: 3rem;
    margin-bottom: 0.5rem;
    animation: bounce 2s ease-in-out infinite;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.5rem;
    border-radius: 50%;

    &:hover {
      transform: scale(1.1);
      animation-play-state: paused;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .header-title {
    font-size: 2rem;
    font-weight: bold;
    color: #8b4513;
    margin: 0 0 0.5rem 0;
    text-shadow: 2px 2px 4px rgba(139, 69, 19, 0.2);
  }

  .header-subtitle {
    font-size: 1rem;
    color: #d2691e;
    margin: 0;
    opacity: 0.8;
  }
}

@keyframes bounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

.login-form {
  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: #8b4513;

    .label-icon {
      font-size: 1.2rem;
    }

    .label-text {
      font-size: 1rem;
    }
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #d2691e;
    border-radius: 15px;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.9);
    color: #8b4513;
    font-family: inherit;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #ff6347;
      background: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(210, 105, 30, 0.3);
    }

    &::placeholder {
      color: rgba(139, 69, 19, 0.6);
    }
  }

  .form-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 20px;
    font-size: 1rem;
    font-weight: bold;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-icon {
      font-size: 1.2rem;
    }

    &.btn-primary {
      background: linear-gradient(135deg, #32cd32, #228b22);
      color: white;
      border: 2px solid #228b22;
      box-shadow: 0 4px 12px rgba(34, 139, 34, 0.3);

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #228b22, #32cd32);
        transform: translateY(-3px);
        box-shadow: 0 6px 18px rgba(34, 139, 34, 0.4);
      }

      &:active:not(:disabled) {
        transform: translateY(-1px);
      }
    }

    &.btn-secondary {
      background: linear-gradient(135deg, #ffb6c1, #ff69b4);
      color: #8b008b;
      border: 2px solid #ff69b4;
      box-shadow: 0 4px 12px rgba(255, 105, 180, 0.3);

      &:hover {
        background: linear-gradient(135deg, #ff69b4, #ffb6c1);
        transform: translateY(-3px);
        box-shadow: 0 6px 18px rgba(255, 105, 180, 0.4);
      }

      &:active {
        transform: translateY(-1px);
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stardew-login-container {
    padding: 10px;
  }

  .login-card {
    padding: 1.5rem;
    margin: 10px;
  }

  .card-header {
    .header-icon {
      font-size: 2.5rem;
    }

    .header-title {
      font-size: 1.5rem;
    }

    .header-subtitle {
      font-size: 0.9rem;
    }
  }

  .background-decorations .decoration {
    font-size: 1.5rem;

    &.tree-1,
    &.tree-2 {
      font-size: 2rem;
    }

    &.flower-3 {
      font-size: 2rem;
    }
  }

  .form-actions {
    .btn {
      padding: 0.75rem 1.25rem;
      font-size: 0.9rem;
    }
  }
}
</style>
