<!-- 网格管理页面 -->
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
      @update:query="handleQueryUpdate"
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
        title="网格列表"
        @addOperate="handleAdd"
      />
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="visible"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
      @open="handleDialogOpen"
      @closed="handleDialogClosed"
    >
      <template #header>
        <DialogTitle :title="isEdit ? '编辑网格' : '新增网格'" />
      </template>
      <TableEdit
        ref="editFormRef"
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
import { ref, reactive, watch, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import type { Grid } from '@/types/grid'
import type { FormOption, FormOptionList } from '@/types/form-option'
import { fetchGridData, addGrid, updateGrid, deleteGrid } from '@/api'

// 导入组件
import TableCustom from '@/components/common/table-custom.vue'
import TableSearch from '@/components/common/table-search.vue'
import TableEdit from '@/components/common/table-edit.vue'
import DialogTitle from '@/components/common/dialog-title.vue'
import CarrierSelect from '@/components/carrier/CarrierSelect.vue'
import SiteSelect from '@/components/site/SiteSelect.vue'

// 为组件定义名称
defineOptions({
  name: 'GridManagementView',
})

/**
 * 接口定义
 */
// 表格行数据通用类型
type TableRowData = Record<string, unknown>

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
})

// 分页配置
const page = reactive({
  index: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<Grid[]>([])

// 弹窗控制
const visible = ref(false)
const isEdit = ref(false)
const rowData = ref<Partial<Grid>>({})

// 表单引用
const editFormRef = ref()

// 加载状态
const loading = ref(false)

/**
 * 配置定义
 */
// 查询表单配置
const searchOpt = ref<FormOptionList[]>([
  {
    type: 'custom-component',
    label: '运营商：',
    prop: 'carrier',
    placeholder: '全部',
    component: markRaw(CarrierSelect),
  },
  {
    type: 'custom-component',
    label: '局点名称：',
    prop: 'siteName',
    placeholder: '请选择局点',
    component: markRaw(SiteSelect),
    componentProps: {
      showReverseSelect: true,
    },
  },
  {
    type: 'input',
    label: '网格名称：',
    prop: 'gridName',
    placeholder: '请输入网格名称',
  },
])

// 表格列配置
const columns = ref([
  { prop: 'carrier', label: '运营商' },
  { prop: 'siteName', label: '局点名称' },
  { prop: 'gridName', label: '网格名称' },
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
      component: markRaw(CarrierSelect),
      showAll: false,
    },
    {
      type: 'select',
      label: '局点名称',
      prop: 'siteName',
      placeholder: '请选择局点',
      required: true,
      component: markRaw(SiteSelect),
      componentProps: {
        showReverseSelect: true,
      },
    },
    {
      type: 'input',
      label: '网格名称',
      prop: 'gridName',
      placeholder: '请输入',
      required: true,
    },
  ],
})

// 监听运营商变化，重置局点
watch(
  () => query.carrier,
  () => {
    // 当运营商变化时，清空局点选择
    query.siteName = ''
  },
)

/**
 * 数据处理方法
 */
// 获取表格数据
const getData = async () => {
  try {
    // 显示加载状态
    loading.value = true
    const res = await fetchGridData({
      carrier: query.carrier === 'all' ? '' : query.carrier,
      siteName: query.siteName,
      gridName: query.gridName,
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
// 处理查询对象更新
const handleQueryUpdate = (newQuery: typeof query): void => {
  console.log('Grid: 查询条件更新:', newQuery)
  // 更新查询条件
  Object.assign(query, newQuery)
}

// 重置查询条件
const resetQuery = () => {
  // 重置查询条件
  query.carrier = ''
  query.siteName = ''
  query.gridName = ''
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
// 新增网格
const handleAdd = () => {
  rowData.value = {}
  isEdit.value = false
  visible.value = true
}

// 编辑网格
const handleEdit = (row: TableRowData) => {
  rowData.value = { ...row } as unknown as Grid
  isEdit.value = true
  visible.value = true
}

// 关闭弹窗
const closeDialog = () => {
  visible.value = false
  // 延迟重置数据，等待动画完成
  setTimeout(() => {
    isEdit.value = false
    rowData.value = {}
  }, 100)
}

/**
 * CRUD操作方法
 */
// 删除网格
const handleDelete = async (row: TableRowData) => {
  try {
    const grid = row as unknown as Grid
    const res = await deleteGrid(grid.id)
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

// 更新网格信息
const handleUpdate = async (formData: Partial<Grid>) => {
  try {
    if (!formData.carrier || !formData.siteName || !formData.gridName) {
      ElMessage.error('请填写必填字段')
      return
    }

    if (!isEdit.value) {
      // 新增网格
      const res = await addGrid({
        carrier: formData.carrier,
        siteName: formData.siteName,
        gridName: formData.gridName,
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
      // 编辑网格
      const res = await updateGrid({
        id: formData.id!,
        carrier: formData.carrier,
        siteName: formData.siteName,
        gridName: formData.gridName,
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

// 对话框事件处理
const handleDialogOpen = () => {
  console.log('Grid: 对话框打开')
  // 对话框打开后，等一小段时间再重置表单，确保组件已挂载
  setTimeout(() => {
    if (editFormRef.value) {
      editFormRef.value.resetFields()
    }
  }, 100)
}

const handleDialogClosed = () => {
  console.log('Grid: 对话框已关闭')
  // 不需要在这里调用closeDialog，因为closed事件在关闭后触发
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
