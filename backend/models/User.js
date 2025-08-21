const db = require('../config/database');

class User {
  // 创建或更新用户
  static async createOrUpdate(userData) {
    const { openid, nickName, avatarUrl, phone } = userData;
    
    const sql = `
      INSERT INTO users (openid, nick_name, avatar_url, phone, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE 
        nick_name = VALUES(nick_name),
        avatar_url = VALUES(avatar_url),
        phone = VALUES(phone),
        updated_at = NOW()
    `;
    
    const [result] = await db.execute(sql, [openid, nickName, avatarUrl, phone]);
    return result;
  }
  
  // 根据openid查找用户
  static async findByOpenid(openid) {
    const sql = `
      SELECT * FROM users WHERE openid = ?
    `;
    const [rows] = await db.execute(sql, [openid]);
    return rows[0];
  }
  
  // 根据ID查找用户
  static async findById(id) {
    const sql = `
      SELECT * FROM users WHERE id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0];
  }
  
  // 激活用户VIP
  static async activateVip(userId, activationCode) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 检查激活码是否有效
      const [codeRows] = await connection.execute(
        'SELECT * FROM activation_codes WHERE code = ? AND status = 0',
        [activationCode]
      );
      
      if (codeRows.length === 0) {
        throw new Error('激活码无效或已使用');
      }
      
      const code = codeRows[0];
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + code.duration_days);
      
      // 更新用户VIP状态
      await connection.execute(
        'UPDATE users SET is_vip = 1, vip_expiry_date = ?, updated_at = NOW() WHERE id = ?',
        [expiryDate, userId]
      );
      
      // 标记激活码为已使用
      await connection.execute(
        'UPDATE activation_codes SET status = 1, used_by = ?, used_at = NOW() WHERE id = ?',
        [userId, code.id]
      );
      
      await connection.commit();
      return { success: true, expiryDate };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  // 检查VIP状态
  static async checkVipStatus(userId) {
    const sql = `
      SELECT is_vip, vip_expiry_date FROM users WHERE id = ?
    `;
    const [rows] = await db.execute(sql, [userId]);
    
    if (rows.length === 0) {
      return { isVip: false };
    }
    
    const user = rows[0];
    const now = new Date();
    const isVipValid = user.is_vip && new Date(user.vip_expiry_date) > now;
    
    // 如果VIP过期，更新状态
    if (user.is_vip && !isVipValid) {
      await db.execute(
        'UPDATE users SET is_vip = 0 WHERE id = ?',
        [userId]
      );
    }
    
    return {
      isVip: isVipValid,
      expiryDate: user.vip_expiry_date
    };
  }
  
  // 获取用户列表（管理员使用）
  static async getList(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let params = [];
    
    if (search) {
      whereClause = 'WHERE nick_name LIKE ? OR phone LIKE ?';
      params = [`%${search}%`, `%${search}%`];
    }
    
    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const [countResult] = await db.execute(countSql, params);
    const total = countResult[0].total;
    
    // 获取用户列表
    const dataSql = `
      SELECT 
        id, openid, nick_name, avatar_url, phone, 
        is_vip, vip_expiry_date, created_at, updated_at
      FROM users 
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
}

module.exports = User;