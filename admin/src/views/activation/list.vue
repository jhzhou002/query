<template>
  <div class="page-container">
    <div class="table-container">
      <div class="table-header">
        <h3>激活码管理</h3>
        <el-button type="primary" @click="showGenerateDialog = true">生成激活码</el-button>
      </div>
      
      <div class="table-search">
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="loadActivationCodes">
          <el-option label="全部" value="" />
          <el-option label="未使用" :value="0" />
          <el-option label="已使用" :value="1" />
        </el-select>
      </div>
      
      <el-table :data="activationCodes" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="激活码" width="200" />
        <el-table-column prop="duration_days" label="有效天数" width="100" />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '未使用' : '已使用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="used_by_name" label="使用者" width="120" />
        <el-table-column prop="used_at" label="使用时间" width="180" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
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
    
    <!-- 生成激活码对话框 -->
    <el-dialog v-model="showGenerateDialog" title="生成激活码" width="400px">
      <el-form :model="generateForm" :rules="generateRules" ref="generateFormRef" label-width="100px">
        <el-form-item label="生成数量" prop="count">
          <el-input-number v-model="generateForm.count" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="有效天数" prop="duration_days">
          <el-input-number v-model="generateForm.duration_days" :min="1" :max="365" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="generateForm.description" placeholder="请输入描述（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGenerateDialog = false">取消</el-button>
        <el-button type="primary" @click="generateCodes" :loading="generating">生成</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ActivationList',
  setup() {
    const generateFormRef = ref()
    const loading = ref(false)
    const generating = ref(false)
    const activationCodes = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    const statusFilter = ref('')
    const showGenerateDialog = ref(false)
    
    const generateForm = reactive({
      count: 1,
      duration_days: 30,
      description: ''
    })
    
    const generateRules = {
      count: [{ required: true, type: 'number', min: 1, max: 100, message: '数量必须在1-100之间', trigger: 'blur' }],
      duration_days: [{ required: true, type: 'number', min: 1, max: 365, message: '天数必须在1-365之间', trigger: 'blur' }]
    }
    
    const loadActivationCodes = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          limit: pageSize.value
        })
        
        if (statusFilter.value !== '') {
          params.append('status', statusFilter.value)
        }
        
        const response = await fetch(`/api/admin/activation-codes?${params}`)
        const result = await response.json()
        
        if (result.code === 200) {
          activationCodes.value = result.data.list || []
          total.value = result.data.total || 0
        } else {
          ElMessage.error(result.msg || '加载激活码失败')
        }
      } catch (error) {
        console.error('加载激活码失败:', error)
        ElMessage.error('加载激活码失败')
      } finally {
        loading.value = false
      }
    }
    
    const generateCodes = async () => {
      if (!generateFormRef.value) return
      
      try {
        const valid = await generateFormRef.value.validate()
        if (!valid) return
        
        generating.value = true
        
        const response = await fetch('/api/admin/activation-codes/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(generateForm)
        })
        
        const result = await response.json()
        
        if (result.code === 200) {
          ElMessage.success(`成功生成 ${result.data.generated_count} 个激活码`)
          showGenerateDialog.value = false
          generateForm.count = 1
          generateForm.duration_days = 30
          generateForm.description = ''
          loadActivationCodes()
        } else {
          ElMessage.error(result.msg || '生成失败')
        }
      } catch (error) {
        console.error('生成激活码失败:', error)
        ElMessage.error('生成失败')
      } finally {
        generating.value = false
      }
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      loadActivationCodes()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadActivationCodes()
    }
    
    onMounted(() => {
      loadActivationCodes()
    })
    
    return {
      generateFormRef,
      loading,
      generating,
      activationCodes,
      currentPage,
      pageSize,
      total,
      statusFilter,
      showGenerateDialog,
      generateForm,
      generateRules,
      loadActivationCodes,
      generateCodes,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>