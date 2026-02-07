# 情侣游戏 API 文档

## 基础信息
- 基础路径: `/couple-game`
- 需要认证的接口需要在请求头中携带 `Authorization: Bearer {token}`

---

## 1. 创建游戏作品

**接口**: `POST /create`

**需要认证**: 是

**请求参数**:
```json
{
  "title": "明明哦您",
  "description": "红红红火火恍恍惚惚",
  "steps": ["明敏", "明敏", "红红红", "红红红", "婆婆婆", "1明明"]
}
```

**参数说明**:
- `title`: 标题，1-100个字符
- `description`: 描述，1-500个字符
- `steps`: 步骤数组，1-50个步骤，每个步骤最多200个字符

**返回示例**:
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "gameId": 1001,
    "title": "明明哦您",
    "description": "红红红火火恍恍惚惚",
    "steps": ["明敏", "明敏", "红红红", "红红红", "婆婆婆", "1明明"],
    "status": "draft",
    "createdAt": "2025-11-01T10:00:00.000Z"
  }
}
```

---

## 2. 发布作品到社区

**接口**: `POST /publish`

**需要认证**: 是

**请求参数**:
```json
{
  "gameId": 1001
}
```

**返回示例**:
```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "gameId": 1001,
    "postId": 2001,
    "status": "published",
    "publishedAt": "2025-11-01T10:05:00.000Z"
  }
}
```

---

## 3. 获取我的创作列表

**接口**: `GET /my-creations`

**需要认证**: 是

**查询参数**:
- `page`: 页码，默认1
- `pageSize`: 每页数量，默认10
- `status`: 状态筛选，可选值：`draft`(草稿)、`published`(已发布)

**返回示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "gameId": 1001,
        "title": "明明哦您",
        "description": "红红红火火恍恍惚惚",
        "steps": ["明敏", "明敏", "红红红", "红红红", "婆婆婆", "1明明"],
        "status": "published",
        "createdAt": "2025-11-01T10:00:00.000Z",
        "publishedAt": "2025-11-01T10:05:00.000Z",
        "addedCount": 10,
        "viewCount": 100,
        "likeCount": 20
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## 4. 获取社区动态列表

**接口**: `GET /community/posts`

**需要认证**: 否（登录后会返回点赞、收藏状态）

**查询参数**:
- `page`: 页码，默认1
- `pageSize`: 每页数量，默认10
- `sort`: 排序方式
  - `latest`: 最新发布（默认，置顶的会优先显示）
  - `hot`: 热门（按点赞数排序）
  - `popular`: 流行（按被添加次数排序）

**返回示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "postId": 2001,
        "gameId": 1001,
        "creatorId": 10001,
        "title": "明明哦您",
        "description": "红红红火火恍恍惚惚",
        "steps": ["明敏", "明敏", "红红红", "红红红", "婆婆婆", "1明明"],
        "publishedAt": "2025-11-01T10:05:00.000Z",
        "likeCount": 20,
        "viewCount": 100,
        "addedCount": 10,
        "commentCount": 5,
        "isPinned": false,
        "creator": {
          "userId": 10001,
          "account": "user@example.com",
          "name": "用户名",
          "avatar": "https://example.com/avatar.jpg"
        },
        "isLiked": false,
        "isCollected": false
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## 5. 添加游戏玩法到收藏

**接口**: `POST /add-to-collection`

**需要认证**: 是

**请求参数**:
```json
{
  "gameId": 1001
}
```

**说明**: 
- 只能添加已发布的游戏
- 不能重复添加同一个游戏
- 添加成功后会增加游戏和社区动态的`addedCount`计数

**返回示例**:
```json
{
  "code": 200,
  "message": "添加成功"
}
```

---

## 6. 获取我的收藏列表

**接口**: `GET /my-collections`

**需要认证**: 是

**查询参数**:
- `page`: 页码，默认1
- `pageSize`: 每页数量，默认10

**返回示例**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "userId": 10001,
        "gameId": 1001,
        "addedAt": "2025-11-01T10:10:00.000Z",
        "isOwn": false,
        "game": {
          "gameId": 1001,
          "title": "明明哦您",
          "description": "红红红火火恍恍惚惚",
          "steps": ["明敏", "明敏", "红红红", "红红红", "婆婆婆", "1明明"],
          "status": "published",
          "addedCount": 10,
          "viewCount": 100,
          "likeCount": 20,
          "creator": {
            "userId": 10002,
            "account": "creator@example.com",
            "name": "创作者",
            "avatar": "https://example.com/avatar2.jpg"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## 7. 从收藏中移除

**接口**: `POST /remove-from-collection`

**需要认证**: 是

**请求参数**:
```json
{
  "gameId": 1001
}
```

**说明**: 
- 不能移除自己创作的作品（自己创作的会自动添加到收藏，但不能移除）
- 移除成功后会减少游戏和社区动态的`addedCount`计数

**返回示例**:
```json
{
  "code": 200,
  "message": "移除成功"
}
```

---

## 8. 点赞/取消点赞社区动态

**接口**: `POST /community/toggle-like`

**需要认证**: 是

**请求参数**:
```json
{
  "postId": 2001
}
```

**说明**: 
- 如果未点赞则点赞，如果已点赞则取消点赞
- 点赞状态会同步更新到关联的游戏作品

**返回示例**:
```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "isLiked": true,
    "likeCount": 21
  }
}
```

---

## 9. 获取游戏详情

**接口**: `GET /:gameId`

**需要认证**: 否（登录后会返回收藏状态）

**返回示例**:
```json
{
  "code": 200,
  "data": {
    "gameId": 1001,
    "creatorId": 10001,
    "title": "明明哦您",
    "description": "红红红火火恍恍惚惚",
    "steps": ["明敏", "明敏", "红红红", "红红红", "婆婆婆", "1明明"],
    "status": "published",
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-01T10:05:00.000Z",
    "publishedAt": "2025-11-01T10:05:00.000Z",
    "addedCount": 10,
    "viewCount": 101,
    "likeCount": 20,
    "creator": {
      "userId": 10001,
      "account": "user@example.com",
      "name": "用户名",
      "avatar": "https://example.com/avatar.jpg"
    },
    "isCollected": false
  }
}
```

---

## 10. 更新作品

**接口**: `PUT /:gameId`

**需要认证**: 是

**说明**: 
- 只能更新自己创作的作品
- 只能更新草稿状态的作品（已发布的不能修改）

**请求参数**:
```json
{
  "title": "新标题",
  "description": "新描述",
  "steps": ["新步骤1", "新步骤2"]
}
```

**返回示例**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "gameId": 1001,
    "title": "新标题",
    "description": "新描述",
    "steps": ["新步骤1", "新步骤2"],
    "updatedAt": "2025-11-01T11:00:00.000Z"
  }
}
```

