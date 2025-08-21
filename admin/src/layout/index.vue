<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="sidebar.opened ? '200px' : '64px'" class="sidebar-container">
      <div class="logo-container">
        <h3 v-if="sidebar.opened" class="logo-title">问卷查询系统</h3>
        <el-icon v-else class="logo-icon" size="24"><Document /></el-icon>
      </div>
      
      <el-menu
        :default-active="$route.path"
        :collapse="!sidebar.opened"
        :unique-opened="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
        class="sidebar-menu"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-sub-menu v-if="route.children && route.children.length > 1" :index="route.path">
            <template #title>
              <el-icon><component :is="route.meta.icon || 'Menu'" /></el-icon>
              <span>{{ route.meta.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="child.path.startsWith('/') ? child.path : route.path + '/' + child.path"
            >
              {{ child.meta.title }}
            </el-menu-item>
          </el-sub-menu>
          
          <el-menu-item
            v-else-if="route.children && route.children.length === 1"
            :index="route.children[0].path.startsWith('/') ? route.children[0].path : route.path + '/' + route.children[0].path"
          >
            <el-icon><component :is="route.meta.icon || 'Menu'" /></el-icon>
            <template #title>{{ route.meta.title }}</template>
          </el-menu-item>
          
          <el-menu-item v-else :index="route.path">
            <el-icon><component :is="route.meta.icon || 'Menu'" /></el-icon>
            <template #title>{{ route.meta.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    
    <!-- 主体区域 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header-container">
        <div class="header-left">
          <el-icon class="hamburger" @click="toggleSidebar" size="20">
            <Fold v-if="sidebar.opened" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-avatar">
              <el-icon size="20"><User /></el-icon>
              <span class="username">{{ user.username || '管理员' }}</span>
              <el-icon size="12"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'Layout',
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    
    // 从store获取状态
    const user = computed(() => store.getters.user)
    const sidebar = computed(() => store.getters.sidebar)
    
    // 菜单路由
    const menuRoutes = computed(() => {
      return router.options.routes.filter(route => {
        return route.meta && route.meta.title && route.path !== '/login' && route.path !== '/404' && !route.path.includes('*')
      })
    })
    
    // 面包屑导航
    const breadcrumbs = computed(() => {
      const matched = route.matched.filter(item => item.meta && item.meta.title)
      return matched.map(item => ({
        title: item.meta.title,
        path: item.path
      }))
    })
    
    // 切换侧边栏
    const toggleSidebar = () => {
      store.dispatch('toggleSideBar')
    }
    
    // 处理用户操作
    const handleCommand = async (command) => {
      switch (command) {
        case 'logout':
          try {
            await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
              type: 'warning',
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            })
            
            await store.dispatch('logout')
            ElMessage.success('退出成功')
            router.push('/login')
          } catch (error) {
            // 用户取消操作
          }
          break
      }
    }
    
    // 恢复用户信息
    store.dispatch('restoreUser')
    
    return {
      user,
      sidebar,
      menuRoutes,
      breadcrumbs,
      toggleSidebar,
      handleCommand
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar-container {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #2b3442;
  border-bottom: 1px solid #1d2429;
}

.logo-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;
}

.logo-icon {
  color: #ffffff;
}

.sidebar-menu {
  border: none;
  height: calc(100vh - 60px);
  width: 100% !important;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

.main-container {
  height: 100vh;
}

.header-container {
  background-color: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.hamburger {
  cursor: pointer;
  color: #5a6169;
  transition: color 0.2s;
}

.hamburger:hover {
  color: #409eff;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-avatar:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #606266;
}

.main-content {
  background-color: #f0f2f5;
  padding: 0;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-left {
    gap: 10px;
  }
  
  .breadcrumb {
    display: none;
  }
  
  .username {
    display: none;
  }
  
  .header-container {
    padding: 0 15px;
  }
}
</style>