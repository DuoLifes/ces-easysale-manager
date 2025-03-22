<template>
  <div class="page-container">
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        label-width="120px"
        class="site-form"
        v-loading="loading.detail"
      >
        <div class="form-content">
          <el-form-item label="标签名称：">
            <span>{{ tagInfo.tagName }}</span>
          </el-form-item>

          <el-form-item label="标签类别：">
            <span>{{ tagInfo.tagType }}</span>
          </el-form-item>

          <el-form-item label="所属局点：" prop="sites">
            <el-select
              v-model="formData.sites"
              multiple
              collapse-tags
              collapse-tags-tooltip
              :max-collapse-tags="2"
              placeholder="请选择局点"
              class="site-select"
              :loading="loading.sites"
            >
              <el-option
                v-for="item in siteOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-footer">
          <div class="form-buttons">
            <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
            <el-popconfirm
              title="配置数据未保存，是否确定返回？"
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getTagDetail, updateTagSites, fetchSiteData } from '@/api'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const loading = reactive({
  detail: false,
  sites: false,
})
const submitting = ref(false)

// 获取标签ID
const tagId = route.params.id as string

// 标签信息
const tagInfo = reactive({
  tagName: '',
  tagType: '',
})

// 表单数据
const formData = reactive({
  id: '',
  sites: [] as string[],
})

// 局点选项
const siteOptions = ref<{ label: string; value: string }[]>([])

// 标签详情数据（临时存储）
const tagDetailData = ref<{
  id: number
  tagName: string
  tagType: string
  sites: string
} | null>(null)

// 获取局点列表
const getSiteList = async () => {
  try {
    loading.sites = true
    const res = await fetchSiteData({
      pageNo: 1,
      pageSize: 1000, // 获取足够多的局点数据
    })
    if (res.code === 200) {
      const sites = res.data.list || []
      siteOptions.value = sites.map((site) => ({
        label: site.siteName,
        value: site.siteName,
      }))

      // 如果标签详情已经加载完成，则更新表单数据
      if (tagDetailData.value) {
        updateFormData(tagDetailData.value)
      }
    } else {
      ElMessage.error(res.msg || '获取局点列表失败')
    }
  } catch (error) {
    ElMessage.error('获取局点列表失败')
  } finally {
    loading.sites = false
  }
}

// 获取标签详情
const getDetail = async () => {
  try {
    loading.detail = true
    const res = await getTagDetail(Number(tagId))
    if (res.code === 200 && res.data) {
      // 保存标签详情数据
      tagDetailData.value = {
        ...res.data,
        // 确保sites字段是字符串类型
        sites: typeof res.data.sites === 'string' ? res.data.sites : String(res.data.sites || ''),
      }

      // 更新标签信息
      Object.assign(tagInfo, {
        tagName: res.data.tagName,
        tagType: res.data.tagType,
      })

      // 如果局点列表已经加载完成，则更新表单数据
      if (siteOptions.value.length > 0) {
        updateFormData(tagDetailData.value)
      }
    } else {
      ElMessage.error(res.msg || '获取标签详情失败')
      setTimeout(() => {
        router.push('/tag')
      }, 1500)
    }
  } catch (error) {
    ElMessage.error('获取标签详情失败')
    setTimeout(() => {
      router.push('/tag')
    }, 1500)
  } finally {
    loading.detail = false
  }
}

// 更新表单数据
const updateFormData = (data: { id: number; sites: string }) => {
  // 确保sites是字符串类型
  const sitesStr = typeof data.sites === 'string' ? data.sites : String(data.sites)

  // 使用正则表达式拆分，处理可能的空格和其他特殊情况
  const sitesArray = sitesStr ? sitesStr.split(/\s*,\s*/).filter(Boolean) : []

  const filteredSites = sitesArray.filter((site) => {
    return siteOptions.value.some((option) => option.value === site)
  })

  // 更新表单数据
  Object.assign(formData, {
    id: data.id,
    sites: filteredSites,
  })

  // 强制更新一次，确保视图更新
  setTimeout(() => {
    formData.sites = [...filteredSites]
  }, 100)
}

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    // 调用更新标签站点API
    const res = await updateTagSites({
      id: Number(formData.id),
      sites: formData.sites && formData.sites.length > 0 ? formData.sites.join(',') : '', // 将数组转换为逗号拼接的字符串，如果为空则传空字符串
    })

    if (res.code === 200) {
      ElMessage.success('配置成功')
      router.push('/tag')
    } else {
      ElMessage.error(res.msg || '配置失败')
    }
  } catch (error) {
    console.error('配置标签局点失败:', error)
    ElMessage.error('配置标签局点失败')
  } finally {
    submitting.value = false
  }
}

// 返回上一页
const handleBack = () => {
  router.push('/tag')
}

// 页面加载时获取数据
onMounted(async () => {
  try {
    // 先获取局点列表
    await getSiteList()

    // 再获取标签详情
    await getDetail()

    // 如果此时标签详情已加载但表单数据未更新，手动更新一次
    if (tagDetailData.value && (!formData.sites || formData.sites.length === 0)) {
      updateFormData(tagDetailData.value)
    }

    // 强制更新一次，确保视图更新
    setTimeout(() => {
      if (tagDetailData.value) {
        updateFormData(tagDetailData.value)
      }
    }, 300)
  } catch (error) {
    ElMessage.error('加载数据失败，请刷新页面重试')
  }
})

// 组件卸载时清除loading状态
onUnmounted(() => {
  loading.detail = false
  loading.sites = false
  submitting.value = false
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

.site-form {
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

.site-select {
  width: 100%;
}

.form-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
