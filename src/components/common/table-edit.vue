<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    :label-width="options.labelWidth"
    :validate-on-rule-change="false"
    status-icon
  >
    <el-row>
      <el-col :span="options.span" v-for="item in options.list" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop">
          <!-- 文本框、数字框、下拉框、日期框、开关、上传 -->
          <el-input
            v-if="item.type === 'input'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            clearable
          ></el-input>
          <el-input-number
            v-else-if="item.type === 'number'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            controls-position="right"
          ></el-input-number>
          <el-select
            v-else-if="item.type === 'select' && !item.component"
            v-model="form[item.prop]"
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
          <!-- 自定义组件 -->
          <component
            v-else-if="item.type === 'select' && item.component"
            :is="item.component"
            v-model="form[item.prop]"
            :placeholder="item.placeholder"
            :showAll="item.showAll === false ? false : true"
            :carrier="item.prop === 'siteName' ? form['carrier'] : ''"
            @update:carrier="handleUpdateCarrier"
          ></component>
          <el-input
            v-else-if="item.type === 'textarea'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            type="textarea"
            :rows="4"
          ></el-input>
          <el-date-picker
            v-else-if="item.type === 'date'"
            type="date"
            v-model="form[item.prop]"
            :value-format="item.format"
          ></el-date-picker>
          <el-switch
            v-else-if="item.type === 'switch'"
            v-model="form[item.prop]"
            :active-value="item.activeValue"
            :inactive-value="item.inactiveValue"
            :active-text="item.activeText"
            :inactive-text="item.inactiveText"
          ></el-switch>
          <el-upload
            v-else-if="item.type === 'upload'"
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
          >
            <img v-if="form[item.prop]" :src="form[item.prop]" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <slot :name="item.prop" v-else> </slot>
        </el-form-item>
      </el-col>
    </el-row>

    <div class="dialog-footer">
      <el-button type="primary" @click="submitForm(formRef)">确 定</el-button>
      <el-button @click="cancelEdit">取 消</el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import type { FormOption } from '@/types/form-option'
import type { FormInstance, FormRules, UploadProps, FormItemRule } from 'element-plus'
import type { PropType } from 'vue'
import { ref, watch } from 'vue'

const { options, formData, edit, update } = defineProps({
  options: {
    type: Object as PropType<FormOption>,
    required: true,
  },
  formData: {
    type: Object,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
  },
  update: {
    type: Function,
    required: true,
  },
})

// 触发取消事件
const emit = defineEmits(['cancel'])

// 取消编辑的方法
const cancelEdit = () => {
  emit('cancel')
}

const form = ref({ ...(edit ? formData : {}) })
const formRef = ref<FormInstance>()

// 处理运营商更新事件
const handleUpdateCarrier = (val: string | number): void => {
  console.log('TableEdit: 收到运营商更新:', val)

  // 更新运营商值
  form.value.carrier = val

  // 清除站点选择
  if (form.value.siteName) {
    setTimeout(() => {
      console.log('TableEdit: 清空站点选择')
      form.value.siteName = ''
    }, 100)
  }
}

// 监听form中carrier的变化，当运营商变化时清空局点选择
watch(
  () => form.value.carrier,
  (newVal) => {
    console.log('TableEdit: 运营商变化为:', newVal)

    if (form.value.siteName) {
      // 延迟一点清空，以避免视觉上的不连贯
      setTimeout(() => {
        console.log('TableEdit: 清空站点选择')
        form.value.siteName = ''
      }, 100)
    }
  },
)

// 生成校验规则
const rules: FormRules = options.list.reduce((acc, item) => {
  if (item.required) {
    const baseRule: FormItemRule = {
      required: true,
      message: `请输入${item.label}`,
      trigger: item.type === 'select' ? 'change' : 'blur',
    }

    // 根据字段类型添加额外的校验规则
    const fieldRules: FormItemRule[] = [baseRule]

    if (item.type === 'input') {
      baseRule.whitespace = true // 不允许纯空格
    } else if (item.type === 'number') {
      fieldRules.push({
        type: 'number',
        message: `${item.label}必须是数字`,
        trigger: 'change',
      })
    }

    acc[item.prop] = fieldRules
  }
  return acc
}, {} as FormRules)

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  try {
    await formEl.validate((valid, fields) => {
      if (valid) {
        console.log('TableEdit: 表单验证通过，提交数据')
        update(form.value)
      } else {
        console.log('TableEdit: 表单验证失败', fields)
      }
    })
  } catch (e) {
    console.error('TableEdit: 表单验证过程出错', e)
  }
}

// 重置表单方法
const resetFields = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 暴露方法给父组件
defineExpose({
  resetFields,
})

const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  form.value.thumb = URL.createObjectURL(uploadFile.raw!)
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer :deep(.el-form-item__content) {
  justify-content: center;
  margin-left: 0 !important;
}

.dialog-footer .el-button {
  padding-left: 25px;
  padding-right: 25px;
  margin: 0 10px;
}
</style>
