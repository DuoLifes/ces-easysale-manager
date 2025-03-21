<template>
  <div class="page-container">
    <TableSearch
      :query="query"
      :options="searchOpt"
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
        title="标签列表"
        @addOperate="handleAdd"
      >
        <template #operator="{ rows: row }">
          <el-button class="light-blue-btn" size="small" :icon="Edit" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button class="light-red-btn" size="small" :icon="Delete" @click="handleDelete(row)">
            删除
          </el-button>
          <el-button
            class="light-blue-btn"
            size="small"
            :icon="Setting"
            @click="handleSiteConfig(row)"
          >
            局点配置
          </el-button>
        </template>
      </TableCustom>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Setting, Delete } from '@element-plus/icons-vue'
import type { Tag } from '@/types/tag'
import type { FormOptionList } from '@/types/form-option'
import type { TableColumn } from '@/components/table-custom.vue'
import { fetchTagList, deleteTag, fetchSiteData } from '@/api'
import { useRouter } from 'vue-router'
// 导入组件
import TableCustom from '@/components/table-custom.vue'
import TableSearch from '@/components/table-search.vue'

// 为组件定义名称
defineOptions({
  name: 'TagManagementView',
})

const router = useRouter()

/**
 * 状态定义
 */
// 查询条件
const query = reactive({
  tagName: '',
  tagType: '',
  site: '',
})

// 分页配置
const page = reactive({
  index: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<Tag[]>([])
const loading = ref(false)

// 局点列表选项
const siteOptions = ref([{ label: '全部', value: '' }])

// 标签类型选项 - 初始只有"全部"选项
const tagTypeOptions = ref([{ label: '全部', value: '' }])

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

// 查询表单配置
const searchOpt = ref<FormOptionList[]>([
  {
    type: 'input',
    label: '标签名称：',
    prop: 'tagName',
    placeholder: '请输入标签名称',
  },
  {
    type: 'select',
    label: '标签类别：',
    prop: 'tagType',
    placeholder: '全部',
    opts: tagTypeOptions,
  },
  {
    type: 'select',
    label: '局点：',
    prop: 'site',
    placeholder: '全部',
    opts: siteOptions,
  },
])

// 表格列配置
const columns = ref<TableColumn<Tag>[]>([
  { prop: 'id', label: '标签ID', width: 80 },
  { prop: 'tagName', label: '标签名称' },
  { prop: 'tagType', label: '标签类别' },
  { prop: 'sites', label: '所属局点' },
  { prop: 'operator', label: '操作', width: 320 },
])

/**
 * 数据处理方法
 */
// 获取表格数据
const getData = async () => {
  try {
    loading.value = true
    const res = await fetchTagList({
      ...query,
      pageNum: page.index,
      pageSize: page.size,
    })
    if (res.code === 200) {
      tableData.value = res.data.list || []
      page.total = res.data.total || 0

      // 更新标签类型选项，确保与返回数据匹配
      if (res.data.list && res.data.list.length > 0) {
        // 获取所有不重复的标签类型
        const tagTypes = [...new Set(res.data.list.map((item) => item.tagType))].filter(Boolean)

        // 重置选项，只保留"全部"
        tagTypeOptions.value = [{ label: '全部', value: '' }]

        // 添加从数据中获取的标签类型
        tagTypes.forEach((type) => {
          if (type) {
            tagTypeOptions.value.push({ label: type, value: type })
          }
        })

        // 将标签类型选项保存到localStorage，供其他页面使用
        const tagTypesForOtherPages = tagTypeOptions.value
          .filter((option) => option.value !== '') // 过滤掉"全部"选项
          .map((option) => ({ label: option.label, value: option.value }))

        localStorage.setItem('tagTypeOptions', JSON.stringify(tagTypesForOtherPages))
      }
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
  query.tagName = ''
  query.tagType = ''
  query.site = ''
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
 * 操作方法
 */
// 新增标签
const handleAdd = () => {
  router.push({ name: 'addTag' })
}

// 编辑标签
const handleEdit = (row: Tag) => {
  router.push(`/editTag/${row.id}`)
}

// 局点配置
const handleSiteConfig = (row: Tag) => {
  router.push(`/configTagSite/${row.id}`)
}

// 删除标签
const handleDelete = (row: Tag) => {
  ElMessageBox.confirm('确定要删除该标签吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteTag(row.id)
        if (res.code === 200) {
          ElMessage.success('删除成功')
          getData() // 刷新列表
        } else {
          ElMessage.error(res.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 初始化
getSiteList() // 获取局点列表
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
