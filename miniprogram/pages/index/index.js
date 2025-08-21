// pages/index/index.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    isLogin: false,
    stats: {
      totalQueries: 0,
      totalUsers: 0,
      todayQueries: 0
    },
    announcements: [],
    carousels: [],
    currentCarousel: 0,
    loading: true
  },

  onLoad() {
    this.checkLogin()
    this.loadData()
  },

  onShow() {
    this.checkLogin()
    if (this.data.isLogin) {
      this.loadStats()
    }
  },

  onPullDownRefresh() {
    this.loadData()
  },

  // 检查登录状态
  checkLogin() {
    const isLogin = app.globalData.isLogin
    const userInfo = app.globalData.userInfo
    
    this.setData({
      isLogin,
      userInfo
    })
  },

  // 加载页面数据
  async loadData() {
    wx.showNavigationBarLoading()
    
    try {
      await Promise.all([
        this.loadCarousels(),
        this.loadAnnouncements(),
        this.loadStats()
      ])
    } finally {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
      this.setData({ loading: false })
    }
  },

  // 加载轮播图
  async loadCarousels() {
    try {
      const res = await app.request({
        url: '/carousels',
        needAuth: false
      })
      
      this.setData({
        carousels: res.data || []
      })
    } catch (error) {
      console.error('加载轮播图失败:', error)
      // 使用模拟数据
      this.setData({
        carousels: [
          {
            id: 1,
            image_url: '/images/banner1.jpg',
            link: '',
            title: '欢迎使用问卷查询系统'
          },
          {
            id: 2,
            image_url: '/images/banner2.jpg',
            link: '',
            title: '快速查询问卷信息'
          }
        ]
      })
    }
  },

  // 加载公告
  async loadAnnouncements() {
    try {
      const res = await app.request({
        url: '/announcements',
        needAuth: false
      })
      
      this.setData({
        announcements: res.data || []
      })
    } catch (error) {
      console.error('加载公告失败:', error)
      // 使用模拟数据
      this.setData({
        announcements: [
          {
            id: 1,
            title: '系统升级通知',
            content: '问卷查询系统将于本周末进行升级维护，期间可能影响服务使用。',
            created_at: '2024-08-21 10:00:00'
          },
          {
            id: 2,
            title: 'VIP会员优惠活动',
            content: '现在购买VIP会员享受8折优惠，更多问卷查询特权等你来体验！',
            created_at: '2024-08-20 15:30:00'
          }
        ]
      })
    }
  },

  // 加载统计数据
  async loadStats() {
    if (!this.data.isLogin) return
    
    try {
      const res = await app.request({
        url: '/user/stats'
      })
      
      this.setData({
        stats: res.data || this.data.stats
      })
    } catch (error) {
      console.error('加载统计数据失败:', error)
      // 使用模拟数据
      this.setData({
        stats: {
          totalQueries: 23,
          totalUsers: 1568,
          todayQueries: 5
        }
      })
    }
  },

  // 轮播图切换
  onCarouselChange(e) {
    this.setData({
      currentCarousel: e.detail.current
    })
  },

  // 轮播图点击
  onCarouselTap(e) {
    const { link } = e.currentTarget.dataset
    if (link) {
      // 处理轮播图链接跳转
      console.log('轮播图链接:', link)
    }
  },

  // 跳转到搜索页面
  goToSearch() {
    wx.switchTab({
      url: '/pages/search/search'
    })
  },

  // 跳转到登录页面
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 跳转到激活码页面
  goToActivation() {
    if (!this.data.isLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/activation/activation'
    })
  },

  // 查看公告详情
  viewAnnouncement(e) {
    const { announcement } = e.currentTarget.dataset
    wx.showModal({
      title: announcement.title,
      content: announcement.content,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '问卷查询系统 - 快速查询问卷信息',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    }
  },

  onShareTimeline() {
    return {
      title: '问卷查询系统 - 快速查询问卷信息',
      imageUrl: '/images/share.jpg'
    }
  }
})