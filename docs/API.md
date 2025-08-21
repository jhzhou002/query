# API接口文档

## 基础信息

- 基础URL：`http://localhost:3000/api`
- 认证方式：JWT Bearer Token
- 请求格式：JSON
- 响应格式：JSON

## 响应结构

所有API响应都遵循统一格式：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    // 具体数据
  }
}
```

## 状态码说明

- `200`：操作成功
- `400`：请求参数错误
- `401`：未授权，需要登录
- `403`：权限不足
- `404`：资源不存在
- `500`：服务器内部错误

## 认证接口

### 管理员登录

```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400
  }
}
```

### 微信登录

```http
POST /api/auth/wechat/login
Content-Type: application/json

{
  "code": "微信登录授权码",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL"
  }
}
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nick_name": "用户昵称",
      "is_vip": false,
      "vip_expiry_date": null
    }
  }
}
```

## 管理后台接口

### 问卷管理

#### 获取问卷列表

```http
GET /api/admin/questionnaires?page=1&limit=20&platform=问卷星&q_number=Q001
Authorization: Bearer <token>
```

**查询参数：**
- `page`：页码（默认1）
- `limit`：每页数量（默认20）
- `platform`：平台名称（可选）
- `q_number`：问卷编号（可选）

**响应示例：**
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "platform": "问卷星",
        "q_number": "Q001",
        "reward_points": 10,
        "notes": "年龄：18-35岁，职业：学生、白领",
        "created_at": "2024-08-21 10:00:00",
        "updated_at": "2024-08-21 10:00:00"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

#### 添加问卷

```http
POST /api/admin/questionnaires
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "问卷星",
  "q_number": "Q001",
  "reward_points": 10,
  "notes": "筛选条件说明"
}
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "添加成功",
  "data": {
    "id": 1,
    "platform": "问卷星",
    "q_number": "Q001",
    "reward_points": 10,
    "notes": "筛选条件说明"
  }
}
```

#### 更新问卷

```http
PUT /api/admin/questionnaires/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "问卷星",
  "q_number": "Q001",
  "reward_points": 15,
  "notes": "更新后的筛选条件说明"
}
```

#### 删除问卷

```http
DELETE /api/admin/questionnaires/{id}
Authorization: Bearer <token>
```

### 用户管理

#### 获取用户列表

```http
GET /api/admin/users?page=1&limit=20&search=关键词
Authorization: Bearer <token>
```

**查询参数：**
- `page`：页码（默认1）
- `limit`：每页数量（默认20）
- `search`：搜索关键词（可选，搜索昵称或手机号）

**响应示例：**
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "list": [
      {
        "id": 1,
        "nick_name": "用户昵称",
        "phone": "13800138000",
        "is_vip": 1,
        "vip_expiry_date": "2024-12-31 23:59:59",
        "created_at": "2024-08-21 10:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### 激活码管理

#### 获取激活码列表

```http
GET /api/admin/activation-codes?page=1&limit=20&status=0
Authorization: Bearer <token>
```

**查询参数：**
- `page`：页码（默认1）
- `limit`：每页数量（默认20）
- `status`：状态筛选（0-未使用，1-已使用，可选）

#### 生成激活码

```http
POST /api/admin/activation-codes/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 10,
  "duration_days": 30,
  "description": "批量生成的激活码"
}
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "生成成功",
  "data": {
    "generated_count": 10,
    "codes": [
      "AC-2024-0821-1234",
      "AC-2024-0821-5678"
    ]
  }
}
```

### 内容管理

#### 获取轮播图列表

```http
GET /api/admin/carousels?page=1&limit=20
Authorization: Bearer <token>
```

#### 添加轮播图

```http
POST /api/admin/carousels
Authorization: Bearer <token>
Content-Type: application/json

