<template>
  <div class="page-container">
    <h2 class="page-title">统计分析</h2>
    
    <!-- 平台统计 -->
    <div class="stats-section">
      <h3 class="section-title">平台统计</h3>
      <div class="chart-card">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" v-for="platform in platformStats" :key="platform.platform">
            <div class="platform-stat-card">
              <div class="platform-name">{{ platform.platform }}</div>
              <div class="platform-data">
                <div class="data-item">
                  <div class="data-label">问卷数量</div>
                  <div class="data-value">{{ platform.count }}</div>
                </div>
                <div class="data-item">
                  <div class="data-label">平均积分</div>
                  <div class="data-value">{{ Math.round(platform.avg_points || 0) }}</div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 会员统计 -->
    <div class="stats-section">
      <h3 class="section-title">会员统计趋势</h3>
      <div class="chart-card">
        <div v-if="memberStats.length > 0" class="member-stats">
          <div class="stats-header">
            <div class="stat-summary">
              <div class="summary-item">
                <div class="summary-label">总注册用户</div>
                <div class="summary-value">{{ totalUsers }}</div>
              </div>
              <div class="summary-item">
                <div class="summary-label">新增VIP</div>
                <div class="summary-value">{{ totalNewVips }}</div>
              </div>
            </div>
          </div>
          
          <div class="stats-timeline">
            <div
              v-for="stat in memberStats.slice(0, 10)"
              :key="stat.date"
              class="timeline-item"
            >
              <div class="timeline-date">{{ formatDate(stat.date) }}</div>
              <div class="timeline-data">
                <div class="data-bar">
                  <div class="bar-section users" :style="{ width: getBarWidth(stat.new_users, maxUsers) + '%' }">
                    {{ stat.new_users }}
                  </div>
                </div>
                <div class="data-bar">
                  <div class="bar-section vips" :style="{ width: getBarWidth(stat.new_vips, maxVips) + '%' }">
                    {{ stat.new_vips }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="stats-legend">
            <div class="legend-item">
              <div class="legend-color users"></div>
              <span>新增用户</span>
            </div>
            <div class="legend-item">
              <div class="legend-color vips"></div>
              <span>新增VIP</span>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无数据" />
      </div>
    </div>
    
    <!-- 系统概览 -->
    <div class="stats-section">
      <h3 class="section-title">系统概览</h3>
      <div class="overview-grid">
        <div class="overview-card">
          <div class="overview-icon">
            <el-icon size="32" color="#409eff"><User /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-title">用户管理</div>
            <div class="overview-desc">管理系统用户和VIP状态</div>
            <el-button type="primary" plain size="small" @click="$router.push('/user/list')">
              查看详情
            </el-button>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="overview-icon">
            <el-icon size="32" color="#67c23a"><Document /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-title">问卷管理</div>
            <div class="overview-desc">管理问卷信息和积分设置</div>
            <el-button type="success" plain size="small" @click="$router.push('/questionnaire/list')">
              查看详情
            </el-button>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="overview-icon">
            <el-icon size="32" color="#e6a23c"><Key /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-title">激活码管理</div>
            <div class="overview-desc">生成和管理VIP激活码</div>
            <el-button type="warning" plain size="small" @click="$router.push('/activation/list')">
              查看详情
            </el-button>
          </div>
        </div>
        
        <div class="overview-card">
          <div class="overview-icon">
            <el-icon size="32" color="#f56c6c"><Files /></el-icon>
          </div>
          <div class="overview-content">
            <div class="overview-title">内容管理</div>
            <div class="overview-desc">管理轮播图和公告信息</div>
            <el-button type="danger" plain size="small" @click="$router.push('/content/carousel')">
              查看详情
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'SystemStats',
  setup() {
    const platformStats = ref([])
    const memberStats = ref([])
    
    const loadPlatformStats = async () => {
      try {
        const response = await fetch('/api/admin/platform/stats')
        const result = await response.json()
        
        if (result.code === 200) {
          platformStats.value = result.data.list || []
        } else {
          ElMessage.error(result.msg || '获取平台统计失败')
        }
      } catch (error) {
        console.error('获取平台统计失败:', error)
        ElMessage.error('获取平台统计失败')
      }
    }
    
    const loadMemberStats = async () => {
      try {
        const response = await fetch('/api/admin/member/stats')
        const result = await response.json()
        
        if (result.code === 200) {
          memberStats.value = result.data.list || []
        } else {
          ElMessage.error(result.msg || '获取会员统计失败')
        }
      } catch (error) {
        console.error('获取会员统计失败:', error)
        ElMessage.error('获取会员统计失败')
      }
    }
    
    // 计算总用户数和总VIP数
    const totalUsers = computed(() => {
      return memberStats.value.reduce((sum, stat) => sum + stat.new_users, 0)
    })
    
    const totalNewVips = computed(() => {
      return memberStats.value.reduce((sum, stat) => sum + stat.new_vips, 0)
    })
    
    // 计算最大值，用于绘制条形图
    const maxUsers = computed(() => {
      return Math.max(...memberStats.value.map(stat => stat.new_users), 1)
    })
    
    const maxVips = computed(() => {
      return Math.max(...memberStats.value.map(stat => stat.new_vips), 1)
    })
    
    // 计算条形图宽度百分比
    const getBarWidth = (value, max) => {
      return Math.max((value / max) * 100, 5) // 最小5%宽度
    }
    
    // 格式化日期
    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}/${date.getDate()}`
    }
    
    onMounted(() => {
      loadPlatformStats()
      loadMemberStats()
    })
    
    return {
      platformStats,
      memberStats,
      totalUsers,
      totalNewVips,
      maxUsers,
      maxVips,
      getBarWidth,
      formatDate
    }
  }
}
</script>

<style scoped>
.page-title {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

.stats-section {
  margin-bottom: 40px;
}

.section-title {
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.platform-stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  text-align: center;
  margin-bottom: 20px;
  transition: transform 0.2s ease;
}

.platform-stat-card:hover {
  transform: translateY(-2px);
}

.platform-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.platform-data {
  display: flex;
  justify-content: space-around;
}

.data-item {
  flex: 1;
}

.data-label {
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.data-value {
  font-size: 24px;
  font-weight: bold;
}

.member-stats {
  padding: 20px 0;
}

.stats-header {
  margin-bottom: 30px;
}

.stat-summary {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 8px;
}

.summary-value {
  color: #2c3e50;
  font-size: 28px;
  font-weight: bold;
}

.stats-timeline {
  margin-bottom: 20px;
}

.timeline-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.timeline-date {
  width: 80px;
  font-weight: 600;
  color: #2c3e50;
  flex-shrink: 0;
}

.timeline-data {
  flex: 1;
  margin-left: 20px;
}

.data-bar {
  margin-bottom: 8px;
  height: 24px;
  background: #ecf0f1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.bar-section {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
  min-width: 24px;
  transition: width 0.3s ease;
}

.bar-section.users {
  background: linear-gradient(135deg, #409eff, #66b3ff);
}

.bar-section.vips {
  background: linear-gradient(135deg, #f39c12, #f5b041);
}

.stats-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #7f8c8d;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-color.users {
  background: linear-gradient(135deg, #409eff, #66b3ff);
}

.legend-color.vips {
  background: linear-gradient(135deg, #f39c12, #f5b041);
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.overview-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overview-content {
  flex: 1;
}

.overview-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.overview-desc {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 12px;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .chart-card {
    padding: 16px;
  }
  
  .platform-stat-card {
    padding: 16px;
  }
  
  .platform-data {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-summary {
    flex-direction: column;
    gap: 20px;
  }
  
  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .timeline-data {
    margin-left: 0;
    width: 100%;
  }
  
  .overview-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
  }
  
  .stats-legend {
    flex-direction: column;
    gap: 12px;
  }
}
</style>