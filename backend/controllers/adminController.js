const db = require('../config/database');
const User = require('../models/User');
const Questionnaire = require('../models/Questionnaire');
const ActivationCode = require('../models/ActivationCode');
const QueryHistory = require('../models/QueryHistory');
const { uploadToQiniu, generateFileName } = require('../config/qiniu');

class AdminController {
  // 管理员登录
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // 简单验证（生产环境应该使用数据库和加密密码）
      if (username === 'admin' && password === 'admin123') {
        res.json({
          code: 200,
          msg: '登录成功',
          data: {
            token: 'admin_token_' + Date.now(),
            user: {
              username: 'admin',
              role: 'administrator'
            }
          }
        });
      } else {
        res.status(401).json({
          code: 401,
          msg: '用户名或密码错误',
          data: null
        });
      }
    } catch (error) {
      console.error('管理员登录错误:', error);
      res.status(500).json({
        code: 500,
        msg: '登录失败',
        data: null
      });
    }
  }
  
  // 获取仪表板统计
  static async getDashboardStats(req, res) {
    try {
      const stats = {};
      
      // 用户统计
      const [userStats] = await db.execute(`
        SELECT 
          COUNT(*) as total_users,
          SUM(CASE WHEN is_vip = 1 THEN 1 ELSE 0 END) as vip_users,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_users
        FROM users
      `);
      stats.users = userStats[0];
      
      // 问卷统计
      const [questionnaireStats] = await db.execute(`
        SELECT COUNT(*) as total_questionnaires FROM questionnaires
      `);
      stats.questionnaires = questionnaireStats[0];
      
      // 查询统计
      const [queryStats] = await db.execute(`
        SELECT 
          COUNT(*) as total_queries,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_queries
        FROM query_history
      `);
      stats.queries = queryStats[0];
      
      // 激活码统计
      const activationStats = await ActivationCode.getStats();
      stats.activationCodes = activationStats;
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: stats
      });
      
    } catch (error) {
      console.error('获取仪表板统计错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取统计数据失败',
        data: null
      });
    }
  }
  
  // 获取平台统计
  static async getPlatformStats(req, res) {
    try {
      const platformStats = await Questionnaire.getPlatformStats();
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: {
          list: platformStats
        }
      });
      
    } catch (error) {
      console.error('获取平台统计错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取平台统计失败',
        data: null
      });
    }
  }
  
  // 获取会员统计
  static async getMemberStats(req, res) {
    try {
      const [memberStats] = await db.execute(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users,
          SUM(CASE WHEN is_vip = 1 THEN 1 ELSE 0 END) as new_vips
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: {
          list: memberStats
        }
      });
      
    } catch (error) {
      console.error('获取会员统计错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取会员统计失败',
        data: null
      });
    }
  }
  
  // 获取用户列表
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      
      const users = await User.getList(
        parseInt(page),
        parseInt(limit),
        search
      );
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: users
      });
      
    } catch (error) {
      console.error('获取用户列表错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取用户列表失败',
        data: null
      });
    }
  }
  
  // 获取问卷列表
  static async getQuestionnaires(req, res) {
    try {
      const { page = 1, limit = 20, platform = '', q_number = '' } = req.query;
      
      let search = '';
      if (platform && q_number) {
        search = `${platform} ${q_number}`;
      } else if (platform) {
        search = platform;
      } else if (q_number) {
        search = q_number;
      }
      
      const questionnaires = await Questionnaire.getList(
        parseInt(page),
        parseInt(limit),
        search
      );
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: questionnaires
      });
      
    } catch (error) {
      console.error('获取问卷列表错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取问卷列表失败',
        data: null
      });
    }
  }
  
  // 获取问卷详情
  static async getQuestionnaireById(req, res) {
    try {
      const { id } = req.params;
      
      const questionnaire = await Questionnaire.findById(id);
      
      if (!questionnaire) {
        return res.status(404).json({
          code: 404,
          msg: '问卷不存在',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: questionnaire
      });
      
    } catch (error) {
      console.error('获取问卷详情错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取问卷详情失败',
        data: null
      });
    }
  }
  
  // 创建问卷
  static async createQuestionnaire(req, res) {
    try {
      const { platform, q_number, reward_points, notes } = req.body;
      
      if (!platform || !q_number || !reward_points) {
        return res.status(400).json({
          code: 400,
          msg: '缺少必要参数',
          data: null
        });
      }
      
      const result = await Questionnaire.create({
        platform,
        q_number,
        reward_points,
        notes
      });
      
      res.json({
        code: 200,
        msg: '创建成功',
        data: { id: result.insertId }
      });
      
    } catch (error) {
      console.error('创建问卷错误:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          code: 400,
          msg: '问卷编号已存在',
          data: null
        });
      }
      res.status(500).json({
        code: 500,
        msg: '创建问卷失败',
        data: null
      });
    }
  }
  
  // 更新问卷
  static async updateQuestionnaire(req, res) {
    try {
      const { id } = req.params;
      const { platform, q_number, reward_points, notes } = req.body;
      
      if (!platform || !q_number || !reward_points) {
        return res.status(400).json({
          code: 400,
          msg: '缺少必要参数',
          data: null
        });
      }
      
      const result = await Questionnaire.update(id, {
        platform,
        q_number,
        reward_points,
        notes
      });
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '问卷不存在',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '更新成功',
        data: null
      });
      
    } catch (error) {
      console.error('更新问卷错误:', error);
      res.status(500).json({
        code: 500,
        msg: '更新问卷失败',
        data: null
      });
    }
  }
  
  // 删除问卷
  static async deleteQuestionnaire(req, res) {
    try {
      const { id } = req.params;
      
      const result = await Questionnaire.delete(id);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '问卷不存在',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '删除成功',
        data: null
      });
      
    } catch (error) {
      console.error('删除问卷错误:', error);
      res.status(500).json({
        code: 500,
        msg: '删除问卷失败',
        data: null
      });
    }
  }
  
  // 获取激活码列表
  static async getActivationCodes(req, res) {
    try {
      const { page = 1, limit = 20, status = null } = req.query;
      
      const codes = await ActivationCode.getList(
        parseInt(page),
        parseInt(limit),
        status !== null ? parseInt(status) : null
      );
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: codes
      });
      
    } catch (error) {
      console.error('获取激活码列表错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取激活码列表失败',
        data: null
      });
    }
  }
  
  // 生成激活码
  static async generateActivationCode(req, res) {
    try {
      const { count = 1, duration_days = 30, description = '' } = req.body;
      
      if (count <= 0 || count > 100) {
        return res.status(400).json({
          code: 400,
          msg: '生成数量必须在1-100之间',
          data: null
        });
      }
      
      if (duration_days <= 0) {
        return res.status(400).json({
          code: 400,
          msg: '有效天数必须大于0',
          data: null
        });
      }
      
      const result = await ActivationCode.generateBatch(count, duration_days, description);
      
      res.json({
        code: 200,
        msg: '生成成功',
        data: {
          generated_count: result.affectedRows,
          codes: result.codes
        }
      });
      
    } catch (error) {
      console.error('生成激活码错误:', error);
      res.status(500).json({
        code: 500,
        msg: '生成激活码失败',
        data: null
      });
    }
  }
  
  // 获取轮播图列表（管理员）
  static async getCarousels(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // 获取总数
      const countSql = 'SELECT COUNT(*) as total FROM carousels';
      const [countResult] = await db.execute(countSql);
      const total = countResult[0].total;
      
      // 获取轮播图列表
      const dataSql = `
        SELECT * FROM carousels 
        ORDER BY sort ASC, created_at DESC
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
      console.error('获取轮播图列表错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取轮播图列表失败',
        data: null
      });
    }
  }
  
  // 创建轮播图
  static async createCarousel(req, res) {
    try {
      const { image_url, link = '', sort = 0, status = 1 } = req.body;
      
      if (!image_url) {
        return res.status(400).json({
          code: 400,
          msg: '缺少图片地址',
          data: null
        });
      }
      
      const sql = `
        INSERT INTO carousels (image_url, link, sort, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      
      const [result] = await db.execute(sql, [image_url, link, sort, status]);
      
      res.json({
        code: 200,
        msg: '创建成功',
        data: { id: result.insertId }
      });
      
    } catch (error) {
      console.error('创建轮播图错误:', error);
      res.status(500).json({
        code: 500,
        msg: '创建轮播图失败',
        data: null
      });
    }
  }
  
  // 更新轮播图
  static async updateCarousel(req, res) {
    try {
      const { id } = req.params;
      const { image_url, link = '', sort = 0, status = 1 } = req.body;
      
      if (!image_url) {
        return res.status(400).json({
          code: 400,
          msg: '缺少图片地址',
          data: null
        });
      }
      
      const sql = `
        UPDATE carousels 
        SET image_url = ?, link = ?, sort = ?, status = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const [result] = await db.execute(sql, [image_url, link, sort, status, id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '轮播图不存在',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '更新成功',
        data: null
      });
      
    } catch (error) {
      console.error('更新轮播图错误:', error);
      res.status(500).json({
        code: 500,
        msg: '更新轮播图失败',
        data: null
      });
    }
  }
  
  // 删除轮播图
  static async deleteCarousel(req, res) {
    try {
      const { id } = req.params;
      
      const sql = 'DELETE FROM carousels WHERE id = ?';
      const [result] = await db.execute(sql, [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '轮播图不存在',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '删除成功',
        data: null
      });
      
    } catch (error) {
      console.error('删除轮播图错误:', error);
      res.status(500).json({
        code: 500,
        msg: '删除轮播图失败',
        data: null
      });
    }
  }
  
  // 上传轮播图图片
  static async uploadCarouselImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          code: 400,
          msg: '请选择要上传的图片',
          data: null
        });
      }
      
      // 验证文件类型
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          code: 400,
          msg: '只能上传图片文件',
          data: null
        });
      }
      
      // 验证文件大小（5MB）
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          code: 400,
          msg: '图片大小不能超过5MB',
          data: null
        });
      }
      
      // 生成文件名
      const fileName = generateFileName(req.file.originalname);
      
      // 上传到七牛云
      const uploadResult = await uploadToQiniu(req.file.buffer, fileName);
      
      res.json({
        code: 200,
        msg: '上传成功',
        data: {
          url: uploadResult.url,
          key: uploadResult.key,
          hash: uploadResult.hash
        }
      });
      
    } catch (error) {
      console.error('图片上传错误:', error);
      res.status(500).json({
        code: 500,
        msg: '图片上传失败',
        data: null
      });
    }
  }
  
  // 获取公告列表（管理员）
  static async getAnnouncements(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      // 获取总数
      const countSql = 'SELECT COUNT(*) as total FROM announcements';
      const [countResult] = await db.execute(countSql);
      const total = countResult[0].total;
      
      // 获取公告列表
      const dataSql = `
        SELECT * FROM announcements 
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
      console.error('获取公告列表错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取公告列表失败',
        data: null
      });
    }
  }
  
  // 创建公告
  static async createAnnouncement(req, res) {
    try {
      const { title, content, status = 1 } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({
          code: 400,
          msg: '标题和内容不能为空',
          data: null
        });
      }
      
      const sql = `
        INSERT INTO announcements (title, content, status, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `;
      
      const [result] = await db.execute(sql, [title, content, status]);
      
      res.json({
        code: 200,
        msg: '创建成功',
        data: { id: result.insertId }
      });
      
    } catch (error) {
      console.error('创建公告错误:', error);
      res.status(500).json({
        code: 500,
        msg: '创建公告失败',
        data: null
      });
    }
  }
  
  // 更新公告
  static async updateAnnouncement(req, res) {
    try {
      const { id } = req.params;
      const { title, content, status } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({
          code: 400,
          msg: '标题和内容不能为空',
          data: null
        });
      }
      
      const sql = `
        UPDATE announcements 
        SET title = ?, content = ?, status = ?, updated_at = NOW()
        WHERE id = ?
      `;
      
      const [result] = await db.execute(sql, [title, content, status, id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '公告不存在',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '更新成功',
        data: null
      });
      
    } catch (error) {
      console.error('更新公告错误:', error);
      res.status(500).json({
        code: 500,
        msg: '更新公告失败',
        data: null
      });
    }
  }
  
  // 删除公告
  static async deleteAnnouncement(req, res) {
    try {
      const { id } = req.params;
      
      const sql = 'DELETE FROM announcements WHERE id = ?';
      const [result] = await db.execute(sql, [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '公告不存在',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '删除成功',
        data: null
      });
      
    } catch (error) {
      console.error('删除公告错误:', error);
      res.status(500).json({
        code: 500,
        msg: '删除公告失败',
        data: null
      });
    }
  }
  
  // 切换公告状态
  static async toggleAnnouncementStatus(req, res) {
    try {
      const { id } = req.params;
      
      const sql = `
        UPDATE announcements 
        SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END, updated_at = NOW()
        WHERE id = ?
      `;
      
      const [result] = await db.execute(sql, [id]);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '公告不存在',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '状态切换成功',
        data: null
      });
      
    } catch (error) {
      console.error('切换公告状态错误:', error);
      res.status(500).json({
        code: 500,
        msg: '状态切换失败',
        data: null
      });
    }
  }
}

module.exports = AdminController;