import { describe, it, expect, vi } from 'vitest'
import { createAuthGuard, type AuthStoreLike } from '@/router/guards'

// 路由守卫单元测试：不依赖真实路由实例，只验证守卫对 next() 的调用结果。
describe('createAuthGuard', () => {
  it('需要登录但未登录时：保存 lastRoute 并跳转到登录页（带 redirect）', () => {
    const setLastRoute = vi.fn()
    const getAuthStore = () =>
      ({ checkAuth: () => false, setLastRoute } satisfies AuthStoreLike)

    const next = vi.fn()
    const guard = createAuthGuard(getAuthStore)

    guard(
      { meta: { requiresAuth: true }, fullPath: '/notes', name: 'notes' } as any,
      { fullPath: '/', name: 'home' } as any,
      next as any,
    )

    expect({ setLastRouteCalls: setLastRoute.mock.calls, nextCalls: next.mock.calls }).toEqual({
      setLastRouteCalls: [['/notes']],
      nextCalls: [[{ name: 'login', query: { redirect: '/notes' } }]],
    })
  })

  it('已登录访问登录页时：跳转到 /home', () => {
    const getAuthStore = () =>
      ({ checkAuth: () => true, setLastRoute: vi.fn() } satisfies AuthStoreLike)

    const next = vi.fn()
    const guard = createAuthGuard(getAuthStore)

    guard({ meta: { public: true }, fullPath: '/login', name: 'login' } as any, {} as any, next as any)

    expect(next.mock.calls).toEqual([['/home']])
  })

  it('不需要鉴权时：正常放行（next() 无参数）', () => {
    const getAuthStore = () =>
      ({ checkAuth: () => false, setLastRoute: vi.fn() } satisfies AuthStoreLike)

    const next = vi.fn()
    const guard = createAuthGuard(getAuthStore)

    guard({ meta: {}, fullPath: '/tool', name: 'tool' } as any, {} as any, next as any)

    expect(next.mock.calls).toEqual([[]])
  })
})

