<!-- 小区管理页面 -->
<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <TableSearch
      :query="query"
      :options="searchOpt"
      :search="handleSearch"
      :reset="resetQuery"
      :layout="4"
      :fixed-buttons="true"
      class="table-search"
    />

    <!-- 数据表格 -->
    <div class="container">
      <TableCustom
        :columns="columns"
        :tableData="tableData"
        :total="page.total"
        :currentPage="page.index"
        :pageSize="page.size"
        :pageSizes="[10, 15, 20]"
        :changePage="changePage"
        :sizeChange="handleSizeChange"
        :editFunc="handleEdit"
        :delFunc="handleDelete"
        :showView="false"
        :showEdit="true"
        :showDelete="true"
        :loading="loading"
        :max-height="650"
        title="小区列表"
        @addOperate="handleAdd"
      />
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="visible"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <template #header>
        <DialogTitle :title="isEdit ? '编辑小区' : '新增小区'" />
      </template>
      <TableEdit
        :form-data="rowData"
        :options="options"
        :edit="isEdit"
        :update="handleUpdate"
        @cancel="closeDialog"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { Community } from '@/types/community'
import type { FormOption, FormOptionList } from '@/types/form-option'
import { fetchCommunityData, addCommunity, updateCommunity, deleteCommunity } from '@/api'

// 导入组件
import TableCustom from '@/components/common/table-custom.vue'
import TableSearch from '@/components/common/table-search.vue'
import TableEdit from '@/components/common/table-edit.vue'
import DialogTitle from '@/components/common/dialog-title.vue'

// 为组件定义名称
defineOptions({
  name: 'CommunityManagementView',
})

/**
 * 接口定义
 */
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

interface ApiError {
  msg?: string
}

/**
 * 状态变量
 */
// 查询条件
const query = reactive({
  carrier: '',
  siteName: '',
  gridName: '',
  communityName: '',
})

// 分页配置
const page = reactive({
  index: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<Community[]>([])

// 弹窗控制
const visible = ref(false)
const isEdit = ref(false)
const rowData = ref<Partial<Community>>({})

// 加载状态
const loading = ref(false)

/**
 * 配置定义
 */
// 查询表单配置
const searchOpt = ref<FormOptionList[]>([
  {
    type: 'select',
    label: '运营商：',
    prop: 'carrier',
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
    label: '局点名称：',
    prop: 'siteName',
    placeholder: '请输入局点名称',
  },
  {
    type: 'input',
    label: '网格名称：',
    prop: 'gridName',
    placeholder: '请输入网格名称',
  },
  {
    type: 'input',
    label: '小区名称：',
    prop: 'communityName',
    placeholder: '请输入小区名称',
  },
])

// 表格列配置
const columns = ref([
  { prop: 'carrier', label: '运营商' },
  { prop: 'siteName', label: '局点名称' },
  { prop: 'gridName', label: '网格名称' },
  { prop: 'communityName', label: '小区名称' },
  { prop: 'creator', label: '创建人' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'updateTime', label: '更新时间' },
  { prop: 'operator', label: '操作', width: 250 },
])

// 表单配置
const options = ref<FormOption>({
  labelWidth: '100px',
  span: 24,
  list: [
    {
      type: 'select',
      label: '运营商',
      prop: 'carrier',
      required: true,
      opts: [
        { label: '移动', value: '移动' },
        { label: '联通', value: '联通' },
        { label: '电信', value: '电信' },
      ],
    },
    {
      type: 'input',
      label: '局点名称',
      prop: 'siteName',
      placeholder: '请输入',
      required: true,
    },
    {
      type: 'input',
      label: '网格名称',
      prop: 'gridName',
      placeholder: '请输入',
      required: true,
    },
    {
      type: 'input',
      label: '小区名称',
      prop: 'communityName',
      placeholder: '请输入',
      required: true,
    },
  ],
})

/**
 * 数据处理方法
 */
// 获取表格数据
const getData = async () => {
  try {
    // 显示加载状态
    loading.value = true
    const res = await fetchCommunityData({
      carrier: query.carrier === 'all' ? '' : query.carrier,
      siteName: query.siteName,
      gridName: query.gridName,
      communityName: query.communityName,
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
  query.carrier = ''
  query.siteName = ''
  query.gridName = ''
  query.communityName = ''
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
 * 表单操作方法
 */
// 新增小区
const handleAdd = () => {
  rowData.value = {}
  isEdit.value = false
  visible.value = true
}

// 编辑小区
const handleEdit = (row: Community) => {
  rowData.value = { ...row }
  isEdit.value = true
  visible.value = true
}

// 关闭弹窗
const closeDialog = () => {
  visible.value = false
  isEdit.value = false
  rowData.value = {}
}

/**
 * CRUD操作方法
 */
// 删除小区
const handleDelete = async (row: Community) => {
  try {
    const res = await deleteCommunity(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await getData()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error((error as ApiError)?.msg || '删除失败')
  }
}

// 更新小区信息
const handleUpdate = async (formData: Partial<Community>) => {
  try {
    if (!formData.carrier || !formData.siteName || !formData.gridName || !formData.communityName) {
      ElMessage.error('请填写必填字段')
      return
    }

    if (!isEdit.value) {
      // 新增小区
      const res = await addCommunity({
        carrier: formData.carrier,
        siteName: formData.siteName,
        gridName: formData.gridName,
        communityName: formData.communityName,
        creator: 'admin',
      })

      if (res.code === 200) {
        ElMessage.success('添加成功')
        closeDialog()
        getData()
      } else {
        ElMessage.error(res.msg || '添加失败')
      }
    } else {
      // 编辑小区
      const res = await updateCommunity({
        id: formData.id!,
        carrier: formData.carrier,
        siteName: formData.siteName,
        gridName: formData.gridName,
        communityName: formData.communityName,
      })

      if (res.code === 200) {
        ElMessage.success('更新成功')
        closeDialog()
        getData()
      } else {
        ElMessage.error(res.msg || '更新失败')
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error((error as ApiError)?.msg || '操作失败')
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
</style>
