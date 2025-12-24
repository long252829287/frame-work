import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

// Counter store 单元测试：用最简单的 store 演示“状态变更 + 计算属性”的验证方式。
beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useCounterStore', () => {
  it('increment：会将 count +1', () => {
    const store = useCounterStore()
    store.increment()

    expect(store.count).toBe(1)
  })

  it('doubleCount：始终等于 count * 2', () => {
    const store = useCounterStore()
    store.increment()
    store.increment()

    expect({ count: store.count, doubleCount: store.doubleCount }).toEqual({ count: 2, doubleCount: 4 })
  })
})

