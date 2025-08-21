<template>
  <div class="page-container">
    <div class="table-container">
      <div class="table-header">
        <h3>公告管理</h3>
        <el-button type="primary" @click="showAddDialog = true">添加公告</el-button>
      </div>
      
      <el-table :data="announcements" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editAnnouncement(row)">编辑</el-button>
            <el-button size="small" :type="row.status === 1 ? 'warning' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="deleteAnnouncement(row)">删除</el-button>
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
    
    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="showDialog" :title="isEdit ? '编辑公告' : '添加公告'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" placeholder="请输入公告内容" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveAnnouncement" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AnnouncementManage',
  setup() {
    const formRef = ref()
    const loading = ref(false)
    const saving = ref(false)
    const announcements = ref([])
    const showDialog = ref(false)
    const isEdit = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    
    const form = reactive({
      id: null,
      title: '',
      content: '',
      status: 1
    })
    
    const rules = {
      title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
      content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
    }
    
    const showAddDialog = computed({
      get: () => showDialog.value && !isEdit.value,
      set: (value) => {
        if (value) {
          isEdit.value = false
          resetForm()
          showDialog.value = true
        }
      }
    })
    
    const loadAnnouncements = async () => {
      loading.value = true
      try {
        const response = await fetch(`/api/admin/announcements?page=${currentPage.value}&limit=${pageSize.value}`)
        const result = await response.json()
        
        if (result.code === 200) {
          announcements.value = result.data.list || []
          total.value = result.data.total || 0
        } else {
          ElMessage.error(result.msg || '加载公告失败')
        }
      } catch (error) {
        console.error('加载公告失败:', error)
        ElMessage.error('加载公告失败')
      } finally {
        loading.value = false
      }
    }
    
    const resetForm = () => {
      form.id = null
      form.title = ''
      form.content = ''
      form.status = 1
      formRef.value?.clearValidate()
    }
    
    const editAnnouncement = (item) => {
      isEdit.value = true
      form.id = item.id
      form.title = item.title
      form.content = item.content
      form.status = item.status
      showDialog.value = true
    }
    
    const saveAnnouncement = async () => {
      if (!formRef.value) return
      
      try {
        const valid = await formRef.value.validate()
        if (!valid) return
        
        saving.value = true
        
        let response
        if (isEdit.value) {
          response = await fetch(`/api/admin/announcements/${form.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
          })
        } else {
          response = await fetch('/api/admin/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
          })
        }
        
        const result = await response.json()
        
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          closeDialog()
          loadAnnouncements()
        } else {
          ElMessage.error(result.msg || '保存失败')
        }
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      } finally {
        saving.value = false
      }
    }
    
    const toggleStatus = async (item) => {
      try {
        const response = await fetch(`/api/admin/announcements/${item.id}/status`, {
          method: 'PATCH'
        })
        
        const result = await response.json()
        
        if (result.code === 200) {
          ElMessage.success('状态切换成功')
          loadAnnouncements()
        } else {
          ElMessage.error(result.msg || '操作失败')
        }
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
    
    const deleteAnnouncement = async (item) => {
      try {
        await ElMessageBox.confirm('确定要删除这个公告吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/admin/announcements/${item.id}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadAnnouncements()
        } else {
          ElMessage.error(result.msg || '删除失败')
        }
      } catch (error) {
        // 用户取消操作
      }
    }
    
    const closeDialog = () => {
      showDialog.value = false
      resetForm()
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      loadAnnouncements()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadAnnouncements()
    }
    
    onMounted(() => {
      loadAnnouncements()
    })
    
    return {
      formRef,
      loading,
      saving,
      announcements,
      showDialog,
      showAddDialog,
      isEdit,
      form,
      rules,
      currentPage,
      pageSize,
      total,
      editAnnouncement,
      saveAnnouncement,
      toggleStatus,
      deleteAnnouncement,
      closeDialog,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>