<template>
  <div class="page-container">
    <TableSearch
      :query="queryParams"
      :options="formOptions"
      :search="handleSearch"
      :reset="resetQuery"
      :layout="4"
      :fixed-buttons="false"
      class="table-search"
    />
    <div class="container">
      <TableCustom
        :columns="columns"
        :tableData="tableData"
        :total="pagination.total"
        :changePage="handlePageChange"
        :currentPage="pagination.currentPage"
        :pageSize="pagination.pageSize"
        :pageSizes="[10, 15, 20]"
        :sizeChange="handleSizeChange"
        :showView="false"
        :showEdit="false"
        :showDelete="false"
        :loading="loading"
        :max-height="650"
        title="策略列表"
        @addOperate="handleAdd"
      >
        <template #handle="{ rows: row }">
          <el-button class="light-blue-btn" size="small" @click="handleEdit(row)"> 编辑 </el-button>
          <el-button class="light-red-btn" size="small" @click="handleDelete(row)">
            删除
          </el-button>
          <el-button class="light-blue-btn" size="small" @click="handleConfigSite(row)">
            局点配置
          </el-button>
        </template>
        <template #technique="{ rows: row }">
          <div class="technique-content">{{ row.technique }}</div>
        </template>
      </TableCustom>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import TableSearch from '@/components/common/table-search.vue'
import TableCustom from '@/components/common/table-custom.vue'
import { fetchStrategyList, deleteStrategy, fetchSiteData } from '@/api'
import { FormOption } from '@/types/form-option'
import { StrategyQuery, Strategy } from '@/types/strategy'
import type { TableColumn } from '@/types/table'

// 为组件定义名称
defineOptions({
  name: 'StrategyManagementView',
})

const router = useRouter()

// 查询参数
const queryParams = reactive<StrategyQuery>({
  strategyName: '', // 策略名称，与原型图匹配
  carrier: '', // 运营商，字段名统一为carrier
  strategyType: '', // 策略类别，与原型图匹配
  site: '', // 所属局点，与原型图匹配
  pageNo: 1, // 当前页码
  pageSize: 10, // 每页条数
})

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 加载状态
const loading = ref<boolean>(false)

// 表格数据
const tableData = ref<Strategy[]>([])

// 表格列配置
const columns = ref<TableColumn[]>([
  {
    prop: 'id', // 字段名与Strategy接口的id字段对应
    label: '策略ID', // 显示名称，与原型图匹配
    width: 80, // 列宽
  },
  {
    prop: 'strategyName', // 字段名与Strategy接口的strategyName字段对应
    label: '策略名称', // 显示名称，与原型图匹配
    minWidth: 120, // 最小列宽
  },
  {
    prop: 'carrier', // 字段名与Strategy接口的carrier字段对应
    label: '运营商', // 显示名称，与原型图匹配
    minWidth: 100, // 最小列宽
  },
  {
    prop: 'product', // 字段名与Strategy接口的product字段对应
    label: '推荐产品', // 显示名称，与原型图匹配
    minWidth: 180, // 最小列宽
  },
  {
    prop: 'technique', // 字段名与Strategy接口的technique字段对应
    label: '话术', // 显示名称，与原型图匹配
    minWidth: 200, // 最小列宽
  },
  {
    prop: 'strategyType', // 字段名与Strategy接口的strategyType字段对应
    label: '策略类别', // 显示名称，与原型图匹配
    minWidth: 120, // 最小列宽
  },
  {
    prop: 'sites', // 字段名与Strategy接口的sites字段对应
    label: '所属局点', // 显示名称，与原型图匹配
    minWidth: 150, // 最小列宽
  },
  {
    prop: 'handle', // 自定义字段名，用于操作列
    label: '操作', // 显示名称，与原型图匹配
    fixed: 'right', // 固定在右侧
    width: 230, // 列宽
  },
])

// 策略类型选项
const strategyTypeOptions = ref<Array<{ label: string; value: string }>>([
  { label: '全部', value: '' },
])

// 查询表单选项
const formOptions = ref([
  {
    prop: 'strategyName',
    label: '策略名称：',
    type: 'input',
    placeholder: '请输入策略名称',
  },
  {
    prop: 'carrier',
    label: '运营商：',
    type: 'select',
    placeholder: '全部',
    opts: [
      { label: '全部', value: '' },
      { label: '移动', value: '移动' },
      { label: '联通', value: '联通' },
      { label: '电信', value: '电信' },
    ],
  },
  {
    prop: 'strategyType',
    label: '策略类别：',
    type: 'select',
    placeholder: '全部',
    opts: strategyTypeOptions.value,
  },
  {
    prop: 'site',
    label: '所属局点：',
    type: 'select',
    placeholder: '全部',
    opts: [{ label: '全部', value: '' }],
  },
])

