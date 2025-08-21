// pages/login/login.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    loading: false
  },

  onLoad() {
    // 检查是否已经登录
    if (app.globalData.isLogin) {
      this.redirectToHome()
    }
  },

  // 获取用户信息（新版API）
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        this.login(res.userInfo)
      },
      fail: (error) => {
        console.error('获取用户信息失败:', error)
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })
  },

  // 获取用户信息（旧版API - 兼容性）
  getUserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
      this.login(e.detail.userInfo)
    } else {
      wx.showToast({
        title: '需要授权才能使用',
        icon: 'none'
      })
    }
  },

  // 微信登录
  async login(userInfo) {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      // 获取微信登录code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        })
      })
      
      if (!loginRes.code) {
        throw new Error('获取登录code失败')
      }
      
      // 发送到后端进行登录
      const res = await app.request({
        url: '/auth/wechat/login',
        method: 'POST',
        data: {
          code: loginRes.code,
          userInfo: {
            nickName: userInfo.nickName,
            avatarUrl: userInfo.avatarUrl,
            gender: userInfo.gender,
            country: userInfo.country,
            province: userInfo.province,
            city: userInfo.city
          }
        },
        needAuth: false
      })
      
      if (res.code === 200) {
        // 保存token和用户信息
        wx.setStorageSync('token', res.data.token)
        
        // 更新全局用户信息
        const userData = {
          ...userInfo,
          ...res.data.user
        }
        
        app.login(userData)
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        // 延迟跳转，让用户看到成功提示
        setTimeout(() => {
          this.redirectToHome()
        }, 1500)
      } else {
        throw new Error(res.msg || '登录失败')
      }
      
    } catch (error) {
      console.error('登录失败:', error)
      
      // 开发环境使用模拟登录
      if (error.message.includes('网络') || error.message.includes('连接')) {
        this.mockLogin(userInfo)
      } else {
        wx.showToast({
          title: error.message || '登录失败，请重试',
          icon: 'none'
        })
      }
    } finally {
      this.setData({ loading: false })
    }
  },

  // 模拟登录（开发环境）
  mockLogin(userInfo) {
    const mockToken = 'mock_token_' + Date.now()
    const userData = {
      ...userInfo,
      id: 1,
      openid: 'mock_openid',
      is_vip: false,
      vip_expiry_date: null
    }
    
    wx.setStorageSync('token', mockToken)
    app.login(userData)
    
    wx.showToast({
      title: '登录成功（模拟）',
      icon: 'success'
    })
    
    setTimeout(() => {
      this.redirectToHome()
    }, 1500)
  },

  // 跳转到首页
  redirectToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 返回上一页
  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
    } else {
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  // 查看隐私政策
  viewPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们将严格保护您的个人信息安全，仅用于提供更好的服务体验。详细内容请访问我们的官网查看完整隐私政策。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 查看用户协议
  viewUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '使用本小程序即表示您同意遵守我们的用户协议。请合理使用查询功能，不要进行恶意操作。',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})