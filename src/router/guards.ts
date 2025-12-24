import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export interface AuthStoreLike {
  checkAuth(): boolean
  setLastRoute(route: string | null): void
}

// 认证路由守卫：抽成纯函数，便于在单元测试中通过 mock store 稳定覆盖关键分支。
export function createAuthGuard(getAuthStore: () => AuthStoreLike) {
  return (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const authStore = getAuthStore()

    // 检查是否有有效的登录状态
    const isAuthenticated = authStore.checkAuth()

    if (to.meta?.requiresAuth && !isAuthenticated) {
      // 需要登录但未登录，保存目标路由并重定向到登录页
      authStore.setLastRoute(to.fullPath)
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
      // 已登录用户访问登录/注册页，重定向到首页
      next('/home')
      return
    }

    next()
  }
}