{
  "image_url": "https://example.com/image.jpg",
  "link": "https://example.com",
  "sort": 1,
  "status": 1
}
```

#### 上传轮播图

```http
POST /api/admin/upload/carousel-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <图片文件>
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "上传成功",
  "data": {
    "url": "https://youxuan-images.oss-cn-hangzhou.aliyuncs.com/questionnaire/carousel_20240821_123456.jpg"
  }
}
```

#### 获取公告列表

```http
GET /api/admin/announcements?page=1&limit=20
Authorization: Bearer <token>
```

#### 添加公告

```http
POST /api/admin/announcements
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "公告标题",
  "content": "公告内容",
  "status": 1
}
```

### 统计分析

#### 获取平台统计

```http
GET /api/admin/platform/stats
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "list": [
      {
        "platform": "问卷星",
        "count": 25,
        "avg_points": 12.5,
        "min_points": 8,
        "max_points": 20
      }
    ]
  }
}
```

#### 获取会员统计

```http
GET /api/admin/member/stats
Authorization: Bearer <token>
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": {
    "list": [
      {
        "date": "2024-08-21",
        "new_users": 15,
        "new_vips": 3
      }
    ]
  }
}
```

## 小程序端接口

### 问卷查询

#### 搜索问卷

```http
GET /api/questionnaires/search?q_number=Q001&platform=问卷星
Authorization: Bearer <token>
```

**查询参数：**
- `q_number`：问卷编号（必需）
- `platform`：平台名称（可选）

**响应示例：**
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": [
    {
      "id": 1,
      "platform": "问卷星",
      "q_number": "Q001",
      "reward_points": 10,
      "notes": "年龄：18-35岁，职业：学生、白领"
    }
  ]
}
```

#### 获取查询历史

```http
GET /api/query/history?page=1&limit=20
Authorization: Bearer <token>
```

### 激活码功能

#### 使用激活码

```http
POST /api/activation-codes/use
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "AC-2024-0821-1234"
}
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "激活成功",
  "data": {
    "duration_days": 30,
    "vip_expiry_date": "2024-09-20 10:00:00"
  }
}
```

### 内容获取

#### 获取轮播图

```http
GET /api/carousels
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "image_url": "https://example.com/image.jpg",
      "link": "https://example.com",
      "sort": 1
    }
  ]
}
```

#### 获取公告

```http
GET /api/announcements
```

**响应示例：**
```json
{
  "code": 200,
  "msg": "获取成功",
  "data": [
    {
      "id": 1,
      "title": "系统上线通知",
      "content": "问卷查询系统正式上线，欢迎大家使用！",
      "created_at": "2024-08-21 10:00:00"
    }
  ]
}
```

## 错误处理

### 常见错误响应

#### 参数错误
```json
{
  "code": 400,
  "msg": "参数错误：问卷编号不能为空",
  "data": null
}
```

#### 未授权
```json
{
  "code": 401,
  "msg": "未授权，请先登录",
  "data": null
}
```

#### 权限不足
```json
{
  "code": 403,
  "msg": "权限不足，仅VIP用户可查看详细信息",
  "data": null
}
```

#### 资源不存在
```json
{
  "code": 404,
  "msg": "问卷不存在",
  "data": null
}
```

#### 服务器错误
```json
{
  "code": 500,
  "msg": "服务器内部错误",
  "data": null
}
```

## 请求示例

### JavaScript (fetch)

```javascript
// 登录
const loginResponse = await fetch('/api/auth/admin/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// 获取问卷列表
const questionnairesResponse = await fetch('/api/admin/questionnaires?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const questionnairesData = await questionnairesResponse.json();
```

### curl

```bash
# 登录
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取问卷列表
curl -X GET "http://localhost:3000/api/admin/questionnaires?page=1&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 添加问卷
curl -X POST http://localhost:3000/api/admin/questionnaires \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"platform":"问卷星","q_number":"Q001","reward_points":10,"notes":"筛选条件"}'
```

## 数据模型

### User (用户)
```typescript
interface User {
  id: number;
  openid: string;
  nick_name: string;
  avatar_url: string;
  phone: string;
  is_vip: boolean;
  vip_expiry_date: string | null;
  created_at: string;
  updated_at: string;
}
```

### Questionnaire (问卷)
```typescript
interface Questionnaire {
  id: number;
  platform: string;
  q_number: string;
  reward_points: number;
  notes: string;
  created_at: string;
  updated_at: string;
}
```

### ActivationCode (激活码)
```typescript
interface ActivationCode {
  id: number;
  code: string;
  duration_days: number;
  description: string;
  status: number; // 0-未使用, 1-已使用
  used_by: number | null;
  used_at: string | null;
  created_at: string;
}
```

### Carousel (轮播图)
```typescript
interface Carousel {
  id: number;
  image_url: string;
  link: string;
  sort: number;
  status: number; // 0-禁用, 1-启用
  created_at: string;
  updated_at: string;
}
```

### Announcement (公告)
```typescript
interface Announcement {
  id: number;
  title: string;
  content: string;
  status: number; // 0-禁用, 1-启用
  created_at: string;
  updated_at: string;
}
```