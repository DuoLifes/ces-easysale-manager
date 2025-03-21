<template>
  <div class="page-container">
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="account-form"
      >
        <div class="form-content">
          <el-form-item label="运营商：" prop="carrier" required>
            <el-select v-model="formData.carrier" placeholder="请选择运营商" class="form-select">
              <el-option label="移动" value="移动" />
              <el-option label="联通" value="联通" />
              <el-option label="电信" value="电信" />
            </el-select>
          </el-form-item>

          <el-form-item label="局点：" prop="siteName" required>
            <el-select
              v-model="formData.siteName"
              placeholder="请选择局点"
              class="form-select"
              :loading="loading.site"
            >
              <el-option
                v-for="item in siteOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="用户账号：" prop="userAccount" required>
            <el-input
              v-model="formData.userAccount"
              placeholder="请输入用户账号"
              class="form-input"
            />
          </el-form-item>

          <el-form-item label="用户名称：" prop="userName" required>
            <el-input v-model="formData.userName" placeholder="请输入用户名称" class="form-input" />
          </el-form-item>

          <el-form-item label="有效期配置：" prop="validityType" required>
            <div class="validity-config">
              <el-radio-group v-model="formData.validityType" class="validity-radio-group">
                <el-radio :value="'permanent'">永久</el-radio>
                <el-radio :value="'custom'">自定义</el-radio>
              </el-radio-group>
              <div v-if="formData.validityType === 'custom'" class="validity-date">
                <el-date-picker
                  v-model="formData.validUntil"
                  type="date"
                  placeholder="截止到"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disablePastDates"
                />
                <span class="validity-text">前有效</span>
              </div>
            </div>
          </el-form-item>
        </div>

        <div class="form-footer">
          <div class="form-buttons">
            <el-button type="primary" @click="handleSubmit">确定</el-button>
            <el-popconfirm
              title="新建数据未保存，是否确定返回？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleBack"
              width="300"
            >
              <template #reference>
                <el-button>返回</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { fetchSiteData, addAccount } from '@/api'

const router = useRouter()
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  carrier: '',
  siteName: '',
  userAccount: '',
  userName: '',
  validityType: 'permanent',
  validUntil: '',
})

// 加载状态
const loading = reactive({
  site: false,
})

// 局点选项
const siteOptions = ref<{ label: string; value: string }[]>([])

// 表单验证规则
const rules = {
  carrier: [{ required: true, message: '请选择运营商', trigger: 'change' }],
  siteName: [{ required: true, message: '请选择局点', trigger: 'change' }],
  userAccount: [
    { required: true, message: '请输入用户账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  userName: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  validityType: [{ required: true, message: '请选择有效期类型', trigger: 'change' }],
}

// 禁用过去的日期
const disablePastDates = (date: Date) => {
  return date.getTime() < Date.now() - 8.64e7 // 禁用今天之前的日期
}

// 获取局点列表
const getSiteList = async () => {
  try {
    loading.site = true
    const res = await fetchSiteData()
    if (res.code === 200) {
      siteOptions.value = (res.data.list || []).map((site: any) => ({
        label: site.siteName,
        value: site.siteName,
      }))
    }
  } catch (error) {
    console.error('获取局点列表失败:', error)
    ElMessage.error('获取局点列表失败')
  } finally {
    loading.site = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 处理提交数据
        const submitData = {
          ...formData,
          validUntil: formData.validityType === 'permanent' ? '9999-12-31' : formData.validUntil,
          creator: localStorage.getItem('username') || 'admin', // 从localStorage获取当前用户名
        }

        // 调用创建账号API
        const res = await addAccount(submitData)
        if (res.code === 200) {
          ElMessage.success('创建成功')
          router.push('/account')
        } else {
          ElMessage.error(res.msg || '创建失败')
        }
      } catch (error) {
        console.error('创建账号失败:', error)
        ElMessage.error('创建账号失败')
      }
    }
  })
}

// 返回上一页
const handleBack = () => {
  router.push('/account')
}

// 页面加载时获取局点列表
onMounted(() => {
  getSiteList()
})
</script>

<style scoped>
.page-container {
  height: calc(100vh - 120px); /* 减去头部和面包屑的高度 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.form-container {
  background-color: #fff;
  border-radius: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 50px;
}

.account-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  padding: 20px 0;
}

.form-footer {
  border-top: 1px solid #dcdfe6;
  padding: 16px 0;
  background-color: #fff;
  margin-top: auto; /* 将按钮区域推到底部 */
}

.form-select,
.form-input {
  width: 100%;
}

.validity-config {
  display: flex;
  flex-direction: column;
}

.validity-radio-group {
  display: flex;
  align-items: center;
  height: 32px; /* 与输入框高度保持一致 */
}

.validity-date {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

:deep(.el-radio) {
  margin-right: 30px;
}

:deep(.el-date-editor.el-input) {
  width: 220px;
  margin-left: 0;
}

.validity-text {
  color: #606266;
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
