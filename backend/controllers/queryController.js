const Questionnaire = require('../models/Questionnaire');
const QueryHistory = require('../models/QueryHistory');
const User = require('../models/User');

class QueryController {
  // 查询问卷
  static async queryQuestionnaire(req, res) {
    try {
      const { user_id, platform, q_number } = req.body;
      
      if (!user_id || !platform || !q_number) {
        return res.status(400).json({
          code: 400,
          msg: '缺少必要参数',
          data: null
        });
      }
      
      // 验证用户存在并检查VIP状态
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          code: 404,
          msg: '用户不存在',
          data: null
        });
      }
      
      const vipStatus = await User.checkVipStatus(user_id);
      if (!vipStatus.isVip) {
        return res.status(403).json({
          code: 403,
          msg: '需要VIP权限才能查询问卷',
          data: null
        });
      }
      
      // 查找问卷
      const questionnaire = await Questionnaire.findByPlatformAndNumber(platform, q_number);
      
      if (!questionnaire) {
        return res.status(404).json({
          code: 404,
          msg: '未找到该问卷信息',
          data: null
        });
      }
      
      // 准备查询结果
      const resultData = {
        questionnaire: {
          id: questionnaire.id,
          platform: questionnaire.platform,
          q_number: questionnaire.q_number,
          reward_points: questionnaire.reward_points,
          notes: questionnaire.notes
        }
      };
      
      // 记录查询历史
      await QueryHistory.create({
        user_id,
        questionnaire_id: questionnaire.id,
        query_params: { platform, q_number },
        result_data: resultData
      });
      
      res.json({
        code: 200,
        msg: '查询成功',
        data: resultData
      });
      
    } catch (error) {
      console.error('查询问卷错误:', error);
      res.status(500).json({
        code: 500,
        msg: '查询失败',
        data: null
      });
    }
  }
  
  // 获取用户查询历史
  static async getUserQueryHistory(req, res) {
    try {
      const { user_id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          code: 404,
          msg: '用户不存在',
          data: null
        });
      }
      
      const history = await QueryHistory.getUserHistory(
        user_id, 
        parseInt(page), 
        parseInt(limit)
      );
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: history
      });
      
    } catch (error) {
      console.error('获取查询历史错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取查询历史失败',
        data: null
      });
    }
  }
  
  // 删除查询记录
  static async deleteQueryRecord(req, res) {
    try {
      const { record_id } = req.params;
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({
          code: 400,
          msg: '缺少用户ID',
          data: null
        });
      }
      
      const result = await QueryHistory.delete(record_id, user_id);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({
          code: 404,
          msg: '记录不存在或无权删除',
          data: null
        });
      }
      
      res.json({
        code: 200,
        msg: '删除成功',
        data: null
      });
      
    } catch (error) {
      console.error('删除查询记录错误:', error);
      res.status(500).json({
        code: 500,
        msg: '删除失败',
        data: null
      });
    }
  }
  
  // 清空用户历史记录
  static async clearUserHistory(req, res) {
    try {
      const { user_id } = req.body;
      
      if (!user_id) {
        return res.status(400).json({
          code: 400,
          msg: '缺少用户ID',
          data: null
        });
      }
      
      await QueryHistory.clearUserHistory(user_id);
      
      res.json({
        code: 200,
        msg: '清空成功',
        data: null
      });
      
    } catch (error) {
      console.error('清空历史记录错误:', error);
      res.status(500).json({
        code: 500,
        msg: '清空失败',
        data: null
      });
    }
  }
}

module.exports = QueryController;