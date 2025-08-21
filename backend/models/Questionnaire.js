const db = require('../config/database');

class Questionnaire {
  // 创建问卷
  static async create(data) {
    const { platform, q_number, reward_points, notes } = data;
    
    const sql = `
      INSERT INTO questionnaires (platform, q_number, reward_points, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;
    
    const [result] = await db.execute(sql, [platform, q_number, reward_points, notes]);
    return result;
  }
  
  // 根据ID获取问卷
  static async findById(id) {
    const sql = `
      SELECT * FROM questionnaires WHERE id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
  
  // 更新问卷
  static async update(id, data) {
    const { platform, q_number, reward_points, notes } = data;
    
    const sql = `
      UPDATE questionnaires 
      SET platform = ?, q_number = ?, reward_points = ?, notes = ?, updated_at = NOW()
      WHERE id = ?
    `;
    
    const [result] = await db.execute(sql, [platform, q_number, reward_points, notes, id]);
    return result;
  }
  
  // 删除问卷
  static async delete(id) {
    const sql = `DELETE FROM questionnaires WHERE id = ?`;
    const [result] = await db.execute(sql, [id]);
    return result;
  }
  
  // 获取问卷列表
  static async getList(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = 'WHERE platform LIKE ? OR q_number LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM questionnaires ${whereClause}`;
    const [countResult] = await db.execute(countSql, params);
    const total = countResult[0].total;
    
    // 获取问卷列表
    const dataSql = `
      SELECT * FROM questionnaires 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await db.execute(dataSql, [...params, limit, offset]);
    
    return {
      list: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
  
  // 根据平台和问卷编号查找
  static async findByPlatformAndNumber(platform, q_number) {
    const sql = `
      SELECT * FROM questionnaires 
      WHERE platform = ? AND q_number = ?
    `;
    const [rows] = await db.execute(sql, [platform, q_number]);
    return rows[0];
  }
  
  // 获取平台统计
  static async getPlatformStats() {
    const sql = `
      SELECT 
        platform,
        COUNT(*) as count,
        AVG(reward_points) as avg_points
      FROM questionnaires 
      GROUP BY platform
      ORDER BY count DESC
    `;
    const [rows] = await db.execute(sql);
    return rows;
  }
}

module.exports = Questionnaire;