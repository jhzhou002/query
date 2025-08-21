import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('@/layout/index.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '仪表板',
          icon: 'Odometer'
        }
      }
    ]
  },
  {
    path: '/questionnaire',
    component: () => import('@/layout/index.vue'),
    meta: {
      title: '问卷管理',
      icon: 'Document',
      requiresAuth: true
    },
    children: [
      {
        path: 'list',
        name: 'QuestionnaireList',
        component: () => import('@/views/questionnaire/list.vue'),
        meta: {
          title: '问卷列表'
        }
      },
      {
        path: 'add',
        name: 'QuestionnaireAdd',
        component: () => import('@/views/questionnaire/add.vue'),
        meta: {
          title: '添加问卷'
        }
      },
      {
        path: 'edit/:id',
        name: 'QuestionnaireEdit',
        component: () => import('@/views/questionnaire/edit.vue'),
        meta: {
          title: '编辑问卷'
        }
      }
    ]
  },
  {
    path: '/user',
    component: () => import('@/layout/index.vue'),
    meta: {
      title: '用户管理',
      icon: 'User',
      requiresAuth: true
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/user/list.vue'),
        meta: {
          title: '用户列表'
        }
      }
    ]
  },
  {
    path: '/content',
    component: () => import('@/layout/index.vue'),
    meta: {
      title: '内容管理',
      icon: 'Files',
      requiresAuth: true
    },
    children: [
      {
        path: 'carousel',
        name: 'CarouselManage',
        component: () => import('@/views/content/carousel.vue'),
        meta: {
          title: '轮播图管理'
        }
      },
      {
        path: 'announcement',
        name: 'AnnouncementManage',
        component: () => import('@/views/content/announcement.vue'),
        meta: {
          title: '公告管理'
        }
      }
    ]
  },
  {
    path: '/activation',
    component: () => import('@/layout/index.vue'),
    meta: {
      title: '激活码管理',
      icon: 'Key',
      requiresAuth: true
    },
    children: [
      {
        path: 'list',
        name: 'ActivationList',
        component: () => import('@/views/activation/list.vue'),
        meta: {
          title: '激活码列表'
        }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/layout/index.vue'),
    meta: {
      title: '系统管理',
      icon: 'Setting',
      requiresAuth: true
    },
    children: [
      {
        path: 'stats',
        name: 'SystemStats',
        component: () => import('@/views/system/stats.vue'),
        meta: {
          title: '统计分析'
        }
      }
    ]
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 问卷查询系统管理后台`
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth !== false) {
    const token = localStorage.getItem('admin_token')
    if (!token && to.path !== '/login') {
      next('/login')
      return
    }
  }
  
  // 已登录用户访问登录页面，重定向到首页
  if (to.path === '/login' && localStorage.getItem('admin_token')) {
    next('/')
    return
  }
  
  next()
})

export default router