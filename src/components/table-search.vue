<template>
  <div class="search-container">
    <el-form ref="searchRef" :model="query" :inline="true">
      <div class="form-items" :style="{ '--form-items-per-row': props.layout }">
        <el-form-item
          :label="item.label"
          :prop="item.prop"
          v-for="item in options"
          :key="item.prop"
        >
          <el-input
            v-if="item.type === 'input'"
            v-model="query[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            clearable
          ></el-input>
          <el-select
            v-else-if="item.type === 'select'"
            v-model="query[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            clearable
          >
            <el-option
              v-for="opt in item.opts"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
          <el-date-picker
            v-else-if="item.type === 'date'"
            type="date"
            v-model="query[item.prop]"
            :value-format="item.format"
          ></el-date-picker>
        </el-form-item>
        <div class="button-wrapper">
          <div class="button-group">
            <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
            <el-button :icon="Refresh" @click="resetForm(searchRef)">重置</el-button>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { PropType } from 'vue'
import { ref } from 'vue'
import type { FormOptionList } from '@/types/form-option'

const props = defineProps({
  query: {
    type: Object,
    required: true,
  },
  options: {
    type: Array as PropType<Array<FormOptionList>>,
    required: true,
  },
  search: {
    type: Function,
    default: () => {},
  },
  reset: {
    type: Function,
    default: () => {},
  },
  layout: {
    type: Number,
    default: 3,
  },
  fixedButtons: {
    type: Boolean,
    default: false,
  },
})

const searchRef = ref<FormInstance>()
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  props.reset()
}

const search = () => {
  props.search()
}
</script>

<style scoped>
.search-container {
  background-color: #fff;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

:deep(.el-form) {
  display: flex;
  flex-wrap: wrap;
  padding-right: 30px;
}

.form-items {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(var(--form-items-per-row), 1fr);
  gap: 20px;
  align-items: start;
  padding-top: 15px;
}

:deep(.el-form-item) {
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 32px;
}

:deep(.el-form-item__label) {
  width: 100px !important;
  text-align: right;
  flex-shrink: 0;
  line-height: 32px;
  padding-right: 12px;
}

:deep(.el-form-item__content) {
  flex: 1;
  margin-left: 0 !important;
  line-height: 32px;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  line-height: 32px;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 32px;
  grid-column: -2 / -1;
}

.button-group {
  display: flex;
  gap: 10px;
  padding-left: 100px;
}
</style>