---

## 11. 删除作品

**接口**: `DELETE /:gameId`

**需要认证**: 是

**说明**: 
- 只能删除自己创作的作品
- 删除后会同时删除相关的社区动态和所有用户的收藏记录

**返回示例**:
```json
{
  "code": 200,
  "message": "删除成功"
}
```

---

## 使用流程示例

### 完整的创建和发布流程：

1. **创建作品**（草稿状态）
```bash
POST /maintc/v1/couple-game/create
{
  "title": "明明哦您",
  "description": "红红红火火恍恍惚惚",
  "steps": ["明敏", "明敏", "红红红", "红红红", "婆婆婆", "1明明"]
}
```

2. **查看我的创作**
```bash
GET /maintc/v1/couple-game/my-creations?status=draft
```

3. **确认发布到社区**
```bash
POST /maintc/v1/couple-game/publish
{
  "gameId": 1001
}
```

4. **在社区动态中查看**
```bash
GET /maintc/v1/couple-game/community/posts?sort=latest
```

5. **其他用户添加该玩法**
```bash
POST /maintc/v1/couple-game/add-to-collection
{
  "gameId": 1001
}
```

---

## 错误码说明

所有接口返回的错误格式：
```json
{
  "code": 错误码,
  "message": "错误描述"
}
```

常见错误码：
- `400`: 参数错误
- `401`: 未登录或token失效
- `403`: 无权限操作
- `404`: 资源不存在
- `500`: 服务器错误

