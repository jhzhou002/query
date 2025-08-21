const cors = require('cors');

// CORS配置
const corsOptions = {
  origin: function (origin, callback) {
    // 允许的源
    const allowedOrigins = [
      'http://localhost:8080',  // 本地开发前端
      'http://localhost:3000',  // 可能的其他本地端口
      'https://你的域名.com'     // 生产环境域名
    ];
    
    // 在开发环境中允许所有源
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // 允许携带凭证
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

module.exports = cors(corsOptions);