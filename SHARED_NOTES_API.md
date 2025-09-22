# 多人共享笔记功能接口文档

## 概述
本文档描述了多人共享笔记功能所需的后端接口。此功能允许用户创建共享笔记本，邀请其他用户协作，并在四象限视图中管理笔记。

## 基础数据结构

### SharedNote（共享笔记本）
```typescript
interface SharedNote {
  _id: string              // 共享笔记本ID
  title: string            // 笔记本标题
  createdBy: string        // 创建者用户名
  participants: string[]   // 参与者用户名列表
  createdAt: string        // 创建时间 (ISO 8601)
  updatedAt: string        // 更新时间 (ISO 8601)
}
```

### SharedQuadrantNote（共享笔记项）
```typescript
interface SharedQuadrantNote {
  _id: string              // 笔记项ID
  title?: string           // 笔记标题（可选）
  content: string          // 笔记内容
  tags?: string[]          // 标签列表
  x_axis: number           // X轴坐标（-1, 0, 1）
  y_axis: number           // Y轴坐标（-1, 0, 1）
  order: number            // 在象限内的排序
  createdBy: string        // 创建者用户名
  sharedNoteId: string     // 所属共享笔记本ID
  color?: string           // 用户颜色（前端计算）
  createdAt?: string       // 创建时间
  updatedAt?: string       // 更新时间
}
```

### User（用户信息）
```typescript
interface User {
  _id: string              // 用户ID
  username: string         // 用户名
  nickname?: string        // 昵称
}
```

## 接口列表

### 1. 获取共享笔记本列表
**GET** `/api/shared-notes`

**描述**: 获取当前用户可访问的所有共享笔记本

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "notes": [
      {
        "_id": "64a1b2c3d4e5f6789012345",
        "title": "项目规划笔记",
        "createdBy": "alice",
        "participants": ["alice", "bob", "charlie"],
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-16T14:20:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### 2. 创建共享笔记本
**POST** `/api/shared-notes`

**描述**: 创建新的共享笔记本

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**请求体**:
```json
{
  "title": "新的共享笔记本",
  "participants": ["user1", "user2", "user3"]
}
```

**响应**:
```json
{
  "code": 200,
  "message": "共享笔记本创建成功",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "title": "新的共享笔记本",
    "createdBy": "current_user",
    "participants": ["current_user", "user1", "user2", "user3"],
    "createdAt": "2024-01-17T09:15:00.000Z",
    "updatedAt": "2024-01-17T09:15:00.000Z"
  }
}
```

### 3. 获取单个共享笔记本信息
**GET** `/api/shared-notes/:id`

**描述**: 获取指定共享笔记本的基本信息

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
- `id`: 共享笔记本ID

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "title": "项目规划笔记",
    "createdBy": "alice",
    "participants": ["alice", "bob", "charlie"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

### 4. 更新共享笔记本
**PUT** `/api/shared-notes/:id`

**描述**: 更新共享笔记本信息（仅创建者可操作）

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**路径参数**:
- `id`: 共享笔记本ID

**请求体**:
```json
{
  "title": "更新后的标题",
  "participants": ["alice", "bob", "david"]
}
```

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "_id": "64a1b2c3d4e5f6789012345",
    "title": "更新后的标题",
    "createdBy": "alice",
    "participants": ["alice", "bob", "david"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-17T11:45:00.000Z"
  }
}
```

### 5. 删除共享笔记本
**DELETE** `/api/shared-notes/:id`

**描述**: 删除共享笔记本（仅创建者可操作）

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
- `id`: 共享笔记本ID

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 6. 获取共享笔记本内的所有笔记项
**GET** `/api/shared-notes/:id/notes`

**描述**: 获取指定共享笔记本内的所有笔记项

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
- `id`: 共享笔记本ID

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "notes": [
      {
        "_id": "64a1b2c3d4e5f6789012347",
        "title": "任务1",
        "content": "完成用户界面设计",
        "tags": ["设计", "UI"],
        "x_axis": 1,
        "y_axis": 1,
        "order": 0,
        "createdBy": "alice",
        "sharedNoteId": "64a1b2c3d4e5f6789012345",
        "createdAt": "2024-01-15T11:00:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "count": 1
  }
}
```

### 7. 创建共享笔记项
**POST** `/api/shared-notes/:id/notes`

**描述**: 在指定共享笔记本中创建新的笔记项

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**路径参数**:
- `id`: 共享笔记本ID

**请求体**:
```json
{
  "title": "新任务",
  "content": "实现后端接口",
  "tags": ["开发", "后端"],
  "x_axis": 0,
  "y_axis": 0,
  "order": 0
}
```

**响应**:
```json
{
  "code": 200,
  "message": "笔记创建成功",
  "data": {
    "_id": "64a1b2c3d4e5f6789012348",
    "title": "新任务",
    "content": "实现后端接口",
    "tags": ["开发", "后端"],
    "x_axis": 0,
    "y_axis": 0,
    "order": 0,
    "createdBy": "current_user",
    "sharedNoteId": "64a1b2c3d4e5f6789012345",
    "createdAt": "2024-01-17T12:00:00.000Z",
    "updatedAt": "2024-01-17T12:00:00.000Z"
  }
}
```

### 8. 更新共享笔记项
**PUT** `/api/shared-notes/notes/:noteId`

**描述**: 更新指定的共享笔记项

**请求头**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**路径参数**:
- `noteId`: 笔记项ID

**请求体**:
```json
{
  "title": "更新的任务",
  "content": "完成接口开发和测试",
  "tags": ["开发", "后端", "测试"],
  "x_axis": 1,
  "y_axis": 1,
  "order": 1
}
```

**响应**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "_id": "64a1b2c3d4e5f6789012348",
    "title": "更新的任务",
    "content": "完成接口开发和测试",
    "tags": ["开发", "后端", "测试"],
    "x_axis": 1,
    "y_axis": 1,
    "order": 1,
    "createdBy": "current_user",
    "sharedNoteId": "64a1b2c3d4e5f6789012345",
    "createdAt": "2024-01-17T12:00:00.000Z",
    "updatedAt": "2024-01-17T13:30:00.000Z"
  }
}
```

### 9. 删除共享笔记项
**DELETE** `/api/shared-notes/notes/:noteId`

**描述**: 删除指定的共享笔记项（仅创建者可删除自己的笔记）

**请求头**:
```
Authorization: Bearer <token>
```

**路径参数**:
- `noteId`: 笔记项ID

**响应**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 10. 获取所有用户列表
**GET** `/api/users`

**描述**: 获取所有用户列表，用于选择共享笔记本的参与者

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "_id": "64a1b2c3d4e5f6789012349",
      "username": "alice",
      "nickname": "Alice Smith"
    },
    {
      "_id": "64a1b2c3d4e5f678901234a",
      "username": "bob",
      "nickname": "Bob Johnson"
    }
  ]
}
```

