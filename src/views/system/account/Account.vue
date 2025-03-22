<template>
  <div class="page-container">
    <TableSearch
      :query="query"
      :options="searchOpt"
      :search="handleSearch"
      :reset="resetQuery"
      :layout="4"
      :fixed-buttons="true"
      class="table-search"
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
        :showView="false"
        :showEdit="true"
        :showDelete="false"
        :loading="loading"
        :max-height="650"
        title="账户列表"
        @addOperate="handleAdd"
      >
        <template #operator="{ rows: row }">
          <el-button class="light-blue-btn" size="small" :icon="Edit" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button
            class="light-blue-btn"
            size="small"
            :icon="Setting"
            @click="handleRoleConfig(row)"
          >
            角色配置
          </el-button>
          <el-button
            class="light-blue-btn"
            size="small"
            :icon="Setting"
            @click="handleMarketingGroupConfig(row)"
          >
            营销组配置
          </el-button>
        </template>
      </TableCustom>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Setting } from '@element-plus/icons-vue'
import type { Account } from '@/types/account'
import type { FormOptionList } from '@/types/form-option'
import type { TableColumn } from '@/components/common/table-custom.vue'
import { fetchAccountList, fetchSiteData, fetchMarketingGroupData } from '@/api'
import { useRouter } from 'vue-router'

// 导入组件
import TableCustom from '@/components/common/table-custom.vue'
import TableSearch from '@/components/common/table-search.vue'

// 为组件定义名称
defineOptions({
  name: 'AccountManagementView',
})

const router = useRouter()

/**
 * 状态定义
 */
// 查询条件
const query = reactive({
  carrier: '',
  siteName: '',
  userAccount: '',
  userName: '',
  marketingGroup: '',
  isEnabled: undefined,
  isExpired: undefined,
})

// 分页配置
const page = reactive({
  index: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<Account[]>([])
const loading = ref(false)

// 局点列表选项
const siteOptions = ref([{ label: '全部', value: '' }])
// 营销组列表选项
const marketingGroupOptions = ref([{ label: '全部', value: '' }])

/**
 * 配置项定义
 */
// 获取局点列表
const getSiteList = async () => {
  try {
    const res = await fetchSiteData()
    if (res.code === 200) {
      const sites = res.data.list || []
      siteOptions.value = [
        { label: '全部', value: '' },
        ...sites.map((site) => ({ label: site.siteName, value: site.siteName })),
      ]
    }
  } catch (error) {
    console.error('获取局点列表失败:', error)
  }
}

// 获取营销组列表
const getMarketingGroupList = async () => {
  try {
    const res = await fetchMarketingGroupData()
    if (res.code === 200) {
      const groups = res.data.list || []
      marketingGroupOptions.value = [
        { label: '全部', value: '' },
        ...groups.map((group) => ({
          label: group.marketingGroupName,
          value: group.marketingGroupName,
        })),
      ]
    }
  } catch (error) {
    console.error('获取营销组列表失败:', error)
  }
}

// 查询表单配置
const searchOpt = ref<FormOptionList[]>([
  {
    type: 'select',
    label: '运营商：',
    prop: 'carrier',
    placeholder: '全部',
    opts: [
      { label: '全部', value: '' },
      { label: '移动', value: '移动' },
      { label: '联通', value: '联通' },
      { label: '电信', value: '电信' },
    ],
  },
  {
    type: 'select',
    label: '局点名称：',
    prop: 'siteName',
    placeholder: '全部',
    opts: siteOptions,
  },
  {
    type: 'input',
    label: '用户账号：',
    prop: 'userAccount',
    placeholder: '请输入用户账号',
  },
  {
    type: 'input',
    label: '用户名称：',
    prop: 'userName',
    placeholder: '请输入用户名称',
  },
  {
    type: 'select',
    label: '是否启用：',
    prop: 'isEnabled',
    placeholder: '全部',
    opts: [
      { label: '全部', value: '' },
      { label: '是', value: true },
      { label: '否', value: false },
    ],
  },
  {
    type: 'select',
    label: '是否到期：',
    prop: 'isExpired',
    placeholder: '全部',
    opts: [
      { label: '全部', value: '' },
      { label: '已到期', value: true },
      { label: '未到期', value: false },
    ],
  },
  {
    type: 'select',
    label: '营销组：',
    prop: 'marketingGroup',
    placeholder: '全部',
    opts: marketingGroupOptions,
  },
])

// 表格列配置
const columns = ref<TableColumn<Account>[]>([
  { prop: 'carrier', label: '运营商' },
  { prop: 'siteName', label: '局点名称' },
  { prop: 'userAccount', label: '用户账号' },
  { prop: 'userName', label: '用户名称' },
  { prop: 'roleName', label: '角色名称' },
  { prop: 'marketingGroup', label: '营销组' },
  {
    prop: 'isEnabled',
    label: '是否启用',
    width: 100,
  },
  { prop: 'validUntil', label: '有效期至' },
  {
    prop: 'isExpired',
    label: '是否到期',
    formatter: (row: Account) => (row.isExpired ? '已到期' : '未到期'),
  },
  { prop: 'creator', label: '创建人' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'updateTime', label: '更新时间' },
  { prop: 'operator', label: '操作', width: 320 },
])

/**
 * 数据处理方法
 */
// 获取表格数据
const getData = async () => {
  try {
    loading.value = true
    const res = await fetchAccountList({
      ...query,
      pageNo: page.index,
      pageSize: page.size,
    })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      page.total = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取数据失败')
      tableData.value = []
      page.total = 0
    }
  } catch (error) {
    console.error('获取数据失败:', error)
    ElMessage.error('获取数据失败')
    tableData.value = []
    page.total = 0
  } finally {
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
  query.carrier = ''
  query.siteName = ''
  query.userAccount = ''
  query.userName = ''
  query.marketingGroup = ''
  query.isEnabled = undefined
  query.isExpired = undefined
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

// 新增账号
const handleAdd = () => {
  router.push({ name: 'addAccount' })
}

// 编辑账号
const handleEdit = (row: Account) => {
  router.push(`/editAccount/${row.id}`)
}

// 角色配置
const handleRoleConfig = (row: Account) => {
  router.push(`/configAccountRole/${row.id}`)
}

// 营销组配置
const handleMarketingGroupConfig = (row: Account) => {
  router.push(`/configAccountMarketingGroup/${row.id}`)
}

// 初始化
getSiteList() // 获取局点列表
getMarketingGroupList() // 获取营销组列表
getData() // 获取表格数据
</script>

<style scoped>
/* 页面特有样式 */
.table-search {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>
