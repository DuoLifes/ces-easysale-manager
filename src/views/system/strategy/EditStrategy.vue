<template>
  <div class="page-container">
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="strategy-form"
      >
        <div class="form-content">
          <el-form-item label="策略名称：" prop="strategyName" required>
            <el-input
              v-model="formData.strategyName"
              placeholder="请输入策略名称"
              class="form-input"
            />
          </el-form-item>

          <el-form-item label="运营商：" prop="carrier" required>
            <el-select v-model="formData.carrier" placeholder="请选择运营商" class="form-select">
              <el-option label="移动" value="移动" />
              <el-option label="联通" value="联通" />
              <el-option label="电信" value="电信" />
            </el-select>
          </el-form-item>

          <el-form-item label="推荐产品：" prop="product" required>
            <el-input
              v-model="formData.product"
              type="textarea"
              :rows="4"
              placeholder="请输入推荐产品"
              class="form-textarea"
            />
          </el-form-item>

          <el-form-item label="话术：" required>
            <div class="technique-container">
              <el-table
                :data="techniqueItems"
                border
                style="width: 100%"
                max-height="320"
                class="technique-table"
              >
                <el-table-column label="序号" type="index" width="60" align="center" />
                <el-table-column label="话术内容">
                  <template #default="{ row }">
                    <el-input
                      v-model="row.content"
                      type="textarea"
                      :rows="4"
                      :placeholder="`请输入话术内容`"
                      class="technique-input"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80" align="center">
                  <template #default="{ $index }">
                    <el-button
                      v-if="$index > 0"
                      type="danger"
                      :icon="Delete"
                      circle
                      size="small"
                      @click="removeTechnique($index)"
                    />
                  </template>
                </el-table-column>
              </el-table>
              <div class="technique-error-container">
                <div class="technique-error">{{ techniqueError }}</div>
              </div>
              <div class="add-technique" @click="addTechnique">
                <el-icon><Plus /></el-icon>
                <span>添加话术</span>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="策略类别：" prop="strategyType" required>
            <el-select
              v-model="formData.strategyType"
              placeholder="请选择策略类别"
              class="form-select"
            >
              <el-option
                v-for="option in strategyTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-footer">
          <div class="form-buttons">
            <el-button type="primary" @click="handleSubmit">确定</el-button>
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
import { Delete, Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { getStrategyDetail, updateStrategy } from '@/api'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const techniqueError = ref('')
const strategyId = ref(Number(route.params.id))

// 定义策略类型选项
interface StrategyTypeOption {
  label: string
  value: string
}

// 策略类型选项
const strategyTypeOptions = ref<StrategyTypeOption[]>([
  { label: '基础策略', value: '基础策略' },
  { label: '高级策略', value: '高级策略' },
])

// 话术项
interface TechniqueItem {
  content: string
}

// 表单数据
const formData = reactive({
  strategyName: '',
  carrier: '',
  product: '',
  technique: '',
  strategyType: '',
  id: 0,
})

// 话术项数组
const techniqueItems = ref<TechniqueItem[]>([{ content: '' }])

// 添加话术
const addTechnique = () => {
  techniqueItems.value.push({ content: '' })
  techniqueError.value = '' // 清除错误提示
}

// 删除话术
const removeTechnique = (index: number) => {
  techniqueItems.value.splice(index, 1)
}

// 表单验证规则
const rules = {
  strategyName: [
    { required: true, message: '请输入策略名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  carrier: [{ required: true, message: '请选择运营商', trigger: 'change' }],
  product: [{ required: true, message: '请输入推荐产品', trigger: 'blur' }],
  strategyType: [{ required: true, message: '请选择策略类别', trigger: 'change' }],
}

// 获取策略详情
const getDetail = async () => {
  try {
    const res = await getStrategyDetail(strategyId.value)
    if (res.code === 200) {
      const data = res.data
      // 填充表单数据
      formData.id = data.id
      formData.strategyName = data.strategyName
      formData.carrier = data.carrier
      formData.product = data.product
      formData.strategyType = data.strategyType

      // 处理话术数据
      let techniques = []
      try {
        if (typeof data.technique === 'string') {
          // 先尝试解析为JSON数组
          techniques = JSON.parse(data.technique || '[]')
        } else if (Array.isArray(data.technique)) {
          techniques = data.technique
        }
      } catch (error) {
        console.error('解析话术数据失败:', error)
        // 如果解析失败，作为一条话术处理
        if (data.technique) {
          techniques = [data.technique]
        }
      }

      // 将话术数组转换为界面上需要的格式
      if (Array.isArray(techniques) && techniques.length > 0) {
        techniqueItems.value = techniques.map((item) => ({ content: item }))
      } else {
        techniqueItems.value = [{ content: '' }]
      }
    }
  } catch (error) {
    console.error('获取策略详情失败:', error)
    ElMessage.error('获取策略详情失败')
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return

  // 先验证表单其他字段
  let formValid = false
  try {
    formValid = await formRef.value.validate().catch((err) => {
      console.error('表单验证错误:', err)
      return false
    })
  } catch (error) {
    console.error('表单验证错误:', error)
    return
  }

  // 然后检查话术是否为空
  const emptyTechniques = techniqueItems.value.filter((item) => !item.content.trim())
  if (techniqueItems.value.length === 0 || emptyTechniques.length === techniqueItems.value.length) {
    techniqueError.value = '请至少添加一条话术内容'
    return
  } else {
    techniqueError.value = ''
  }

  // 如果任一验证失败，则不提交
  if (!formValid) return

  try {
    // 提取话术内容，形成纯文本数组
    const techniqueContents = techniqueItems.value
      .filter((item) => item.content.trim() !== '')
      .map((item) => item.content.trim())

    const params = {
      id: formData.id,
      strategyName: formData.strategyName,
      carrier: formData.carrier,
      product: formData.product,
      strategyType: formData.strategyType,
      technique: techniqueContents, // 直接使用数组，不进行JSON序列化
    }
    console.log('提交参数', params)
    try {
      const params = {
        ...formData,
        sites: formData.sites.join(','),
      }
      const res = await updateStrategy(params)
      if (res.code === 200) {
        ElMessage.success('修改成功')
        router.push('/strategy')
      } else {
        ElMessage.error(res.msg || '修改失败')
      }
    } catch (error) {
      ElMessage.error('修改失败')
    } finally {
      submitting.value = false
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('更新失败')
  }
}

// 返回上一页
const handleBack = () => {
  router.push('/strategy')
}

onMounted(() => {
  getDetail()
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

.strategy-form {
  max-width: 800px;
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
.form-input,
.form-textarea {
  width: 100%;
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.technique-container {
  width: 100%;
  overflow: hidden;
}

.technique-table {
  width: 100%;
}

:deep(.el-table__body-wrapper) {
  max-height: 320px;
  overflow-y: auto;
}

.technique-input-wrapper {
  padding: 0;
  width: 100%;
  height: 100%;
}

.technique-input {
  width: 100%;
  height: 100%;
}

.add-technique {
  display: flex;
  align-items: center;
  color: #409eff;
  cursor: pointer;
  margin-top: 2px; /* 减少与错误信息的间距 */
}

.add-technique span {
  margin-left: 4px;
}

:deep(.el-table .el-table__cell) {
  padding: 0;
}

:deep(.el-textarea .el-input__wrapper) {
  padding: 0;
  box-shadow: none;
  margin: 0;
  border-radius: 0;
}

:deep(.el-textarea__inner) {
  min-height: 120px; /* 设置文本域最小高度 */
  border-radius: 0;
  border: none;
  resize: none;
  padding: 8px;
  box-sizing: border-box;
}

/* 覆盖表格单元格中的任何内边距 */
:deep(.el-table__cell .cell) {
  padding: 0 !important;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px var(--el-input-focus-border-color) inset;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
}

:deep(.el-textarea.is-disabled .el-textarea__inner) {
  background-color: #f5f7fa;
}

.technique-error-container {
  height: 18px; /* 减小固定高度 */
  margin: 4px 0 2px 0; /* 减少上下边距 */
}

.technique-error {
  color: #f56c6c;
  font-size: 0.8em;
  text-align: left;
  line-height: 1; /* 添加行高控制，避免文字过高 */
}
</style>
