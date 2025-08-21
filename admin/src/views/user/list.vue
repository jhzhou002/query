<template>
  <div class="page-container">
    <div class="table-container">
      <div class="table-header">
        <h3>用户列表</h3>
      </div>
      
      <div class="table-search">
        <el-input
          v-model="searchForm.search"
          placeholder="搜索用户昵称或手机号"
          clearable
          @clear="loadUsers"
          @keyup.enter="loadUsers"
        />
        <el-button type="primary" @click="loadUsers">搜索</el-button>
      </div>
      
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nick_name" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column label="VIP状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_vip ? 'success' : 'info'">
              {{ row.is_vip ? 'VIP' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="vip_expiry_date" label="VIP到期时间" width="180" />
        <el-table-column prop="created_at" label="注册时间" width="180" />
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
import { ElMessage } from 'element-plus'

export default {
  name: 'UserList',
  setup() {
    const loading = ref(false)
    const users = ref([])
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    
    const searchForm = reactive({
      search: ''
    })
    
    const loadUsers = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams({
          page: currentPage.value,
          limit: pageSize.value,
          search: searchForm.search
        })
        
        const response = await fetch(`/api/admin/users?${params}`)
        const result = await response.json()
        
        if (result.code === 200) {
          users.value = result.data.list || []
          total.value = result.data.total || 0
        } else {
          ElMessage.error(result.msg || '加载用户列表失败')
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        ElMessage.error('加载用户列表失败')
      } finally {
        loading.value = false
      }
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      loadUsers()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadUsers()
    }
    
    onMounted(() => {
      loadUsers()
    })
    
    return {
      loading,
      users,
      currentPage,
      pageSize,
      total,
      searchForm,
      loadUsers,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>