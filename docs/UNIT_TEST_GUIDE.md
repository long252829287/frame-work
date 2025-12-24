# 本项目单元测试指南（零基础版）

本文档面向“从没写过单元测试”的同学，目标是让你在这个项目里能独立完成：选测试点 → 写出可重复运行的测试 → 在改代码时用测试守住行为。

## 1. 先搞清楚：什么是单元测试？为什么要做？

### 1.1 单元测试在这里指什么

在本项目里，“单元测试”主要指对以下内容做快速、稳定、可重复的验证：

- `Pinia store` 的业务逻辑（例如登录状态、localStorage 持久化）
- `utils` 里的纯函数（输入→输出）
- 少量“逻辑为主”的组件行为（不依赖真实后端、不依赖真实浏览器交互）

它**不**包含：

- 真实后端接口联调（那更像集成测试/E2E）
- 打开浏览器点来点去（那更像 Playwright/Cypress 的 E2E）

### 1.2 为什么要做（对你有什么直接好处）

- **防回归**：今天修了 A，明天改了 B，不小心又把 A 弄坏，单元测试能第一时间报警。
- **让重构更安全**：你可以大胆优化代码结构，只要测试还绿，就说明关键行为没变。
- **把需求变成可验证的规则**：测试本质是“这段代码应该怎么表现”的说明书，而且是可执行的。
- **提升健壮性**：通过测试覆盖错误分支/边界输入（例如非法 JSON、缺字段、网络失败等）。

## 2. 本项目的测试工具与目录约定

### 2.1 使用的工具

- 测试运行器：Vitest（类似 Jest，但和 Vite 生态更贴合）
- 运行环境：JSDOM（在 Node 里模拟浏览器 API，例如 `localStorage`）
- Vue/Pinia 测试：`@vue/test-utils`（本项目已安装，后续需要测组件时用）

对应配置文件：`vitest.config.ts`

### 2.2 目录与命名

- 测试代码目录：`test/`
- 单元测试目录：`test/unit/`
- 测试文件命名：以 `.test.ts` 结尾，例如 `auth.store.test.ts`

你可以把测试按模块拆开：

- `test/unit/auth.store.test.ts`：测试认证 store
- `test/unit/router.guard.test.ts`：测试路由守卫（如果你要补）
- `test/unit/utils/*.test.ts`：测试各种纯函数

## 3. 你需要会的三个命令

在项目根目录执行：

- 运行所有单测（一次性）：`pnpm test`
- 监听模式（写测试时更舒服）：`pnpm test:watch`
- 查看覆盖率（了解哪些代码还没测到）：`pnpm test:coverage`

## 4. 写单元测试的标准流程（推荐照做）

### 4.1 选测试点：从“业务风险高”开始

优先测这些：

- 登录/鉴权/权限跳转（错了就用不了）
- 数据持久化（localStorage、缓存）
- 容错分支（缺字段、异常输入、网络失败）

在本项目里，一个很好的起点就是 `src/stores/auth.ts`，因为它：

- 有明显的状态变更（token/user）
- 有持久化逻辑（localStorage）
- 有错误分支（非法 JSON、缺 token、logout 失败）

### 4.2 写测试用例的结构：Arrange → Act → Assert

每个测试建议固定结构：

1) Arrange：准备数据/依赖（例如设置 localStorage、mock 接口返回）  
2) Act：调用你要测试的函数  
3) Assert：断言结果（推荐“一个测试一个断言”，必要时用对象聚合成一次断言）

### 4.3 让测试可重复：不要依赖真实网络/真实时间/真实随机数

单测里常见的“让你测试不稳定”的来源：

- 真实网络请求：今天快明天慢，甚至后端挂了
- `Date.now()`：每次运行值都不一样
- `Math.random()`：随机导致断言不稳定

解决方式：

- 把网络请求都 mock 掉
- 用假时间/固定值（Vitest 支持 fake timers）
- 把随机数注入成依赖或 mock

## 5. 本项目最常见的两类单元测试怎么写

### 5.1 测 Pinia store（推荐从这里开始）

看现成例子：`test/unit/auth.store.test.ts`

关键点有 3 个：

1) **每个用例都创建一个新的 Pinia**，避免状态串台：

```ts
import { createPinia, setActivePinia } from 'pinia'

setActivePinia(createPinia())
```

2) **清理 localStorage**，避免用例之间互相影响（本项目已在 `test/setup.ts` 做了全局清理）。

3) **mock 掉 service 层**，保证不发真实请求：

```ts
import { vi } from 'vitest'

vi.mock('@/service', () => ({
  commonService: {
    apiLogin: vi.fn(),
    apiLogout: vi.fn(),
  },
}))
```

为什么这么做：

- store 的职责是“管理状态与业务规则”，不是“测试后端是否真的可用”
- service 层的网络波动会让测试不稳定，单测应该做到“只测你这段代码的行为”

### 5.2 测纯函数（最简单、性价比最高）

如果你在 `src/utils` 里写了类似：

```ts
export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}
```

那测试通常就长这样：

```ts
import { describe, it, expect } from 'vitest'
import { clamp } from '@/utils/xxx'

describe('clamp', () => {
  it('当输入小于最小值时返回最小值', () => {
    expect(clamp(-1, 0, 10)).toBe(0)
  })
})
```

为什么建议多写纯函数：

- 纯函数没有副作用，测试最稳定
- 一旦逻辑复杂化，纯函数比写在组件里更容易复用和验证

## 6. 如何判断“测得对不对”

### 6.1 你应该断言“行为”，而不是“实现细节”

好断言（行为）：

- 调用 `login()` 后 token 应该被保存
- localStorage 里应该出现某个 key

坏断言（实现细节）：

- 必须调用了某个内部私有函数
- 必须按某种具体顺序 set 某个 ref（这种在重构时很容易变）

### 6.2 为什么推荐“一个测试一个断言”

当一个测试里塞了很多断言：

- 失败时你要花更多时间定位“到底是哪条规则坏了”
- 用例表达也更不清晰

本项目做法：

- 能拆就拆成多个 `it(...)`
- 必须同时验证多个结果时，用对象聚合成一次 `expect(...).toEqual(...)`

## 7. 下一步：你可以继续补哪些测试（建议顺序）

1) `src/router/index.ts` 的路由守卫：未登录访问需要鉴权页面应跳转到登录页并带 redirect
2) `src/service/fetch.ts` 的登录过期处理：建议先做小步重构（引入依赖注入）再补测试
3) 关键页面的“逻辑为主”组件测试：例如登录页表单提交的成功/失败提示（这部分需要引入组件挂载与 DOM 断言）

## 8. 常见问题（FAQ）

### Q1：测试是不是越多越好？

不是。优先保证“关键路径+高风险逻辑”被覆盖，测试要能稳定运行、维护成本低。

### Q2：我写测试会不会拖慢开发？

一开始会，但当需求变多、重构变频繁时，测试能显著减少回归与线上排查时间。

### Q3：我应该从哪里开始写第一个测试？

从 `src/stores/auth.ts` 开始最合适；你也可以直接仿照 `test/unit/auth.store.test.ts` 的写法复制一个新文件。

