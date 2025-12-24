import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// 认证 store 单元测试：仅验证行为，不依赖真实后端与真实网络。
vi.mock('@/service', () => ({
  commonService: {
    apiLogin: vi.fn(),
    apiRegister: vi.fn(),
    apiLogout: vi.fn(),
  },
}))

import { commonService } from '@/service'
import { useAuthStore, type UserInfo } from '@/stores/auth'

const api = commonService as unknown as {
  apiLogin: ReturnType<typeof vi.fn>
  apiRegister: ReturnType<typeof vi.fn>
  apiLogout: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
})

describe('useAuthStore', () => {
  it('setToken：写入 token 后同步到 localStorage 与状态', () => {
    const store = useAuthStore()

    store.setToken('t1')
    expect({ tokenInStorage: localStorage.getItem('token'), tokenInState: store.token }).toEqual({
      tokenInStorage: 't1',
      tokenInState: 't1',
    })
  })

  it('setToken：清理 token 后移除 localStorage 并清空状态', () => {
    const store = useAuthStore()
    store.setToken('t1')

    store.setToken(null)
    expect({ tokenInStorage: localStorage.getItem('token'), tokenInState: store.token }).toEqual({
      tokenInStorage: null,
      tokenInState: null,
    })
  })

  it('setUser：写入 user 后同步到 localStorage 与状态', () => {
    const store = useAuthStore()

    const user: UserInfo = { uid: '1', username: 'alice', nickname: 'Ali' }
    store.setUser(user)
    expect({ userInStorage: JSON.parse(localStorage.getItem('user') ?? 'null'), userInState: store.user }).toEqual({
      userInStorage: user,
      userInState: user,
    })
  })

  it('setUser：清理 user 后移除 localStorage 并清空状态', () => {
    const store = useAuthStore()
    store.setUser({ uid: '1', username: 'alice' })

    store.setUser(null)
    expect({ userInStorage: localStorage.getItem('user'), userInState: store.user }).toEqual({
      userInStorage: null,
      userInState: null,
    })
  })

  it('checkAuth：有 token 时返回 true，且能容忍 user 的非法 JSON', () => {
    localStorage.setItem('token', 't1')
    localStorage.setItem('user', '{not-json')

    const store = useAuthStore()
    const result = store.checkAuth()
    expect({ result, token: store.token, user: store.user }).toEqual({ result: true, token: 't1', user: null })
  })

  it('checkAuth：没有 token 时返回 false', () => {
    const store = useAuthStore()
    const result = store.checkAuth()
    expect({ result, isAuthenticated: store.isAuthenticated }).toEqual({ result: false, isAuthenticated: false })
  })

  it('login：兼容 { data: { token, user } } 返回结构', async () => {
    api.apiLogin.mockResolvedValueOnce({
      data: { data: { token: 't1', user: { uid: '1', username: 'alice' } } },
    })

    const store = useAuthStore()
    await store.login({ username: 'alice', password: 'pw' })

    expect({
      tokenInState: store.token,
      userInState: store.user,
      tokenInStorage: localStorage.getItem('token'),
    }).toEqual({
      tokenInState: 't1',
      userInState: { uid: '1', username: 'alice' },
      tokenInStorage: 't1',
    })
  })

  it('login：兼容 { token, user } 返回结构', async () => {
    api.apiLogin.mockResolvedValueOnce({
      data: { token: 't2', user: { uid: '2', username: 'bob', nickname: 'B' } },
    })

    const store = useAuthStore()
    await store.login({ username: 'bob', password: 'pw' })

    expect({
      tokenInState: store.token,
      userInState: store.user,
      tokenInStorage: localStorage.getItem('token'),
    }).toEqual({
      tokenInState: 't2',
      userInState: { uid: '2', username: 'bob', nickname: 'B' },
      tokenInStorage: 't2',
    })
  })

  it('login：缺少 token 时抛出明确错误', async () => {
    api.apiLogin.mockResolvedValueOnce({ data: {} })

    const store = useAuthStore()
    await expect(store.login({ username: 'alice', password: 'pw' })).rejects.toThrow(
      '登录失败：未返回有效 token',
    )
  })

  it('logout：即使 apiLogout 失败也会清理本地状态', async () => {
    api.apiLogout.mockRejectedValueOnce(new Error('network'))

    const store = useAuthStore()
    store.setToken('t1')
    store.setUser({ uid: '1', username: 'alice' })

    await store.logout()

    expect({
      tokenInState: store.token,
      userInState: store.user,
      tokenInStorage: localStorage.getItem('token'),
      userInStorage: localStorage.getItem('user'),
    }).toEqual({
      tokenInState: null,
      userInState: null,
      tokenInStorage: null,
      userInStorage: null,
    })
  })

  it('setLastRoute：写入与清理 lastRoute 行为正确', () => {
    const store = useAuthStore()

    store.setLastRoute('/notes')
    const afterSet = { lastRouteInState: store.lastRoute, lastRouteInStorage: localStorage.getItem('lastRoute') }

    store.setLastRoute(null)
    const afterClear = { lastRouteInState: store.lastRoute, lastRouteInStorage: localStorage.getItem('lastRoute') }

    expect({ afterSet, afterClear }).toEqual({
      afterSet: { lastRouteInState: '/notes', lastRouteInStorage: '/notes' },
      afterClear: { lastRouteInState: null, lastRouteInStorage: null },
    })
  })
})
