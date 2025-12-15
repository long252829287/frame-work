# LOL 海克斯大乱斗：前端已接入的后端约定

本文档用于说明前端 `lol` 模块（二期“海克斯大乱斗”创建攻略页）对后端（Express + Mongo）接口/字段的依赖与建议。

## 1) 装备池（Items）

前端调用：

- `GET /api/items?mode=hex_brawl`

要求：

- 支持 query `mode`：`standard | hex_brawl`
- 返回结构保持与现有一致：`data.items: Item[]`
- Item 需要字段：`_id`, `name`, `plaintext`, `image`, `gold.total`, `gold.purchasable`

## 2) 强化池（Augments）

前端优先调用：

- `GET /api/augments?mode=hex_brawl&isActive=true&limit=200`

并做了兼容：

- 若后端暂时返回 `data` 为数组（旧实现），前端可正常解析
- 若后端按新文档返回 `data.augments`（带 `total`），前端也可正常解析

建议后端最终统一为：

- `data: { augments: Augment[]; total: number }`

Augment 需要字段：

- `augmentId`（业务唯一ID，字符串）
- `name`
- `description`
- `icon`（图片URL）
- `tier`（后端已统一为 `silver | gold | prismatic`，前端按该枚举分栏展示）
- `tags: string[]`
- `modes: string[]`（至少包含 `hex_brawl`）
- `isActive`（可选）

## 3) 创建攻略（Strategies）

前端在“海克斯大乱斗创建攻略页”提交：

- `POST /api/strategies`

payload 在现有字段基础上新增：

- `mode: 'hex_brawl'`
- `augmentIds: string[]`（存 `augmentId`）

兼容字段：

- 前端仍会传 `mapType: 'aram'`（避免旧后端必填校验失败），但希望后端以 `mode` 为准

其他字段：

- `title: string`（默认 `${championName} · 海克斯大乱斗`）
- `description: string`（备注输入框；若为空会填默认文案）
- `items: { itemId: string; position: number }[]`（0-5 常规，6-11 补充）
- `tags: ['hex_brawl']`（可选）

## 4) 需要确认/补齐的点（如果后端暂未实现）

- `/api/items` 是否已支持 `mode=hex_brawl` 并返回对应装备池
- `/api/augments` 是否已支持 query（`mode/search/tags/tier/isActive/limit/offset`）
- `Strategy` 模型/接口是否已支持 `mode`、`augmentIds`
- `tier` 的取值与前端“银/金/彩”三行映射（建议直接返回字符串枚举，前端最稳）
