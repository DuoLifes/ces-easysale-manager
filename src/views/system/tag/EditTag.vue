<template>
  <div class="page-container">
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="tag-form"
        v-loading="loading"
      >
        <div class="form-content">
          <el-form-item label="标签名称：" prop="tagName" required>
            <el-input v-model="formData.tagName" placeholder="请输入标签名称" class="form-input" />
          </el-form-item>

          <el-form-item label="标签类别：" prop="tagType" required>
            <el-select v-model="formData.tagType" placeholder="请选择标签类别" class="form-select">
              <el-option
                v-for="option in tagTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-footer">
          <div class="form-buttons">
            <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
            <el-popconfirm
              title="编辑数据未保存，是否确定返回？"
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
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getTagDetail, updateTag } from '@/api'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

// 获取标签ID
const tagId = route.params.id as string

// 表单数据
const formData = reactive({
  id: '',
  tagName: '',
  tagType: '',
})

// 表单验证规则
const rules = {
  tagName: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  tagType: [{ required: true, message: '请选择标签类别', trigger: 'change' }],
}

// 标签类型选项
const tagTypeOptions = ref<Array<{ label: string; value: string }>>([])

// 获取标签类型选项
const getTagTypeOptions = () => {
  try {
    // 从localStorage获取标签类型选项
    const savedOptions = localStorage.getItem('tagTypeOptions')
    if (savedOptions) {
      const parsedOptions = JSON.parse(savedOptions)
      if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
        tagTypeOptions.value = parsedOptions
        return
      }
    }
  } catch (error) {
    console.error('获取标签类型选项失败:', error)
  }

  // 如果无法获取，使用默认值
  tagTypeOptions.value = [
    { label: '基础标签', value: '基础标签' },
    { label: '高级标签', value: '高级标签' },
  ]
}

// 获取标签详情
const getDetail = async () => {
  loading.value = true
  try {
    const res = await getTagDetail(Number(tagId))
    if (res.code === 200 && res.data) {
      const { id, tagName, tagType } = res.data
      Object.assign(formData, {
        id,
        tagName,
        tagType,
      })
    } else {
      ElMessage.error(res.msg || '获取标签详情失败')
      setTimeout(() => {
        router.push('/tag')
      }, 1500)
    }
  } catch (error) {
    console.error('获取标签详情失败:', error)
    ElMessage.error('获取标签详情失败')
    setTimeout(() => {
      router.push('/tag')
    }, 1500)
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 调用更新标签API
        const submitData = {
          id: Number(formData.id),
          tagName: formData.tagName,
          tagType: formData.tagType,
        }
        const res = await updateTag(submitData)
        if (res.code === 200) {
          ElMessage.success('更新成功')
          router.push('/tag')
        } else {
          ElMessage.error(res.msg || '更新失败')
        }
      } catch (error) {
        console.error('更新标签失败:', error)
        ElMessage.error('更新标签失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 返回上一页
const handleBack = () => {
  router.push('/tag')
}

// 页面加载时获取标签详情
onMounted(() => {
  getDetail()
  getTagTypeOptions()
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

.tag-form {
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

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
