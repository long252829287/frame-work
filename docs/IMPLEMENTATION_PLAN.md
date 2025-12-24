## Stage 1: 单元测试基础设施

**目标**：为当前 Vite + Vue 3 + TS 项目接入可运行的单元测试框架。
**验收标准**：本地/CI 执行 `pnpm test` 输出稳定、可重复。
**测试用例**：`test/unit/smoke.test.ts` 用于验证测试运行器可用。
**状态**：完成

## Stage 2: 认证 Store 单元测试

**目标**：覆盖认证相关核心状态流转与 `localStorage` 持久化行为。
**验收标准**：认证 store 的成功/失败分支都有明确的可重复验证。
**测试用例**：
- `useAuthStore().setToken()` 写入/清理 token 行为正确。
- `useAuthStore().setUser()` 写入/清理 user 行为正确。
- `useAuthStore().checkAuth()` 能容忍非法 JSON，并返回正确布尔值。
- `useAuthStore().login()` 兼容多种后端返回结构，缺少 token 时抛错。
- `useAuthStore().logout()` 即使 API 失败也会清理本地状态。
**状态**：完成

## Stage 3: 覆盖副作用逻辑（下一步）

**目标**：让 HTTP/登录过期处理逻辑可测试并补齐覆盖。
**验收标准**：不启动完整应用也能单测验证“注入 token”和“登录过期处理”。
**测试用例**：待对 `src/service/fetch.ts` 引入依赖注入后补充。
**状态**：未开始

## Stage 4: 单元测试文档（零基础）

**目标**：为未接触过单元测试的同学提供“怎么做/为什么这么做/可照抄模板”的项目指南。
**验收标准**：阅读 `docs/UNIT_TEST_GUIDE.md` 后可以独立新增一个 store 或 utils 的单测，并能通过 `pnpm test`。
**测试用例**：不新增用例（文档阶段）。
**状态**：完成

## Stage 5: 路由守卫单元测试

**目标**：覆盖“未登录拦截/已登录跳转/正常放行”等关键分支。
**验收标准**：不依赖真实路由实例也能稳定验证守卫行为。
**测试用例**：`test/unit/router.guard.test.ts`
**状态**：完成

## Stage 6: HTTP 封装单元测试

**目标**：验证请求自动携带 token、登录过期触发处理逻辑且返回明确错误。
**验收标准**：不依赖真实网络，通过自定义 adapter 稳定复现分支。
**测试用例**：`test/unit/service.fetch.test.ts`
**状态**：完成

## Stage 7: LoL Store 单元测试

**目标**：覆盖缓存命中/过期、初始化加载、并发去重、查询方法等核心行为。
**验收标准**：在 mock service + 固定时间下测试稳定可重复。
**测试用例**：`test/unit/lol.store.test.ts`
**状态**：完成

## Stage 8: Counter Store 单元测试

**目标**：覆盖最基础 store 行为，作为简单示例。
**验收标准**：`increment` 与 `doubleCount` 行为明确。
**测试用例**：`test/unit/counter.store.test.ts`
**状态**：完成
