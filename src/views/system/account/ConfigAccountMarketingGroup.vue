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
          <el-form-item label="运营商：" prop="carrier">
            <el-input v-model="formData.carrier" disabled class="form-input" />
          </el-form-item>

          <el-form-item label="局点：" prop="siteName">
            <el-input v-model="formData.siteName" disabled class="form-input" />
          </el-form-item>

          <el-form-item label="用户账号：" prop="userAccount">
            <el-input v-model="formData.userAccount" disabled class="form-input" />
          </el-form-item>

          <el-form-item label="用户名称：" prop="userName">
            <el-input v-model="formData.userName" disabled class="form-input" />
          </el-form-item>

          <el-form-item label="所属营销组：" prop="marketingGroups" required>
            <el-tree-select
              v-model="formData.marketingGroups"
              :data="marketingGroupOptions"
              :props="{
                label: 'label',
                children: 'children',
                value: 'value',
                disabled: 'disabled',
              }"
              :render-after-expand="false"
              placeholder="请选择营销组"
              class="form-select"
              :loading="loading.marketingGroup"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="3"
              check-strictly
            />
          </el-form-item>
        </div>

        <div class="form-footer">
          <div class="form-buttons">
            <el-button type="primary" @click="handleSubmit">确定</el-button>
            <el-popconfirm
              title="营销组配置未保存，是否确定返回？"
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
import { fetchMarketingGroupData, getAccountDetail, updateAccountMarketingGroup } from '@/api'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  carrier: '',
  siteName: '',
  userAccount: '',
  userName: '',
  marketingGroups: [] as string[],
})

// 加载状态
const loading = reactive({
  marketingGroup: false,
  detail: false,
})

// 营销组选项
const marketingGroupOptions = ref<any[]>([])

// 表单验证规则
const rules = {
  marketingGroups: [{ required: true, message: '请选择至少一个营销组', trigger: 'change' }],
}

// 构建营销组树形结构
const buildMarketingGroupTree = (groups: any[]) => {
  // 按运营商和局点分组
  const carrierMap = new Map()

  groups.forEach((group) => {
    const carrier = group.carrier
    const siteName = group.siteName
    const marketingGroupName = group.marketingGroupName

    if (!carrierMap.has(carrier)) {
      carrierMap.set(carrier, {
        label: carrier,
        value: `carrier:${carrier}`,
        disabled: true,
        children: [],
      })
    }

    const carrierNode = carrierMap.get(carrier)
    let siteNode = carrierNode.children.find((site: any) => site.label === siteName)

    if (!siteNode) {
      siteNode = {
        label: siteName,
        value: `site:${carrier}:${siteName}`,
        disabled: true,
        children: [],
      }
      carrierNode.children.push(siteNode)
    }

    siteNode.children.push({
      label: marketingGroupName,
      value: marketingGroupName,
    })
  })

  return Array.from(carrierMap.values())
}

// 获取营销组列表
const getMarketingGroupList = async () => {
  try {
    loading.marketingGroup = true
    const res = await fetchMarketingGroupData()
    if (res.code === 200) {
      const groups = res.data.list || []
      marketingGroupOptions.value = buildMarketingGroupTree(groups)
    }
  } catch (error) {
    console.error('获取营销组列表失败:', error)
    ElMessage.error('获取营销组列表失败')
  } finally {
    loading.marketingGroup = false
  }
}

// 获取账号详情
const getDetail = async (id: string) => {
  try {
    loading.detail = true
    const res = await getAccountDetail(Number(id))
    if (res.code === 200) {
      const detail = res.data
      // 设置表单数据
      Object.assign(formData, {
        carrier: detail.carrier,
        siteName: detail.siteName,
        userAccount: detail.userAccount,
        userName: detail.userName,
        marketingGroups: detail.marketingGroup ? detail.marketingGroup.split(',') : [],
      })
    } else {
      ElMessage.error(res.msg || '获取账号详情失败')
      handleBack()
    }
  } catch (error) {
    console.error('获取账号详情失败:', error)
    ElMessage.error('获取账号详情失败')
    handleBack()
  } finally {
    loading.detail = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const id = Number(route.params.id)
        // 过滤掉禁用的节点（运营商和局点节点）
        const validMarketingGroups = formData.marketingGroups.filter(
          (group) => !group.startsWith('carrier:') && !group.startsWith('site:'),
        )

        // 调用更新账号营销组API，将多个营销组用逗号连接成字符串传递给后端
        const marketingGroups = validMarketingGroups.join(',')
        const res = await updateAccountMarketingGroup(id, marketingGroups)
        if (res.code === 200) {
          ElMessage.success('营销组配置成功')
          router.push('/account')
        } else {
          ElMessage.error(res.msg || '营销组配置失败')
        }
      } catch (error) {
        console.error('营销组配置失败:', error)
        ElMessage.error('营销组配置失败')
      }
    }
  })
}

// 返回上一页
const handleBack = () => {
  router.push('/account')
}

// 页面加载时获取数据
onMounted(() => {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('账号ID不能为空')
    handleBack()
    return
  }

  getMarketingGroupList()
  getDetail(id)
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

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
