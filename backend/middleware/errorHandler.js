// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('全局错误:', err);
  
  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      code: 400,
      msg: '数据重复，请检查输入',
      data: null
    });
  }
  
  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      msg: '无效的访问令牌',
      data: null
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      msg: '访问令牌已过期',
      data: null
    });
  }
  
  // 文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      code: 400,
      msg: '文件大小超出限制',
      data: null
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      code: 400,
      msg: '文件字段不匹配',
      data: null
    });
  }
  
  // 默认服务器错误
  res.status(500).json({
    code: 500,
    msg: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误',
    data: null
  });
};

module.exports = errorHandler;