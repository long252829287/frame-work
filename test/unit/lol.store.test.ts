import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// LoL store 单元测试：通过 mock service + 固定时间，验证缓存与初始化加载等关键行为。
vi.mock('@/service', () => ({
  commonService: {
    apiGetChampions: vi.fn(),
    apiGetAugments: vi.fn(),
    apiGetItems: vi.fn(),
  },
}))

import { commonService } from '@/service'
import { useLolStore } from '@/stores/lol'

const api = commonService as unknown as {
  apiGetChampions: ReturnType<typeof vi.fn>
  apiGetAugments: ReturnType<typeof vi.fn>
  apiGetItems: ReturnType<typeof vi.fn>
}

const CACHE_KEY = 'lol-cache-v2'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('useLolStore', () => {
  it('缓存命中时：会立刻 hydrate 并标记已初始化', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ts: Date.now(),
        champions: [{ key: '1' }],
        items: [{ _id: 'i1', riotId: '1001' }],
        augmentList: [{ id: 'a1' }],
      }),
    )

    const store = useLolStore()

    expect({
      championsLen: store.champions.length,
      itemsLen: store.items.length,
      augmentsLen: store.augmentList.length,
      isInitialized: store.isInitialized,
    }).toEqual({ championsLen: 1, itemsLen: 1, augmentsLen: 1, isInitialized: true })
  })

  it('缓存过期时：不会 hydrate（保持空数据）', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000_000)
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ts: Date.now() - 1000 * 60 * 60 * 24 * 8,
        champions: [{ key: '1' }],
        items: [{ _id: 'i1' }],
        augmentList: [{ id: 'a1' }],
      }),
    )

    const store = useLolStore()

    expect({
      championsLen: store.champions.length,
      itemsLen: store.items.length,
      augmentsLen: store.augmentList.length,
      isInitialized: store.isInitialized,
    }).toEqual({ championsLen: 0, itemsLen: 0, augmentsLen: 0, isInitialized: false })
  })

  it('initializeData：成功后会加载英雄与强化符文，并标记初始化完成', async () => {
    api.apiGetChampions.mockResolvedValueOnce({ data: { data: { champions: [{ key: '1' }, { key: '2' }] } } })
    api.apiGetAugments.mockResolvedValueOnce({ data: { data: { augments: [{ id: 'a1' }, null] } } })

    const store = useLolStore()
    await store.initializeData()

    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null')

    expect({
      isLoading: store.isLoading,
      isInitialized: store.isInitialized,
      championsLen: store.champions.length,
      augmentsLen: store.augmentList.length,
      cached: Boolean(cache?.ts) && Array.isArray(cache?.champions) && Array.isArray(cache?.augmentList),
    }).toEqual({
      isLoading: false,
      isInitialized: true,
      championsLen: 2,
      augmentsLen: 1,
      cached: true,
    })
  })

  it('initializeData(includeItems=true)：成功后也会加载装备列表', async () => {
    api.apiGetChampions.mockResolvedValueOnce({ data: { data: { champions: [{ key: '1' }] } } })
    api.apiGetAugments.mockResolvedValueOnce({ data: { data: [{ id: 'a1' }] } })
    api.apiGetItems.mockResolvedValueOnce({ data: { data: { items: [{ _id: 'i1', riotId: '1001' }] } } })

    const store = useLolStore()
    await store.initializeData({ includeItems: true })

    expect({
      isInitialized: store.isInitialized,
      championsLen: store.champions.length,
      itemsLen: store.items.length,
      augmentsLen: store.augmentList.length,
    }).toEqual({ isInitialized: true, championsLen: 1, itemsLen: 1, augmentsLen: 1 })
  })

  it('initializeData 并发调用时：只会发一次请求（英雄/强化符文各一次）', async () => {
    let resolveChampions: (value: any) => void = () => {}
    let resolveAugments: (value: any) => void = () => {}

    api.apiGetChampions.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolveChampions = r
        }),
    )
    api.apiGetAugments.mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolveAugments = r
        }),
    )

    const store = useLolStore()
    const p1 = store.initializeData()
    const p2 = store.initializeData()

    resolveChampions({ data: { data: { champions: [{ key: '1' }] } } })
    resolveAugments({ data: { data: [{ id: 'a1' }] } })
    await Promise.all([p1, p2])

    expect({
      championsCalls: api.apiGetChampions.mock.calls.length,
      augmentsCalls: api.apiGetAugments.mock.calls.length,
      isInitialized: store.isInitialized,
    }).toEqual({ championsCalls: 1, augmentsCalls: 1, isInitialized: true })
  })

  it('getItemById：同时支持通过 _id 与 riotId 查询', () => {
    const store = useLolStore()
    ;(store.items as any) = [{ _id: 'i1', riotId: '1001' }]

    expect({
      byId: store.getItemById('i1')?._id ?? null,
      byRiotId: store.getItemById('1001')?._id ?? null,
    }).toEqual({ byId: 'i1', byRiotId: 'i1' })
  })
})
