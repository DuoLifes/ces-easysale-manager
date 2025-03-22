<template>
  <div class="page-container">
    <TableSearch
      :query="query"
      :options="searchOpt"
      :search="handleSearch"
      :reset="resetQuery"
      :layout="4"
      :fixed-buttons="true"
      class="table-search prospect-search"
    />
    <div class="container">
      <TableCustom
        :columns="columns"
        :tableData="tableData"
        :total="page.total"
        :changePage="changePage"
        :currentPage="page.index"
        :pageSize="page.size"
        :pageSizes="[10, 15, 20]"
        :sizeChange="handleSizeChange"
        :delFunc="handleDelete"
        :showView="false"
        :showEdit="true"
        :showDelete="true"
        :loading="loading"
        addButtonText="潜客导入"
        :max-height="650"
        title="潜客列表"
        @addOperate="handleAdd"
      >
      </TableCustom>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { Prospect } from '@/types/prospect'
import type { FormOptionList } from '@/types/form-option'
import { fetchProspectData, deleteProspect } from '@/api'
import { useRouter } from 'vue-router'

// 导入组件
import TableCustom from '@/components/common/table-custom.vue'
import TableSearch from '@/components/common/table-search.vue'
const router = useRouter()

interface ApiError {
  msg?: string
}

// 为组件定义名称
defineOptions({
  name: 'ProspectManagementView',
})

/**
 * 状态定义
 */
// 查询条件
const query = reactive({
  siteName: '',
  gridName: '',
  userAccount: '',
})

// 分页配置
const page = reactive({
  index: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<Prospect[]>([])
const loading = ref(false)

/**
 * 配置项定义
 */
// 查询表单配置
const searchOpt = ref<FormOptionList[]>([
  {
    type: 'select',
    label: '局点',
    prop: 'siteName',
    placeholder: '全部',
    opts: [
      { label: '全部', value: 'all' },
      { label: '移动', value: '移动' },
      { label: '联通', value: '联通' },
      { label: '电信', value: '电信' },
    ],
  },
  {
    type: 'select',
    label: '网格',
    prop: 'gridName',
    placeholder: '全部',
    opts: [
      { label: '全部', value: 'all' },
      { label: '移动', value: '移动' },
      { label: '联通', value: '联通' },
      { label: '电信', value: '电信' },
    ],
  },
  {
    type: 'input',
    label: '用户账号',
    prop: 'userAccount',
    placeholder: '请输入用户账号',
  },
])

// 表格列配置
const columns = ref([
  { prop: 'siteName', label: '局点' },
  { prop: 'userAccount', label: '用户账号' },
  { prop: 'isPhone', label: '是否为异网手机用户' },
  { prop: 'phoneNo', label: '异网手机号码' },
  { prop: 'portrait', label: '营销画像' },
  { prop: 'strategy', label: '营销策略' },
  { prop: 'isQuality', label: '是否质差' },
  { prop: 'operator', label: '操作', width: 250 },
])

/**
 * 数据处理方法
 */
// 获取表格数据
const getData = async () => {
  try {
    // 显示加载状态
    loading.value = true
    const res = await fetchProspectData({
      siteName: query.siteName === 'all' ? '' : query.siteName,
      gridName: query.gridName === 'all' ? '' : query.gridName,
      userAccount: query.userAccount,
      pageNo: page.index,
      pageSize: page.size,
    })
    if (res.code === 200) {
      // 更新表格数据和总数
      tableData.value = res.data.list || []
      page.total = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取数据失败')
      // 清空数据
      tableData.value = []
      page.total = 0
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
    // 清空数据
    tableData.value = []
    page.total = 0
  } finally {
    // 隐藏加载状态
    loading.value = false
  }
}

/**
 * 重置分页参数
 */
const resetPagination = () => {
  page.index = 1
  page.size = 10
  page.total = 0
}

/**
 * 查询相关方法
 */
// 重置查询条件
const resetQuery = () => {
  // 重置查询条件
  query.siteName = ''
  query.gridName = ''
  query.userAccount = ''
  // 重置分页参数
  resetPagination()
  // 重新加载数据
  getData()
}

// 执行查询
const handleSearch = () => {
  // 重置分页参数
  resetPagination()
  // 重新加载数据
  getData()
}

/**
 * 分页相关方法
 */
// 页码变化
const changePage = (val: number) => {
  // 更新页码
  page.index = val
  // 重新加载数据
  getData()
}

// 每页条数变化
const handleSizeChange = (val: number) => {
  // 更新每页条数
  page.size = val
  // 重置到第一页
  page.index = 1
  // 重新加载数据
  getData()
}

/**
 * 事件处理方法
 */
// 表单操作相关
const handleAdd = () => {
  router.push({ name: 'addProspect' })
}

/**
 * 处理删除操作
 * @param row - 要删除的潜客数据
 */
const handleDelete = async (row: Prospect) => {
  try {
    const res = await deleteProspect(row.id)
    if (res.data?.code === 200) {
      ElMessage.success('删除成功')
      await getData() // 刷新列表
    } else {
      ElMessage.error(res.data?.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error((error as ApiError)?.msg || '删除失败')
  }
}

// 初始化加载数据
getData()
</script>

<style scoped>
/* 页面特有样式 */
.table-search {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 16px;
}

/* 潜客管理特有的查询条件样式 */
.prospect-search :deep(.el-form-item__content) {
  max-width: 280px;
}
</style>
