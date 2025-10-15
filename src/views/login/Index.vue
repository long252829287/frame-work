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

    const redirect = (route.query.redirect as string) || '/home'
    auth.setLastRoute('/home')
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
  <div class="login-container">
    <div class="login-card">
      <div class="card-header">
        <div class="back-button" @click="$router.push({ name: 'home' })" title="返回首页">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          返回
        </div>
        <h1 class="header-title">欢迎回来</h1>
        <p class="header-subtitle">登录到你的账户</p>
      </div>

      <form @submit.prevent="onSubmit" class="login-form">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            autocomplete="username"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            autocomplete="current-password"
            placeholder="请输入密码"
            required
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>

          <div class="divider">
            <span class="divider-text">还没有账户？</span>
          </div>

          <button type="button" class="btn btn-secondary" @click="$router.push({ name: 'register' })">
            注册新账户
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/themes/modern-minimal.scss' as theme;

.login-container {
  min-height: 100vh;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.login-card {
  @include theme.card;
  max-width: 420px;
  width: 100%;
  padding: var(--spacing-3xl);
}

.card-header {
  margin-bottom: var(--spacing-2xl);

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-text-tertiary);
    font-size: var(--font-size-sm);
    cursor: pointer;
    margin-bottom: var(--spacing-lg);
    transition: color var(--transition-fast);

    &:hover {
      color: var(--color-accent-primary);
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .header-title {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    margin: 0 0 var(--spacing-sm) 0;
    letter-spacing: -0.02em;
  }

  .header-subtitle {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin: 0;
  }
}

.login-form {
  .form-group {
    margin-bottom: var(--spacing-lg);
  }

  .form-label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .form-input {
    @include theme.input;
    width: 100%;
  }

  .form-actions {
    margin-top: var(--spacing-2xl);
  }

  .btn {
    width: 100%;
    padding: 12px var(--spacing-lg);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);

    &.btn-primary {
      @include theme.button-primary;
    }

    &.btn-secondary {
      @include theme.button-secondary;
    }
  }

  .divider {
    display: flex;
    align-items: center;
    margin: var(--spacing-xl) 0;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--color-border-primary);
    }

    .divider-text {
      padding: 0 var(--spacing-md);
      font-size: var(--font-size-sm);
      color: var(--color-text-tertiary);
    }
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .login-container {
    padding: var(--spacing-md);
  }

  .login-card {
    padding: var(--spacing-xl);
  }

  .card-header {
    .header-title {
      font-size: var(--font-size-2xl);
    }

    .header-subtitle {
      font-size: var(--font-size-sm);
    }
  }
}
</style>
