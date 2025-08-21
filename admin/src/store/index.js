import { createStore } from 'vuex'

export default createStore({
  state: {
    // 用户信息
    user: {
      username: '',
      token: ''
    },
    
    // 侧边栏状态
    sidebar: {
      opened: true,
      withoutAnimation: false
    },
    
    // 系统设置
    settings: {
      theme: 'default',
      fixedHeader: true,
      sidebarLogo: true
    }
  },
  
  getters: {
    // 获取用户信息
    user: state => state.user,
    
    // 获取侧边栏状态
    sidebar: state => state.sidebar,
    
    // 获取系统设置
    settings: state => state.settings
  },
  
  mutations: {
    // 设置用户信息
    SET_USER(state, user) {
      state.user = user
    },
    
    // 清除用户信息
    CLEAR_USER(state) {
      state.user = {
        username: '',
        token: ''
      }
    },
    
    // 切换侧边栏
    TOGGLE_SIDEBAR(state) {
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    
    // 关闭侧边栏
    CLOSE_SIDEBAR(state, withoutAnimation) {
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    
    // 更新设置
    UPDATE_SETTINGS(state, settings) {
      state.settings = { ...state.settings, ...settings }
    }
  },
  
  actions: {
    // 登录
    login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        // 这里可以调用登录API
        commit('SET_USER', userInfo)
        localStorage.setItem('admin_token', userInfo.token)
        localStorage.setItem('admin_user', JSON.stringify(userInfo))
        resolve(userInfo)
      })
    },
    
    // 登出
    logout({ commit }) {
      return new Promise(resolve => {
        commit('CLEAR_USER')
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        resolve()
      })
    },
    
    // 从本地存储恢复用户信息
    restoreUser({ commit }) {
      const token = localStorage.getItem('admin_token')
      const userStr = localStorage.getItem('admin_user')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr)
          commit('SET_USER', { ...user, token })
        } catch (error) {
          console.error('恢复用户信息失败:', error)
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_user')
        }
      }
    },
    
    // 切换侧边栏
    toggleSideBar({ commit }) {
      commit('TOGGLE_SIDEBAR')
    },
    
    // 关闭侧边栏
    closeSideBar({ commit }, withoutAnimation) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    
    // 更新设置
    updateSettings({ commit }, settings) {
      commit('UPDATE_SETTINGS', settings)
    }
  }
})