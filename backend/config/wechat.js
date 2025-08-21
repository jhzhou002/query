// 微信小程序配置
const wechatConfig = {
  appId: process.env.WECHAT_APP_ID || '',
  appSecret: process.env.WECHAT_APP_SECRET || '',
  apiUrl: 'https://api.weixin.qq.com'
};

module.exports = wechatConfig;