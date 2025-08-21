# 部署指南

## 环境要求

### 服务器要求
- 操作系统：Ubuntu 20.04 LTS 或 CentOS 7+
- CPU：2核心以上
- 内存：4GB以上
- 存储：20GB以上可用空间
- 网络：公网IP，带宽建议10Mbps以上

### 软件要求
- Node.js 16.x 或更高版本
- MySQL 8.0 或更高版本
- Nginx 1.18 或更高版本
- PM2 进程管理器

## 1. 服务器环境准备

### 1.1 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 1.2 安装 Node.js

```bash
# 使用 NodeSource 仓库安装 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

### 1.3 安装 MySQL

```bash
# Ubuntu/Debian
sudo apt install mysql-server mysql-client

# 启动并设置开机自启
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

### 1.4 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 安装 PM2

```bash
# 全局安装 PM2
sudo npm install -g pm2

# 设置 PM2 开机自启
pm2 startup
```

## 2. 数据库配置

### 2.1 创建数据库和用户

```bash
# 登录 MySQL
sudo mysql -u root -p

# 在 MySQL 命令行中执行
CREATE DATABASE questionnaire_query CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'questionnaire_app'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON questionnaire_query.* TO 'questionnaire_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2 导入数据库结构

```bash
# 下载项目代码后，在项目根目录执行
mysql -u questionnaire_app -p questionnaire_query < database/init.sql
```

### 2.3 MySQL 性能优化

编辑 MySQL 配置文件：

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

添加以下配置：

```ini
[mysqld]
# 基础配置
max_connections = 200
wait_timeout = 600
interactive_timeout = 600

# InnoDB 配置
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# 查询缓存
query_cache_type = 1
query_cache_size = 128M

# 字符集
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
```

重启 MySQL：

```bash
sudo systemctl restart mysql
```

## 3. 应用部署

### 3.1 克隆项目代码

```bash
# 克隆项目到服务器
git clone https://github.com/jhzhou002/query.git
cd query
```

### 3.2 后端部署

```bash
cd backend

# 安装依赖（生产环境）
npm install --production

# 创建环境变量文件
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=questionnaire_app
DB_PASSWORD=your_secure_password
DB_NAME=questionnaire_query

# JWT密钥（生成强密钥）
JWT_SECRET=your_very_secure_jwt_secret_key_here

# 服务端口
PORT=3000

# 七牛云配置
QINIU_ACCESS_KEY=nfxmZVGEHjkd8Rsn44S-JSynTBUUguTScil9dDvC
QINIU_SECRET_KEY=9lZjiRtRLL0U_MuYkcUZBAL16TlIJ8_dDSbTqqU2
QINIU_BUCKET=youxuan-images
QINIU_FOLDER=questionnaire/

# 微信小程序配置
WECHAT_APP_ID=your_wechat_app_id
WECHAT_APP_SECRET=your_wechat_app_secret
```

### 3.3 使用 PM2 启动后端服务

```bash
# 在 backend 目录下
pm2 start app.js --name questionnaire-backend

# 查看服务状态
pm2 status

# 查看日志
pm2 logs questionnaire-backend

# 保存 PM2 配置
pm2 save
```

### 3.4 前端部署

```bash
cd ../admin

# 安装依赖
npm install

# 构建生产版本
npm run build

# 创建网站目录
sudo mkdir -p /var/www/html/questionnaire-admin

# 复制构建文件到网站目录
sudo cp -r dist/* /var/www/html/questionnaire-admin/

# 设置权限
sudo chown -R www-data:www-data /var/www/html/questionnaire-admin
sudo chmod -R 755 /var/www/html/questionnaire-admin
```

## 4. Nginx 配置

### 4.1 创建网站配置文件

```bash
sudo nano /etc/nginx/sites-available/questionnaire
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名

    # 安全头设置
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 前端静态文件
    location / {
        root /var/www/html/questionnaire-admin;
        try_files $uri $uri/ /index.html;
        
        # 静态资源缓存
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 代理
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
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件大小限制
    client_max_body_size 10M;

    # 日志配置
    access_log /var/log/nginx/questionnaire.access.log;
    error_log /var/log/nginx/questionnaire.error.log;
}
```

### 4.2 启用网站配置

```bash
# 启用网站
sudo ln -s /etc/nginx/sites-available/questionnaire /etc/nginx/sites-enabled/

# 删除默认网站（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

## 5. SSL 证书配置（可选）

### 5.1 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 设置自动续期
sudo crontab -e
# 添加以下行：
0 12 * * * /usr/bin/certbot renew --quiet
```

### 5.2 手动配置 SSL（如有自己的证书）

编辑 Nginx 配置文件，添加 SSL 配置：

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 其他配置与 HTTP 相同...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 6. 防火墙配置

### 6.1 配置 UFW 防火墙（Ubuntu）

```bash
# 启用防火墙
sudo ufw enable

# 允许 SSH（重要！）
sudo ufw allow ssh

# 允许 HTTP 和 HTTPS
sudo ufw allow 'Nginx Full'

# 查看状态
sudo ufw status
```

### 6.2 配置 firewalld（CentOS）

```bash
# 启动防火墙
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 允许 HTTP 和 HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 重新加载配置
sudo firewall-cmd --reload
```

## 7. 监控和日志

### 7.1 设置日志轮转

创建日志轮转配置：

```bash
sudo nano /etc/logrotate.d/questionnaire
```

```
/var/log/nginx/questionnaire.*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### 7.2 监控脚本

创建服务监控脚本：

```bash
sudo nano /usr/local/bin/check-questionnaire.sh
```

```bash
#!/bin/bash

# 检查后端服务
if ! pm2 describe questionnaire-backend > /dev/null; then
    echo "后端服务已停止，正在重启..."
    pm2 restart questionnaire-backend
fi

# 检查 Nginx
if ! systemctl is-active --quiet nginx; then
    echo "Nginx 已停止，正在重启..."
    sudo systemctl restart nginx
fi

# 检查 MySQL
if ! systemctl is-active --quiet mysql; then
    echo "MySQL 已停止，正在重启..."
    sudo systemctl restart mysql
fi
```

设置执行权限并添加到定时任务：

```bash
sudo chmod +x /usr/local/bin/check-questionnaire.sh

# 添加到 crontab（每5分钟检查一次）
sudo crontab -e
# 添加：
*/5 * * * * /usr/local/bin/check-questionnaire.sh >> /var/log/questionnaire-check.log 2>&1
```

## 8. 备份策略

### 8.1 数据库备份脚本

```bash
sudo nano /usr/local/bin/backup-database.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/questionnaire"
DB_NAME="questionnaire_query"
DB_USER="questionnaire_app"
DB_PASSWORD="your_secure_password"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/questionnaire_$DATE.sql

