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
        :editFunc="handleEdit"
        :delFunc="handleDelete"
        :showView="false"
        :showEdit="true"
        :showDelete="true"
        :loading="loading"
        :max-height="650"
        title="角色列表"
        @addOperate="handleAdd"
      >
      </TableCustom>
    </div>
    <el-dialog
      v-model="visible"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <template #header>
        <DialogTitle :title="isEdit ? '编辑角色' : '新增角色'" />
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
import type { Role } from '@/types/role'
import type { FormOption, FormOptionList } from '@/types/form-option'
import { fetchRoleData, addRole, updateRole, deleteRole } from '@/api'

// 导入组件
import TableCustom from '@/components/common/table-custom.vue'
import TableSearch from '@/components/common/table-search.vue'
import TableEdit from '@/components/common/table-edit.vue'
import DialogTitle from '@/components/common/dialog-title.vue'

/**
 * API 响应数据接口
 */
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

interface ApiError {
  msg?: string
}

// 为组件定义名称
defineOptions({
  name: 'RoleManagementView',
})

/**
 * 状态定义
 */
// 查询条件
const query = reactive({
  roleName: '',
})

// 分页配置
const page = reactive({
  index: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<Role[]>([])
const visible = ref(false)
const isEdit = ref(false)
const rowData = ref<Partial<Role>>({})
const loading = ref(false)

/**
 * 配置项定义
 */
// 查询表单配置
const searchOpt = ref<FormOptionList[]>([
  {
    type: 'input',
    label: '角色名称：',
    prop: 'roleName',
    placeholder: '请输入角色名称',
  },
])

// 表格列配置
const columns = ref([
  { prop: 'roleName', label: '角色名称' },
  { prop: 'roleDes', label: '角色描述' },
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
    { type: 'input', label: '角色名称', prop: 'roleName', placeholder: '请输入', required: true },
    {
      type: 'textarea',
      label: '角色描述',
      prop: 'roleDes',
      placeholder: '请输入',
      required: false,
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
    const res = await fetchRoleData({
      roleName: query.roleName,
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
  query.roleName = ''
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
  rowData.value = {}
  isEdit.value = false
  visible.value = true
}

const handleEdit = (row: Role) => {
  rowData.value = { ...row }
  isEdit.value = true
  visible.value = true
}

/**
 * 处理删除操作
 * @param row - 要删除的角色数据
 */
const handleDelete = async (row: Role) => {
  try {
    const res = await deleteRole(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      await getData() // 刷新列表
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage.error((error as ApiError)?.msg || '删除失败')
  }
}

const handleUpdate = async (formData: Partial<Role>) => {
  try {
    if (!formData.roleName) {
      ElMessage.error('请填写必填字段')
      return
    }

    if (!isEdit.value) {
      // 新增角色
      const res = (await addRole({
        roleName: formData.roleName,
        roleDes: formData.roleDes || '',
        creator: 'admin', // TODO: 从用户状态中获取
      })) as ApiResponse<Role>

      if (res.code === 200) {
        ElMessage.success('添加成功')
        closeDialog()
        getData() // 刷新列表
      } else {
        ElMessage.error(res.msg || '添加失败')
      }
    } else {
      // 编辑角色
      const res = (await updateRole({
        id: formData.id!,
        roleName: formData.roleName,
        roleDes: formData.roleDes || '',
      })) as ApiResponse<Role>

      if (res.code === 200) {
        ElMessage.success('更新成功')
        closeDialog()
        getData() // 刷新列表
      } else {
        ElMessage.error(res.msg || '更新失败')
      }
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error((error as ApiError)?.msg || '操作失败')
  }
}

const closeDialog = () => {
  visible.value = false
  isEdit.value = false
  rowData.value = {}
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
