<template>
  <div class="page-container">
    <div class="table-container">
      <div class="table-header">
        <h3>轮播图管理</h3>
        <el-button type="primary" @click="showAddDialog = true">添加轮播图</el-button>
      </div>
      
      <el-table
        :data="carousels"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="图片" width="120">
          <template #default="{ row }">
            <img :src="row.image_url" class="image-preview" @error="handleImageError" />
          </template>
        </el-table-column>
        <el-table-column prop="link" label="跳转链接" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" />
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
            <div class="table-actions">
              <el-button size="small" @click="editCarousel(row)">编辑</el-button>
              <el-button 
                size="small" 
                :type="row.status === 1 ? 'warning' : 'success'"
                @click="toggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="danger" @click="deleteCarousel(row)">删除</el-button>
            </div>
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
    <el-dialog
      v-model="showDialog"
      :title="isEdit ? '编辑轮播图' : '添加轮播图'"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="轮播图片" prop="image_url">
          <el-upload
            class="carousel-uploader"
            action="/api/admin/upload/carousel-image"
            name="image"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            accept="image/*"
            :loading="uploading"
          >
            <img v-if="form.image_url" :src="form.image_url" class="carousel-preview" />
            <el-icon v-else class="carousel-uploader-icon"><Plus /></el-icon>
            <div v-if="!form.image_url" class="upload-text">点击上传轮播图</div>
          </el-upload>
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="form.link" placeholder="请输入跳转链接（可选）" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
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
        <el-button type="primary" @click="saveCarousel" :loading="saving">
          {{ saving ? '保存中...' : '保存' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'CarouselManage',
  setup() {
    const formRef = ref()
    const loading = ref(false)
    const saving = ref(false)
    const uploading = ref(false)
    const carousels = ref([])
    const showDialog = ref(false)
    const isEdit = ref(false)
    const currentPage = ref(1)
    const pageSize = ref(20)
    const total = ref(0)
    
    const form = reactive({
      id: null,
      image_url: '',
      link: '',
      sort: 0,
      status: 1
    })
    
    const rules = {
      image_url: [
        { required: true, message: '请上传轮播图片', trigger: 'change' }
      ]
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
    
    const loadCarousels = async () => {
      loading.value = true
      try {
        const response = await fetch(`/api/admin/carousels?page=${currentPage.value}&limit=${pageSize.value}`)
        const result = await response.json()
        
        if (result.code === 200) {
          carousels.value = result.data.list || []
          total.value = result.data.total || 0
        } else {
          ElMessage.error(result.msg || '加载轮播图失败')
        }
      } catch (error) {
        console.error('加载轮播图失败:', error)
        ElMessage.error('加载轮播图失败')
      } finally {
        loading.value = false
      }
    }
    
    const resetForm = () => {
      form.id = null
      form.image_url = ''
      form.link = ''
      form.sort = 0
      form.status = 1
      formRef.value?.clearValidate()
    }
    
    const editCarousel = (item) => {
      isEdit.value = true
      form.id = item.id
      form.image_url = item.image_url
      form.link = item.link || ''
      form.sort = item.sort
      form.status = item.status
      showDialog.value = true
    }
    
    const saveCarousel = async () => {
      if (!formRef.value) return
      
      try {
        const valid = await formRef.value.validate()
        if (!valid) return
        
        saving.value = true
        
        const requestData = {
          image_url: form.image_url,
          link: form.link,
          sort: form.sort,
          status: form.status
        }
        
        let response
        if (isEdit.value) {
          response = await fetch(`/api/admin/carousels/${form.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          })
        } else {
          response = await fetch('/api/admin/carousels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
          })
        }
        
        const result = await response.json()
        
        if (result.code === 200) {
          ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
          closeDialog()
          loadCarousels()
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
      const action = item.status === 1 ? '禁用' : '启用'
      try {
        await ElMessageBox.confirm(`确定要${action}这个轮播图吗？`, '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/admin/carousels/${item.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...item,
            status: item.status === 1 ? 0 : 1
          })
        })
        
        const result = await response.json()
        
        if (result.code === 200) {
          ElMessage.success(`${action}成功`)
          loadCarousels()
        } else {
          ElMessage.error(result.msg || `${action}失败`)
        }
      } catch (error) {
        // 用户取消操作
      }
    }
    
    const deleteCarousel = async (item) => {
      try {
        await ElMessageBox.confirm('确定要删除这个轮播图吗？', '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const response = await fetch(`/api/admin/carousels/${item.id}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (result.code === 200) {
          ElMessage.success('删除成功')
          loadCarousels()
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
    
    const beforeUpload = (file) => {
      const isImage = file.type.startsWith('image/')
      const isLt5M = file.size / 1024 / 1024 < 5

      if (!isImage) {
        ElMessage.error('只能上传图片文件')
        return false
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB')
        return false
      }
      
      uploading.value = true
      return true
    }
    
    const handleUploadSuccess = (response) => {
      uploading.value = false
      if (response.code === 200) {
        form.image_url = response.data.url
        ElMessage.success('图片上传成功')
        formRef.value?.validateField('image_url')
      } else {
        ElMessage.error(response.msg || '图片上传失败')
      }
    }
    
    const handleUploadError = (error) => {
      uploading.value = false
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败，请重试')
    }
    
    const handleImageError = (event) => {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTAwIDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNjQiIGZpbGw9IiNGNUY1RjUiLz48dGV4dCB4PSI1MCIgeT0iMzgiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIiPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4='
    }
    
    const handleSizeChange = (val) => {
      pageSize.value = val
      loadCarousels()
    }
    
    const handleCurrentChange = (val) => {
      currentPage.value = val
      loadCarousels()
    }
    
    onMounted(() => {
      loadCarousels()
    })
    
    return {
      formRef,
      loading,
      saving,
      uploading,
      carousels,
      showDialog,
      showAddDialog,
      isEdit,
      form,
      rules,
      currentPage,
      pageSize,
      total,
      editCarousel,
      saveCarousel,
      toggleStatus,
      deleteCarousel,
      closeDialog,
      beforeUpload,
      handleUploadSuccess,
      handleUploadError,
      handleImageError,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.image-preview {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.image-preview:hover {
  transform: scale(1.1);
}

.carousel-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 200px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.carousel-uploader:hover {
  border-color: #409eff;
}

.carousel-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.carousel-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.upload-text {
  color: #606266;
  font-size: 14px;
}
</style>