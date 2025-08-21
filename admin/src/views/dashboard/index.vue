<template>
  <div class="page-container">
    <h2 class="page-title">仪表板</h2>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <div class="stats-card stats-users">
          <div class="stats-content">
            <div class="stats-number">{{ stats.users?.total_users || 0 }}</div>
            <div class="stats-title">总用户数</div>
          </div>
          <div class="stats-icon">
            <el-icon size="40"><User /></el-icon>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <div class="stats-card stats-vips">
          <div class="stats-content">
            <div class="stats-number">{{ stats.users?.vip_users || 0 }}</div>
            <div class="stats-title">VIP用户</div>
          </div>
          <div class="stats-icon">
            <el-icon size="40"><Crown /></el-icon>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <div class="stats-card stats-questionnaires">
          <div class="stats-content">
            <div class="stats-number">{{ stats.questionnaires?.total_questionnaires || 0 }}</div>
            <div class="stats-title">问卷总数</div>
          </div>
          <div class="stats-icon">
            <el-icon size="40"><Document /></el-icon>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <div class="stats-card stats-queries">
          <div class="stats-content">
            <div class="stats-number">{{ stats.queries?.total_queries || 0 }}</div>
            <div class="stats-title">查询总数</div>
          </div>
          <div class="stats-icon">
            <el-icon size="40"><Search /></el-icon>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="12">
        <div class="chart-card">
          <h3>平台分布</h3>
          <div v-if="platformStats.length > 0" class="platform-list">
            <div
              v-for="platform in platformStats"
              :key="platform.platform"
              class="platform-item"
            >
              <div class="platform-name">{{ platform.platform }}</div>
              <div class="platform-count">{{ platform.count }} 个问卷</div>
              <div class="platform-points">平均 {{ Math.round(platform.avg_points || 0) }} 积分</div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="12" :lg="12">
        <div class="chart-card">
          <h3>激活码统计</h3>
          <div v-if="stats.activationCodes" class="activation-stats">
            <div class="activation-item">
              <div class="activation-label">总激活码</div>
              <div class="activation-value">{{ stats.activationCodes.total }}</div>
            </div>
            <div class="activation-item">
              <div class="activation-label">未使用</div>
              <div class="activation-value unused">{{ stats.activationCodes.unused }}</div>
            </div>
            <div class="activation-item">
              <div class="activation-label">已使用</div>
              <div class="activation-value used">{{ stats.activationCodes.used }}</div>
            </div>
          </div>
          <el-empty v-else description="暂无数据" />
        </div>
      </el-col>
    </el-row>
    
    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>快速操作</h3>
      <el-row :gutter="15">
        <el-col :xs="12" :sm="8" :md="6" :lg="4">
          <el-button type="primary" plain @click="$router.push('/questionnaire/add')" class="action-btn">
            <el-icon><Plus /></el-icon>
            添加问卷
          </el-button>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4">
          <el-button type="success" plain @click="$router.push('/activation/list')" class="action-btn">
            <el-icon><Key /></el-icon>
            激活码管理
          </el-button>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4">
          <el-button type="info" plain @click="$router.push('/user/list')" class="action-btn">
            <el-icon><User /></el-icon>
            用户管理
          </el-button>
        </el-col>
        <el-col :xs="12" :sm="8" :md="6" :lg="4">
          <el-button type="warning" plain @click="$router.push('/system/stats')" class="action-btn">
            <el-icon><TrendCharts /></el-icon>
            统计分析
          </el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Dashboard',
  setup() {
    const stats = ref({})
    const platformStats = ref([])
    
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats')
        const result = await response.json()
        
        if (result.code === 200) {
          stats.value = result.data
        } else {
          ElMessage.error(result.msg || '获取统计数据失败')
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
        ElMessage.error('获取统计数据失败')
      }
    }
    
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
    
    onMounted(() => {
      loadStats()
      loadPlatformStats()
    })
    
    return {
      stats,
      platformStats
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

.stats-row {
  margin-bottom: 30px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 32px;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 8px;
}

.stats-title {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.stats-icon {
  opacity: 0.3;
  color: #409eff;
}

.stats-users .stats-number { color: #409eff; }
.stats-vips .stats-number { color: #f39c12; }
.stats-questionnaires .stats-number { color: #27ae60; }
.stats-queries .stats-number { color: #e74c3c; }

.charts-row {
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.chart-card h3 {
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.platform-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.platform-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.platform-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.platform-count {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 2px;
}

.platform-points {
  color: #95a5a6;
  font-size: 13px;
}

.activation-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.activation-item {
  flex: 1;
}

.activation-label {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 8px;
}

.activation-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.activation-value.unused {
  color: #27ae60;
}

.activation-value.used {
  color: #e74c3c;
}

.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.action-btn {
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .stats-card {
    padding: 16px;
    margin-bottom: 15px;
  }
  
  .stats-number {
    font-size: 24px;
  }
  
  .chart-card {
    padding: 16px;
    margin-bottom: 15px;
  }
  
  .activation-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .activation-value {
    font-size: 20px;
  }
  
  .action-btn {
    height: 50px;
    font-size: 14px;
  }
}
</style>