// 格式化日期时间
const formatDateTime = (timestamp: string | number) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取策略类型
const getStrategyTypes = () => {
  // 使用固定的策略类型选项
  strategyTypeOptions.value = [
    { label: '全部', value: '' },
    { label: '基础策略', value: '基础策略' },
    { label: '高级策略', value: '高级策略' },
  ]

  // 更新查询表单选项
  const typeOption = formOptions.value.find((option) => option.prop === 'strategyType')
  if (typeOption) {
    typeOption.opts = strategyTypeOptions.value
  }

  // 将策略类型选项保存到localStorage（去掉"全部"选项）
  const typeOptionsForStorage = strategyTypeOptions.value
    .filter((option) => option.value !== '') // 过滤掉"全部"选项
    .map((option) => ({ label: option.label, value: option.value }))

  localStorage.setItem('strategyTypeOptions', JSON.stringify(typeOptionsForStorage))
}

// 获取策略列表数据
const getData = async () => {
  try {
    loading.value = true
    const res = await fetchStrategyList(queryParams)
    if (res.code === 200) {
      // 处理返回的策略列表数据，确保字段与表格列定义匹配
      tableData.value = (res.data.list || []).map((item) => ({
        id: item.id, // 策略ID
        strategyName: item.strategyName, // 策略名称
        carrier: item.carrier, // 运营商
        product: item.product, // 推荐产品
        technique: item.technique, // 话术
        strategyType: item.strategyType, // 策略类别
        sites: item.sites, // 所属局点
      }))
      tableData.value.forEach((el) => {
        try {
          let techniqueArray = []
          // 检查technique是否为字符串，如果是则尝试解析为数组
          if (typeof el.technique === 'string') {
            techniqueArray = JSON.parse(el.technique)
          } else if (Array.isArray(el.technique)) {
            techniqueArray = el.technique
          }

          if (Array.isArray(techniqueArray)) {
            let str = ''
            techniqueArray.forEach((element, index) => {
              str = str + (index + 1) + '.' + element + '\n'
            })
            el.technique = str
          }
        } catch (error) {
          console.error('处理话术数据失败:', error)
        }
      })
      pagination.total = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取策略列表失败')
    }
  } catch (error) {
    console.error('获取策略列表失败:', error)
    ElMessage.error('获取策略列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 重置分页参数
 */
const resetPagination = () => {
  pagination.currentPage = 1
  pagination.pageSize = 10
  pagination.total = 0
  queryParams.pageNo = 1
  queryParams.pageSize = 10
}

/**
 * 重置查询条件
 */
const resetQuery = () => {
  // 重置查询条件
  queryParams.strategyName = ''
  queryParams.strategyType = ''
  queryParams.carrier = ''
  queryParams.site = ''
  // 重置分页参数
  resetPagination()
  // 重新加载数据
  getData()
}

// 处理查询
const handleSearch = () => {
  // 重置分页参数
  resetPagination()
  // 重新加载数据
  getData()
}

// 处理页码变化
const handlePageChange = (page: number) => {
  queryParams.pageNo = page
  pagination.currentPage = page
  getData()
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  pagination.pageSize = size
  queryParams.pageNo = 1
  pagination.currentPage = 1
  getData()
}

// 新建策略
const handleAdd = () => {
  router.push('/addStrategy')
}

// 编辑策略
const handleEdit = (row: Strategy) => {
  router.push(`/editStrategy/${row.id}`)
}

// 配置局点
const handleConfigSite = (row: Strategy) => {
  router.push(`/configStrategySite/${row.id}`)
}

// 删除策略
const handleDelete = (row: Strategy) => {
  ElMessageBox.confirm('确定要删除该策略吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteStrategy(row.id)
        if (res.code === 200) {
          ElMessage.success('删除成功')
          getData()
        } else {
          ElMessage.error(res.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除策略失败:', error)
        ElMessage.error('删除策略失败')
      }
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 获取局点列表
const getSiteList = async () => {
  try {
    const res = await fetchSiteData()
    if (res.code === 200) {
      const sites = res.data.list || []
      const siteOpts = [
        { label: '全部', value: '' },
        ...sites.map((site) => ({ label: site.siteName, value: site.siteName })),
      ]

      // 更新查询表单中的局点选项
      const siteOption = formOptions.value.find((option) => option.prop === 'site')
      if (siteOption) {
        siteOption.opts = siteOpts
      }
    }
  } catch (error) {
    console.error('获取局点列表失败:', error)
  }
}

onMounted(() => {
  getStrategyTypes() // 初始化固定的策略类别选项
  getData()
  getSiteList()
})
</script>

<style scoped>
/* 页面特有样式 */
.table-search {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 16px;
}

.page-container {
  height: 100%;
}

.container {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
}

.technique-content {
  white-space: pre-line;
  line-height: 1.5;
  text-align: left;
  padding: 8px;
}
</style>
