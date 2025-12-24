import { describe, it, expect, vi } from 'vitest'
import { createFetch } from '@/service/fetch'

// fetch 封装单元测试：通过自定义 axios adapter 避免真实网络请求，稳定触发拦截器分支。
describe('createFetch', () => {
  it('会在请求头中自动携带 Authorization（来自 getToken）', async () => {
    const fetch = createFetch({
      getToken: () => 't1',
      onTokenExpired: vi.fn(),
    })

    let capturedHeaders: any = null

    await fetch.get('/unit-test', {
      adapter: async (config: any) => {
        capturedHeaders = config.headers
        return {
          data: { ok: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {},
        }
      },
    } as any)

    expect({ authorization: capturedHeaders?.Authorization ?? capturedHeaders?.authorization }).toEqual({
      authorization: 'Bearer t1',
    })
  })

  it('当响应包含“登录已过期”时：触发 onTokenExpired 并返回明确错误', async () => {
    const onTokenExpired = vi.fn()
    const fetch = createFetch({ getToken: () => 't1', onTokenExpired })

    let errorMessage = ''
    try {
      await fetch.get('/unit-test-expired', {
        adapter: async (config: any) => ({
          data: { message: '登录已过期，请重新登录' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {},
        }),
      } as any)
    } catch (error) {
      errorMessage = (error as Error).message
    }

    expect({ errorMessage, onTokenExpiredCalls: onTokenExpired.mock.calls.length }).toEqual({
      errorMessage: '登录已过期，请重新登录',
      onTokenExpiredCalls: 1,
    })
  })
})

