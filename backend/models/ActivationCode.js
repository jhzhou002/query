const db = require('../config/database');

class ActivationCode {
  // 生成激活码
  static async generate(data) {
    const { code, duration_days, description } = data;
    
    const sql = `
      INSERT INTO activation_codes (code, duration_days, description, status, created_at)
      VALUES (?, ?, ?, 0, NOW())
    `;
    
    const [result] = await db.execute(sql, [code, duration_days, description]);
    return result;
  }
  
  // 批量生成激活码
  static async generateBatch(count, duration_days, description) {
    const codes = [];
    
    for (let i = 0; i < count; i++) {
      const code = this.generateRandomCode();
      codes.push([code, duration_days, description, 0]);
    }
    
    const sql = `
      INSERT INTO activation_codes (code, duration_days, description, status, created_at)
      VALUES ?
    `;
    
    // 为每个code添加created_at
    const values = codes.map(code => [...code.slice(0, 3), 0, new Date()]);
    
    const [result] = await db.query(sql, [values]);
    return { insertId: result.insertId, affectedRows: result.affectedRows, codes: codes.map(c => c[0]) };
  }
  
  // 生成随机激活码
  static generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) code += '-';
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  // 验证激活码
  static async validate(code) {
    const sql = `
      SELECT * FROM activation_codes 
      WHERE code = ? AND status = 0
    `;
    const [rows] = await db.execute(sql, [code]);
    return rows[0];
  }
  
  // 使用激活码
  static async use(codeId, userId) {
    const sql = `
      UPDATE activation_codes 
      SET status = 1, used_by = ?, used_at = NOW()
      WHERE id = ?
    `;
    const [result] = await db.execute(sql, [userId, codeId]);
    return result;
  }
  
  // 获取激活码列表
  static async getList(page = 1, limit = 20, status = null) {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    
    if (status !== null) {
      whereClause = 'WHERE status = ?';
      params = [status];
    }
    
    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM activation_codes ${whereClause}`;
    const [countResult] = await db.execute(countSql, params);
    const total = countResult[0].total;
    
    // 获取激活码列表
    const dataSql = `
      SELECT 
        ac.*,
        u.nick_name as used_by_name
      FROM activation_codes ac
      LEFT JOIN users u ON ac.used_by = u.id
      ${whereClause}
      ORDER BY ac.created_at DESC
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
  
  // 获取激活码统计
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as unused,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as used
      FROM activation_codes
    `;
    const [rows] = await db.execute(sql);
    return rows[0];
  }
}

module.exports = ActivationCode;