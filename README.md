# 问卷查询小程序系统

微信小程序端问卷查询系统，支持问卷编号查询、VIP会员功能、激活码管理等。

## 项目架构

### 前端
- **小程序端**: 微信小程序框架
- **管理后台**: Vue.js 3 + Element Plus + Vite

### 后端
- **服务端**: Node.js + Express.js
- **数据库**: MySQL 8.0
- **文件存储**: 七牛云对象存储

## 功能特性

### 小程序端
- 用户微信登录认证
- 问卷编号查询
- VIP会员权限管理
- 激活码使用
- 查询历史记录

### 管理后台
- 用户管理（查看用户列表、VIP状态）
- 问卷管理（添加、编辑、删除问卷信息）
- 激活码管理（生成、查看使用状态）
- 内容管理（轮播图、公告）
- 统计分析（平台统计、会员趋势）

## 技术栈

### 后端技术
- Node.js
- Express.js
- MySQL 8.0
- JWT认证
- 七牛云SDK
- Multer文件上传

### 前端技术
- Vue.js 3
- Composition API
- Element Plus
- Vite
- Vue Router
- 响应式设计

## 项目结构

```
query/
├── backend/                 # 后端代码
│   ├── config/              # 配置文件
│   │   ├── database.js      # 数据库配置
│   │   └── qiniu.js         # 七牛云配置
│   ├── controllers/         # 控制器
│   │   ├── adminController.js
│   │   ├── apiController.js
│   │   └── authController.js
│   ├── middleware/          # 中间件
│   │   ├── auth.js          # JWT认证中间件
│   │   ├── errorHandler.js  # 错误处理
│   │   └── upload.js        # 文件上传
│   ├── models/              # 数据模型
│   │   └── Database.js      # 数据库操作类
│   ├── routes/              # 路由
│   │   ├── admin.js         # 管理后台路由
│   │   ├── api.js           # API路由
│   │   └── auth.js          # 认证路由
│   ├── utils/               # 工具类
│   │   └── utils.js         # 通用工具函数
│   ├── app.js               # 应用入口
│   ├── package.json         # 依赖配置
│   └── .env                 # 环境变量
├── admin/                   # 管理后台
│   ├── public/              # 静态资源
│   ├── src/                 # 源代码
│   │   ├── components/      # 公共组件
│   │   ├── views/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   ├── App.vue          # 根组件
│   │   ├── main.js          # 入口文件
│   │   └── style.css        # 全局样式
│   ├── package.json         # 依赖配置
│   └── vite.config.js       # Vite配置
├── database/                # 数据库文件
│   └── init.sql             # 数据库初始化脚本
└── README.md                # 项目说明
```

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- MySQL >= 8.0
- npm >= 8.0.0

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../admin
npm install
```

### 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=questionnaire_query

# JWT密钥
JWT_SECRET=your_jwt_secret_key

# 服务端口
PORT=3000

# 七牛云配置
QINIU_ACCESS_KEY=nfxmZVGEHjkd8Rsn44S-JSynTBUUguTScil9dDvC
QINIU_SECRET_KEY=9lZjiRtRLL0U_MuYkcUZBAL16TlIJ8_dDSbTqqU2
QINIU_BUCKET=youxuan-images
QINIU_FOLDER=questionnaire/
```

### 数据库初始化

```bash
# 使用MySQL客户端执行初始化脚本
mysql -u root -p < database/init.sql
```

### 启动服务

```bash
# 启动后端服务
cd backend
npm start

# 启动前端开发服务器
cd ../admin
npm run dev
```

## API接口文档

### 认证接口

#### 管理员登录
```
POST /api/auth/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### 管理后台接口

#### 获取问卷列表
```
GET /api/admin/questionnaires?page=1&limit=20&platform=问卷星
Authorization: Bearer <token>
```

#### 添加问卷
```
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

#### 获取用户列表
```
GET /api/admin/users?page=1&limit=20&search=关键词
Authorization: Bearer <token>
```

#### 生成激活码
```
POST /api/admin/activation-codes/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "count": 10,
  "duration_days": 30,
  "description": "批量生成的激活码"
}
```

#### 上传轮播图
```
POST /api/admin/upload/carousel-image
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <图片文件>
```

### 小程序接口

#### 微信登录
```
POST /api/auth/wechat/login
Content-Type: application/json

{
  "code": "微信登录code",
  "userInfo": {
    "nickName": "用户昵称",
    "avatarUrl": "头像URL"
  }
}
```

#### 查询问卷
```
GET /api/questionnaires/search?q_number=Q001&platform=问卷星
Authorization: Bearer <token>
```

#### 使用激活码
```
POST /api/activation-codes/use
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "AC-2024-0821-1234"
}
```

## 数据库设计

### 主要数据表

#### users (用户表)
- `id`: 用户ID (主键)
- `openid`: 微信openid (唯一)
- `nick_name`: 用户昵称
- `avatar_url`: 头像URL
- `phone`: 手机号
- `is_vip`: VIP状态 (0-普通用户, 1-VIP用户)
- `vip_expiry_date`: VIP到期时间
- `created_at`: 创建时间
- `updated_at`: 更新时间

