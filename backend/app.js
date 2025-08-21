const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// 导入路由
const routes = require('./routes');

// 导入中间件
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');

// 创建Express应用
const app = express();

// 中间件配置
app.use(corsMiddleware);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// API路由
app.use('/api', routes);

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
========================================
  问卷查询小程序API服务已启动
  端口: ${PORT}
  环境: ${process.env.NODE_ENV || 'development'}
  时间: ${new Date().toISOString()}
========================================`);
});

module.exports = app;