## 权限说明

### 共享笔记本权限
- **创建者**: 可以创建、编辑、删除共享笔记本，管理参与者
- **参与者**: 可以查看共享笔记本，创建、编辑、删除自己的笔记项
- **非参与者**: 无法访问共享笔记本

### 笔记项权限
- **创建者**: 可以编辑、删除自己创建的笔记项
- **其他参与者**: 可以查看所有笔记项，但只能编辑移动操作（拖拽到不同象限）

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如用户名已存在） |
| 500 | 服务器内部错误 |

## 实时同步建议

为了提供更好的协作体验，建议实现以下实时同步功能：

1. **WebSocket 连接**: 建立 WebSocket 连接来实时推送笔记变更
2. **变更通知**: 当其他用户创建、编辑、移动或删除笔记时，实时通知其他在线用户
3. **冲突处理**: 当多个用户同时编辑同一笔记时，采用最后写入胜利策略，并提示用户

### WebSocket 事件类型
```typescript
// 笔记创建事件
{
  type: 'note-created',
  data: SharedQuadrantNote,
  sharedNoteId: string,
  userId: string
}

// 笔记更新事件
{
  type: 'note-updated',
  data: SharedQuadrantNote,
  sharedNoteId: string,
  userId: string
}

// 笔记删除事件
{
  type: 'note-deleted',
  noteId: string,
  sharedNoteId: string,
  userId: string
}

// 用户加入/离开事件
{
  type: 'user-joined' | 'user-left',
  username: string,
  sharedNoteId: string
}
```

这套接口设计支持完整的多人共享笔记功能，包括笔记本管理、笔记项的增删改查、权限控制等核心需求。