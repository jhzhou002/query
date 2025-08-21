const User = require('../models/User');
const ActivationCode = require('../models/ActivationCode');
const wechatConfig = require('../config/wechat');
const axios = require('axios');
const jwt = require('jsonwebtoken');

class AuthController {
  // 微信小程序登录
  static async wechatLogin(req, res) {
    try {
      const { code, userInfo } = req.body;
      
      if (!code) {
        return res.status(400).json({
          code: 400,
          msg: '缺少微信登录code',
          data: null
        });
      }
      
      // 向微信服务器换取openid和session_key
      const wechatResponse = await axios.get(`${wechatConfig.apiUrl}/sns/jscode2session`, {
        params: {
          appid: wechatConfig.appId,
          secret: wechatConfig.appSecret,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });
      
      const { openid, session_key, errcode, errmsg } = wechatResponse.data;
      
      if (errcode) {
        return res.status(400).json({
          code: 400,
          msg: `微信登录失败: ${errmsg}`,
          data: null
        });
      }
      
      // 创建或更新用户信息
      const userData = {
        openid,
        nickName: userInfo?.nickName || '',
        avatarUrl: userInfo?.avatarUrl || '',
        phone: userInfo?.phone || ''
      };
      
      await User.createOrUpdate(userData);
      
      // 获取用户完整信息
      const user = await User.findByOpenid(openid);
      
      // 检查VIP状态
      const vipStatus = await User.checkVipStatus(user.id);
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, openid: user.openid },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '30d' }
      );
      
      res.json({
        code: 200,
        msg: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            openid: user.openid,
            nick_name: user.nick_name,
            avatar_url: user.avatar_url,
            phone: user.phone,
            is_vip: vipStatus.isVip,
            vip_expiry_date: vipStatus.expiryDate
          }
        }
      });
      
    } catch (error) {
      console.error('微信登录错误:', error);
      res.status(500).json({
        code: 500,
        msg: '登录失败',
        data: null
      });
    }
  }
  
  // 激活VIP
  static async activateVip(req, res) {
    try {
      const { user_id, activation_code } = req.body;
      
      if (!user_id || !activation_code) {
        return res.status(400).json({
          code: 400,
          msg: '缺少必要参数',
          data: null
        });
      }
      
      // 验证用户存在
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          code: 404,
          msg: '用户不存在',
          data: null
        });
      }
      
      // 激活VIP
      const result = await User.activateVip(user_id, activation_code);
      
      res.json({
        code: 200,
        msg: 'VIP激活成功',
        data: {
          vip_expiry_date: result.expiryDate
        }
      });
      
    } catch (error) {
      console.error('VIP激活错误:', error);
      res.status(400).json({
        code: 400,
        msg: error.message || 'VIP激活失败',
        data: null
      });
    }
  }
  
  // 获取用户信息
  static async getUserInfo(req, res) {
    try {
      const { user_id } = req.params;
      
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({
          code: 404,
          msg: '用户不存在',
          data: null
        });
      }
      
      // 检查VIP状态
      const vipStatus = await User.checkVipStatus(user.id);
      
      res.json({
        code: 200,
        msg: '获取成功',
        data: {
          id: user.id,
          openid: user.openid,
          nick_name: user.nick_name,
          avatar_url: user.avatar_url,
          phone: user.phone,
          is_vip: vipStatus.isVip,
          vip_expiry_date: vipStatus.expiryDate,
          created_at: user.created_at
        }
      });
      
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        code: 500,
        msg: '获取用户信息失败',
        data: null
      });
    }
  }
}

module.exports = AuthController;