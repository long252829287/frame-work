import { describe, it, expect } from 'vitest'

// 烟雾测试：用于确认测试运行器与环境配置可用。
describe('测试运行器', () => {
  it('可以执行最基础断言', () => {
    expect(1 + 1).toBe(2)
  })
})
