// pages/search/search.js
const app = getApp()

Page({
  data: {
    // 查询表单
    searchForm: {
      q_number: '',
      platform: ''
    },
    
    // 平台选项
    platforms: [
      { value: '', label: '全部平台' },
      { value: '问卷星', label: '问卷星' },
      { value: '腾讯问卷', label: '腾讯问卷' },
      { value: '金数据', label: '金数据' },
      { value: '问卷网', label: '问卷网' },
      { value: '调研宝', label: '调研宝' }
    ],
    
    // 查询结果
    searchResults: [],
    
    // 页面状态
    loading: false,
    searching: false,
    hasSearched: false,
    isLogin: false,
    userInfo: null,
    
    // 搜索历史
    searchHistory: [],
    showHistory: true
  },

  onLoad() {
    this.checkLogin()
    this.loadSearchHistory()
  },

  onShow() {
    this.checkLogin()
  },

  onPullDownRefresh() {
    if (this.data.hasSearched) {
      this.performSearch()
    } else {
      wx.stopPullDownRefresh()
    }
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

  // 加载搜索历史
  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || []
    this.setData({
      searchHistory: history.slice(0, 10) // 只显示最近10条
    })
  },

  // 保存搜索历史
  saveSearchHistory(query) {
    if (!query.q_number) return
    
    let history = wx.getStorageSync('searchHistory') || []
    
    // 移除重复项
    history = history.filter(item => item.q_number !== query.q_number || item.platform !== query.platform)
    
    // 添加到开头
    history.unshift({
      ...query,
      searchTime: new Date().toLocaleString()
    })
    
    // 限制数量
    history = history.slice(0, 20)
    
    wx.setStorageSync('searchHistory', history)
    this.loadSearchHistory()
  },

  // 清空搜索历史
  clearSearchHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({
            searchHistory: []
          })
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    
    this.setData({
      [`searchForm.${field}`]: value,
      showHistory: field === 'q_number' && value.length === 0
    })
  },

  // 平台选择
  onPlatformChange(e) {
    const { value } = e.detail
    this.setData({
      'searchForm.platform': this.data.platforms[value].value
    })
  },

  // 使用历史搜索
  useHistorySearch(e) {
    const { history } = e.currentTarget.dataset
    this.setData({
      searchForm: {
        q_number: history.q_number,
        platform: history.platform
      },
      showHistory: false
    })
    this.performSearch()
  },

  // 删除历史记录
  deleteHistory(e) {
    e.stopPropagation()
    const { index } = e.currentTarget.dataset
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          let history = wx.getStorageSync('searchHistory') || []
          history.splice(index, 1)
          wx.setStorageSync('searchHistory', history)
          this.loadSearchHistory()
        }
      }
    })
  },

  // 执行搜索
  async performSearch() {
    const { q_number, platform } = this.data.searchForm
    
    if (!q_number.trim()) {
      wx.showToast({
        title: '请输入问卷编号',
        icon: 'none'
      })
      return
    }

    // 检查是否需要登录
    if (!this.data.isLogin) {
      wx.showModal({
        title: '需要登录',
        content: '查询问卷信息需要先登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }
        }
      })
      return
    }

    // 检查VIP权限（非VIP用户限制查询次数）
    if (!this.data.userInfo.is_vip) {
      const todayQueries = this.getTodayQueriesCount()
      if (todayQueries >= 5) {
        wx.showModal({
          title: 'VIP特权',
          content: '普通用户每日只能查询5次，升级VIP享受无限查询特权！',
          confirmText: '升级VIP',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/activation/activation'
              })
            }
          }
        })
        return
      }
    }

    this.setData({ 
      searching: true,
      showHistory: false
    })

    try {
      const res = await app.request({
        url: '/questionnaires/search',
        data: {
          q_number: q_number.trim(),
          platform: platform || undefined
        }
      })

      this.setData({
        searchResults: res.data || [],
        hasSearched: true
      })

      // 保存搜索历史
      this.saveSearchHistory({
        q_number: q_number.trim(),
        platform: platform
      })

      // 记录查询次数
      this.recordQuery()

      if (res.data && res.data.length > 0) {
        wx.showToast({
          title: `找到 ${res.data.length} 个结果`,
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '未找到相关问卷',
          icon: 'none'
        })
      }

    } catch (error) {
      console.error('搜索失败:', error)
      
      // 开发环境使用模拟数据
      this.mockSearch()
    } finally {
      this.setData({ searching: false })
      wx.stopPullDownRefresh()
    }
  },

  // 模拟搜索（开发环境）
  mockSearch() {
    const { q_number, platform } = this.data.searchForm
    
    // 模拟搜索结果
    const mockResults = [
      {
        id: 1,
        platform: '问卷星',
        q_number: q_number,
        reward_points: 12,
        notes: '年龄：18-35岁，职业：学生、白领，地区：一二线城市',
        created_at: '2024-08-21 10:00:00'
      },
      {
        id: 2,
        platform: '腾讯问卷',
        q_number: q_number,
        reward_points: 8,
        notes: '性别：女性，年龄：25-45岁，有购物经验',
        created_at: '2024-08-20 15:30:00'
      }
    ]

    // 根据平台筛选
    let results = mockResults
    if (platform) {
      results = mockResults.filter(item => item.platform === platform)
    }

    this.setData({
      searchResults: results,
      hasSearched: true
    })

    this.saveSearchHistory({
      q_number: q_number.trim(),
      platform: platform
    })

    this.recordQuery()

    wx.showToast({
      title: `找到 ${results.length} 个结果（模拟）`,
      icon: 'success'
    })
  },

  // 记录查询次数
  recordQuery() {
    const today = new Date().toDateString()
    let todayQueries = wx.getStorageSync(`queries_${today}`) || 0
    todayQueries++
    wx.setStorageSync(`queries_${today}`, todayQueries)
  },

  // 获取今日查询次数
  getTodayQueriesCount() {
    const today = new Date().toDateString()
    return wx.getStorageSync(`queries_${today}`) || 0
  },

  // 清空搜索结果
  clearResults() {
    this.setData({
      searchResults: [],
      hasSearched: false,
      showHistory: true
    })
  },

  // 复制问卷信息
  copyQuestionnaire(e) {
    const { questionnaire } = e.currentTarget.dataset
    const copyText = `问卷编号：${questionnaire.q_number}\n平台：${questionnaire.platform}\n奖励积分：${questionnaire.reward_points}\n筛选条件：${questionnaire.notes}`
    
    wx.setClipboardData({
      data: copyText,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  // 分享问卷
  shareQuestionnaire(e) {
    const { questionnaire } = e.currentTarget.dataset
    
    wx.showActionSheet({
      itemList: ['分享给好友', '生成海报'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 分享给好友功能会在 onShareAppMessage 中处理
          this.setData({ shareQuestionnaire: questionnaire })
        } else if (res.tapIndex === 1) {
          this.generatePoster(questionnaire)
        }
      }
    })
  },

  // 生成海报
  generatePoster(questionnaire) {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 跳转到登录页
  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  // 分享功能
  onShareAppMessage() {
    const shareData = this.data.shareQuestionnaire
    if (shareData) {
      return {
        title: `问卷编号 ${shareData.q_number} - ${shareData.platform}`,
        path: `/pages/search/search?q_number=${shareData.q_number}&platform=${shareData.platform}`,
        imageUrl: '/images/share.jpg'
      }
    }
    
    return {
      title: '问卷查询系统 - 快速查询问卷信息',
      path: '/pages/search/search',
      imageUrl: '/images/share.jpg'
    }
  }
})