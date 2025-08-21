<template>
  <div class="page-container">
    <div class="form-container">
      <h2 class="form-title">添加问卷</h2>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        v-loading="loading"
      >
        <el-form-item label="问卷平台" prop="platform">
          <el-select v-model="form.platform" placeholder="请选择问卷平台">
            <el-option label="问卷星" value="问卷星" />
            <el-option label="腾讯问卷" value="腾讯问卷" />
            <el-option label="金数据" value="金数据" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="问卷编号" prop="q_number">
          <el-input v-model="form.q_number" placeholder="请输入问卷编号" />
        </el-form-item>
        
        <el-form-item label="积分" prop="reward_points">
          <el-input-number v-model="form.reward_points" :min="1" :max="1000" />
        </el-form-item>
        
        <el-form-item label="筛选条件说明" prop="notes">
          <el-input
            v-model="form.notes"
            type="textarea"
            :rows="4"
            placeholder="请输入筛选条件说明，如：年龄:18-25, 职业:学生, 性别:不限"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            {{ loading ? '提交中...' : '提交' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="$router.go(-1)">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export default {
  name: 'QuestionnaireAdd',
  setup() {
    const router = useRouter()
    const formRef = ref()
    const loading = ref(false)
    
    const form = reactive({
      platform: '',
      q_number: '',
      reward_points: 10,
      notes: ''
    })
    
    const rules = {
      platform: [
        { required: true, message: '请选择问卷平台', trigger: 'change' }
      ],
      q_number: [
        { required: true, message: '请输入问卷编号', trigger: 'blur' },
        { min: 3, max: 20, message: '问卷编号长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      reward_points: [
        { required: true, message: '请输入积分', trigger: 'blur' },
        { type: 'number', min: 1, message: '积分不能小于1', trigger: 'blur' }
      ],
      notes: [
        { max: 500, message: '筛选条件说明不能超过500个字符', trigger: 'blur' }
      ]
    }
    
    const handleSubmit = async () => {
      if (!formRef.value) return
      
      try {
        const valid = await formRef.value.validate()
        if (!valid) return
        
        loading.value = true
        
        const response = await fetch('/api/admin/questionnaires', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        })
        
        const result = await response.json()
        
        if (result.code === 200) {
          ElMessage.success('问卷添加成功')
          router.push('/questionnaire/list')
        } else {
          ElMessage.error(result.msg || '添加失败')
        }
        
      } catch (error) {
        console.error('添加问卷失败:', error)
        ElMessage.error('添加失败，请重试')
      } finally {
        loading.value = false
      }
    }
    
    const handleReset = () => {
      formRef.value?.resetFields()
    }
    
    return {
      formRef,
      form,
      rules,
      loading,
      handleSubmit,
      handleReset
    }
  }
}
</script>