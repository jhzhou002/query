const db = require('../config/database');

class CommonController {
  // 获取轮播图列表
  static async getCarousels(req, res) {
    try {
      const sql = `
        SELECT id, image_url, link, sort
        FROM carousels 
        WHERE status = 1
        ORDER BY sort ASC, created_at DESC
      `;
      
      const [rows] = await db.execute(sql);
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: {
          list: rows
        }
      });
      
    } catch (error) {
      console.error('获取轮播图错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取轮播图失败',
        data: null
      });
    }
  }
  
  // 获取公告列表
  static async getAnnouncements(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // 获取总数
      const countSql = `
        SELECT COUNT(*) as total 
        FROM announcements 
        WHERE status = 1
      `;
      const [countResult] = await db.execute(countSql);
      const total = countResult[0].total;
      
      // 获取公告列表
      const dataSql = `
        SELECT id, title, content, created_at
        FROM announcements 
        WHERE status = 1
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const [rows] = await db.execute(dataSql, [parseInt(limit), offset]);
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: {
          list: rows,
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
      
    } catch (error) {
      console.error('获取公告错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取公告失败',
        data: null
      });
    }
  }
  
  // 获取公告详情
  static async getAnnouncementDetail(req, res) {
    try {
      const { id } = req.params;
      
      const sql = `
        SELECT id, title, content, created_at
        FROM announcements 
        WHERE id = ? AND status = 1
      `;
      
      const [rows] = await db.execute(sql, [id]);
      
      if (rows.length === 0) {
        return res.status(404).json({
          code: 404,
          msg: '公告不存在',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: rows[0]
      });
      
    } catch (error) {
      console.error('获取公告详情错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取公告详情失败',
        data: null
      });
    }
  }
  
  // 获取支持的平台列表
  static async getPlatforms(req, res) {
    try {
      const platforms = [
        { name: '问卷星', value: '问卷星', description: '专业的问卷调研平台' },
        { name: '腾讯问卷', value: '腾讯问卷', description: '腾讯旗下问卷调研工具' },
        { name: '金数据', value: '金数据', description: '表单数据收集平台' }
      ];
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: {
          list: platforms
        }
      });
      
    } catch (error) {
      console.error('获取平台列表错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取平台列表失败',
        data: null
      });
    }
  }
  
  // 健康检查
  static async healthCheck(req, res) {
    try {
      // 检查数据库连接
      await db.execute('SELECT 1');
      
      res.json({
        code: 200,
        msg: '服务正常',
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      });
      
    } catch (error) {
      console.error('健康检查失败:', error);
      res.status(500).json({
        code: 500,
        msg: '服务异常',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      });
    }
  }
}

module.exports = CommonController;