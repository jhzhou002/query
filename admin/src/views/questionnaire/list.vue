<template>
  <div class="page-container">
    <div class="table-container">
      <div class="table-header">
        <h3>问卷列表</h3>
        <el-button type="primary" @click="$router.push('/questionnaire/add')">添加问卷</el-button>
      </div>
      
      <div class="table-search">
        <el-input
          v-model="searchForm.platform"
          placeholder="搜索平台"
          clearable
          @clear="loadQuestionnaires"
          @keyup.enter="loadQuestionnaires"
        />
        <el-input
          v-model="searchForm.q_number"
          placeholder="搜索问卷编号"
          clearable
          @clear="loadQuestionnaires"
          @keyup.enter="loadQuestionnaires"
        />
        <el-button type="primary" @click="loadQuestionnaires">搜索</el-button>
      </div>
      
      <el-table :data="questionnaires" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="platform" label="平台" width="120" />
        <el-table-column prop="q_number" label="问卷编号" width="150" />
        <el-table-column prop="reward_points" label="积分" width="80" />
        <el-table-column prop="notes" label="筛选条件" show-overflow-tooltip />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="$router.push(`/questionnaire/edit/${row.id}`)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteQuestionnaire(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'QuestionnaireList',
  setup() {
    const loading = ref(false)
    const questionnaires = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    
    const searchForm = reactive({
      platform: '',
      q_number: ''
    })
    
    const loadQuestionnaires = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          limit: pageSize.value,
          platform: searchForm.platform,
          q_number: searchForm.q_number
        })
        
        const response = await fetch(`/api/admin/questionnaires?${params}`)
        const result = await response.json()
        
        if (result.code === 200) {
          questionnaires.value = result.data.list || []
          total.value = result.data.total || 0
        } else {
          ElMessage.error(result.msg || '加载问卷列表失败')
        }
      } catch (error) {
        console.error('加载问卷列表失败:', error)
        ElMessage.error('加载问卷列表失败')
      } finally {
        loading.value = false
      }
    }
    
    const deleteQuestionnaire = async (row) => {
      try {
        await ElMessageBox.confirm('确定要删除这个问卷吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/admin/questionnaires/${row.id}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadQuestionnaires()
        } else {
          ElMessage.error(result.msg || '删除失败')
        }
      } catch (error) {
        // 用户取消操作
      }
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      loadQuestionnaires()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadQuestionnaires()
    }
    
    onMounted(() => {
      loadQuestionnaires()
    })
    
    return {
      loading,
      questionnaires,
      currentPage,
      pageSize,
      total,
      searchForm,
      loadQuestionnaires,
      deleteQuestionnaire,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>