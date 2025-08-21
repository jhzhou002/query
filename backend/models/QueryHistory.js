const db = require('../config/database');

class QueryHistory {
  // 创建查询记录
  static async create(data) {
    const { user_id, questionnaire_id, query_params, result_data } = data;
    
    const sql = `
      INSERT INTO query_history (user_id, questionnaire_id, query_params, result_data, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.execute(sql, [
      user_id, 
      questionnaire_id, 
      JSON.stringify(query_params), 
      JSON.stringify(result_data)
    ]);
    return result;
  }
  
  // 获取用户查询历史
  static async getUserHistory(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM query_history 
      WHERE user_id = ?
    `;
    const [countResult] = await db.execute(countSql, [userId]);
    const total = countResult[0].total;
    
    // 获取历史记录
    const dataSql = `
      SELECT 
        qh.*,
        q.platform,
        q.q_number,
        q.reward_points
      FROM query_history qh
      LEFT JOIN questionnaires q ON qh.questionnaire_id = q.id
      WHERE qh.user_id = ?
      ORDER BY qh.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await db.execute(dataSql, [userId, limit, offset]);
    
    // 解析JSON字段
    const processedRows = rows.map(row => ({
      ...row,
      query_params: row.query_params ? JSON.parse(row.query_params) : null,
      result_data: row.result_data ? JSON.parse(row.result_data) : null
    }));
    
    return {
      list: processedRows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  // 删除查询记录
  static async delete(id, userId) {
    const sql = `
      DELETE FROM query_history 
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await db.execute(sql, [id, userId]);
    return result;
  }
  
  // 清空用户历史记录
  static async clearUserHistory(userId) {
    const sql = `
      DELETE FROM query_history 
      WHERE user_id = ?
    `;
    const [result] = await db.execute(sql, [userId]);
    return result;
  }
  
  // 获取查询统计（管理员使用）
  static async getQueryStats() {
    const sql = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as query_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM query_history 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
  
  // 获取热门问卷统计
  static async getPopularQuestionnaires(limit = 10) {
    const sql = `
      SELECT 
        q.platform,
        q.q_number,
        q.reward_points,
        COUNT(qh.id) as query_count
      FROM questionnaires q
      LEFT JOIN query_history qh ON q.id = qh.questionnaire_id
      GROUP BY q.id
      ORDER BY query_count DESC
      LIMIT ?
    `;
    const [rows] = await db.execute(sql, [limit]);
    return rows;
  }
}

module.exports = QueryHistory;