# 压缩备份文件
gzip $BACKUP_DIR/questionnaire_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "questionnaire_*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: questionnaire_$DATE.sql.gz"
```

设置定时备份：

```bash
sudo chmod +x /usr/local/bin/backup-database.sh

# 每天凌晨2点备份
sudo crontab -e
# 添加：
0 2 * * * /usr/local/bin/backup-database.sh
```

### 8.2 代码备份

```bash
# 创建代码备份脚本
sudo nano /usr/local/bin/backup-code.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/questionnaire/code"
SOURCE_DIR="/path/to/query"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 打包代码文件
tar -czf $BACKUP_DIR/questionnaire_code_$DATE.tar.gz -C $SOURCE_DIR .

# 删除30天前的备份
find $BACKUP_DIR -name "questionnaire_code_*.tar.gz" -mtime +30 -delete

echo "代码备份完成: questionnaire_code_$DATE.tar.gz"
```

## 9. 性能优化

### 9.1 Node.js 应用优化

创建 PM2 配置文件：

```bash
nano /path/to/query/backend/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'questionnaire-backend',
    script: 'app.js',
    instances: 'max',  // 使用所有CPU核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/questionnaire-error.log',
    out_file: '/var/log/pm2/questionnaire-out.log',
    log_file: '/var/log/pm2/questionnaire-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

使用配置文件启动：

```bash
pm2 start ecosystem.config.js
```

### 9.2 系统级优化

编辑系统限制：

```bash
sudo nano /etc/security/limits.conf
```

添加：

```
www-data soft nofile 65535
www-data hard nofile 65535
```

编辑内核参数：

```bash
sudo nano /etc/sysctl.conf
```

添加：

```
# 网络优化
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_tw_buckets = 5000

# 文件系统优化
fs.file-max = 2097152
```

应用配置：

```bash
sudo sysctl -p
```

## 10. 故障排除

### 10.1 常见问题诊断

```bash
# 检查服务状态
sudo systemctl status nginx
sudo systemctl status mysql
pm2 status

# 查看日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/mysql/error.log
pm2 logs questionnaire-backend

# 检查端口占用
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000
sudo netstat -tlnp | grep :3306

# 检查磁盘空间
df -h

# 检查内存使用
free -h

# 检查进程
ps aux | grep node
ps aux | grep nginx
ps aux | grep mysql
```

### 10.2 应急恢复

如果服务异常，按以下步骤恢复：

```bash
# 1. 重启所有服务
pm2 restart questionnaire-backend
sudo systemctl restart nginx
sudo systemctl restart mysql

# 2. 如果仍有问题，检查配置
sudo nginx -t
pm2 describe questionnaire-backend

# 3. 恢复数据库备份（如需要）
mysql -u questionnaire_app -p questionnaire_query < /var/backups/questionnaire/questionnaire_YYYYMMDD_HHMMSS.sql

# 4. 重新部署代码（如需要）
cd /path/to/query
git pull origin main
cd backend && npm install --production
pm2 restart questionnaire-backend
```

## 11. 维护建议

### 11.1 定期维护任务

- **每日**：检查服务状态和日志
- **每周**：检查系统更新和安全补丁
- **每月**：检查磁盘空间，清理日志文件
- **每季度**：备份恢复测试，性能评估

### 11.2 监控指标

- 系统负载和CPU使用率
- 内存使用情况
- 磁盘空间使用率
- 网络流量
- 数据库连接数
- 应用响应时间
- 错误日志数量

通过以上配置，您就可以成功将问卷查询系统部署到生产环境中了。