#### questionnaires (问卷表)
- `id`: 问卷ID (主键)
- `platform`: 问卷平台 (问卷星、腾讯问卷、金数据等)
- `q_number`: 问卷编号
- `reward_points`: 奖励积分
- `notes`: 筛选条件说明
- `created_at`: 创建时间
- `updated_at`: 更新时间

#### activation_codes (激活码表)
- `id`: 激活码ID (主键)
- `code`: 激活码
- `duration_days`: 有效天数
- `description`: 描述
- `status`: 状态 (0-未使用, 1-已使用)
- `used_by`: 使用者用户ID
- `used_at`: 使用时间
- `created_at`: 创建时间

#### query_history (查询历史表)
- `id`: 查询ID (主键)
- `user_id`: 用户ID
- `questionnaire_id`: 问卷ID
- `query_params`: 查询参数 (JSON)
- `result_data`: 查询结果 (JSON)
- `created_at`: 查询时间

## 部署说明

### 生产环境部署

#### 1. 服务器环境准备
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MySQL
sudo apt install mysql-server
sudo mysql_secure_installation

# 安装Nginx
sudo apt install nginx

# 安装PM2进程管理器
npm install -g pm2
```

#### 2. 数据库配置
```bash
# 登录MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE questionnaire_query CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'questionnaire_app'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON questionnaire_query.* TO 'questionnaire_app'@'localhost';
FLUSH PRIVILEGES;

# 导入数据库结构
mysql -u questionnaire_app -p questionnaire_query < database/init.sql
```

#### 3. 后端部署
```bash
# 克隆项目
git clone https://github.com/jhzhou002/query.git
cd query/backend

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
# 编辑.env文件设置生产环境配置

# 使用PM2启动
pm2 start app.js --name "questionnaire-backend"
pm2 startup
pm2 save
```

#### 4. 前端部署
```bash
cd ../admin

# 安装依赖
npm install

# 构建生产版本
npm run build

# 将dist目录部署到Nginx
sudo cp -r dist/* /var/www/html/questionnaire-admin/
```

#### 5. Nginx配置
```nginx
# /etc/nginx/sites-available/questionnaire
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/html/questionnaire-admin;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 6. 启用站点
```bash
sudo ln -s /etc/nginx/sites-available/questionnaire /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 微信小程序配置

#### 1. 小程序开发者工具配置
- 在微信公众平台申请小程序
- 获取AppID和AppSecret
- 配置服务器域名（request合法域名）

#### 2. 服务器域名配置
在微信公众平台后台设置：
- request合法域名：https://your-domain.com
- uploadFile合法域名：https://your-domain.com
- downloadFile合法域名：https://your-domain.com

## 性能优化

### 数据库优化
1. 根据查询模式创建适当的索引
2. 定期执行 `ANALYZE TABLE` 和 `OPTIMIZE TABLE`
3. 启用MySQL慢查询日志监控性能
4. 根据实际数据量调整MySQL配置参数

### 前端优化
1. 使用Vite的代码分割功能
2. 图片懒加载和压缩
3. 启用Gzip压缩
4. 使用CDN加速静态资源

### 后端优化
1. 使用连接池管理数据库连接
2. 实现接口缓存机制
3. 异步处理耗时操作
4. 使用集群模式部署

## 安全考虑

### 身份认证
- JWT Token过期时间设置
- 密码加密存储（bcrypt）
- 接口访问频率限制

### 数据安全
- SQL注入防护
- XSS攻击防护
- CSRF攻击防护
- 敏感信息脱敏处理

### 文件上传安全
- 文件类型限制
- 文件大小限制
- 文件内容检查
- 上传路径安全控制

## 监控与日志

### 日志记录
- 访问日志记录
- 错误日志记录
- 业务操作日志
- 性能监控日志

### 监控指标
- 接口响应时间
- 数据库查询性能
- 服务器资源使用率
- 用户行为统计

## 故障排除

### 常见问题

#### 数据库连接失败
```bash
# 检查MySQL服务状态
sudo systemctl status mysql

# 检查网络连接
telnet localhost 3306

# 查看MySQL错误日志
sudo tail -f /var/log/mysql/error.log
```

#### 前端页面无法访问
```bash
# 检查Nginx状态
sudo systemctl status nginx

# 检查Nginx配置
sudo nginx -t

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```

#### 后端服务异常
```bash
# 查看PM2进程状态
pm2 status

# 查看应用日志
pm2 logs questionnaire-backend

# 重启应用
pm2 restart questionnaire-backend
```

## 开发团队

- **项目负责人**: jhzhou002
- **邮箱**: 318352733@qq.com
- **GitHub**: https://github.com/jhzhou002/query

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

### v1.0.0 (2024-08-21)
- 初始版本发布
- 完成基础功能开发
- 支持微信小程序端和管理后台
- 集成七牛云图片存储
- 完善的权限管理系统