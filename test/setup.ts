import { afterEach, vi } from 'vitest'

// 每个用例结束后清理全局状态，保证测试之间互不影响且可重复运行。
afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})
