// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录code:', res.code)
      }
    })
  },

  onShow() {
    // 检查用户登录状态
    this.checkLoginStatus()
  },

  onHide() {
    console.log('小程序切入后台')
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    if (!token || !userInfo) {
      // 清除可能存在的无效数据
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      this.globalData.isLogin = false
    } else {
      this.globalData.isLogin = true
      this.globalData.userInfo = userInfo
    }
  },

  // 用户登录
  login(userInfo) {
    this.globalData.isLogin = true
    this.globalData.userInfo = userInfo
    wx.setStorageSync('userInfo', userInfo)
  },

  // 用户登出
  logout() {
    this.globalData.isLogin = false
    this.globalData.userInfo = null
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
  },

  // 全局数据
  globalData: {
    isLogin: false,
    userInfo: null,
    // API基础URL
    apiBase: 'http://localhost:3000/api'
  },

  // API请求封装
  request(options) {
    const { url, method = 'GET', data = {}, needAuth = true } = options
    
    return new Promise((resolve, reject) => {
      const headers = {
        'Content-Type': 'application/json'
      }
      
      // 添加认证token
      if (needAuth) {
        const token = wx.getStorageSync('token')
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }
      
      wx.request({
        url: this.globalData.apiBase + url,
        method,
        data,
        header: headers,
        success: (res) => {
          if (res.statusCode === 200) {
            if (res.data.code === 200) {
              resolve(res.data)
            } else {
              // API业务错误
              if (res.data.code === 401) {
                // token过期，清除登录状态
                this.logout()
                wx.showToast({
                  title: '登录已过期，请重新登录',
                  icon: 'none'
                })
                // 跳转到登录页
                wx.redirectTo({
                  url: '/pages/login/login'
                })
              } else {
                wx.showToast({
                  title: res.data.msg || '请求失败',
                  icon: 'none'
                })
              }
              reject(res.data)
            }
          } else {
            // HTTP错误
            wx.showToast({
              title: '网络请求失败',
              icon: 'none'
            })
            reject(res)
          }
        },
        fail: (error) => {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none'
          })
          reject(error)
        }
      })
    })
  }
})