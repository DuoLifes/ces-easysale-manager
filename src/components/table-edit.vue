<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    :label-width="options.labelWidth"
    :validate-on-rule-change="false"
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
            @input="handleInput(item.prop)"
          ></el-input>
          <el-input-number
            v-else-if="item.type === 'number'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            controls-position="right"
            @change="handleInput(item.prop)"
          ></el-input-number>
          <el-select
            v-else-if="item.type === 'select'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            clearable
            @change="handleInput(item.prop)"
          >
            <el-option
              v-for="opt in item.opts"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
          <el-input
            v-else-if="item.type === 'textarea'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            type="textarea"
            :rows="4"
            @input="handleInput(item.prop)"
          ></el-input>
          <el-date-picker
            v-else-if="item.type === 'date'"
            type="date"
            v-model="form[item.prop]"
            :value-format="item.format"
            @change="handleInput(item.prop)"
          ></el-date-picker>
          <el-switch
            v-else-if="item.type === 'switch'"
            v-model="form[item.prop]"
            :active-value="item.activeValue"
            :inactive-value="item.inactiveValue"
            :active-text="item.activeText"
            :inactive-text="item.inactiveText"
            @change="handleInput(item.prop)"
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
      <el-button type="primary" @click="saveEdit(formRef)">确 定</el-button>
      <el-button @click="$emit('cancel')">取 消</el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import type { FormOption } from '@/types/form-option'
import type { FormInstance, FormRules, UploadProps, FormItemRule } from 'element-plus'
import type { PropType } from 'vue'
import { ref } from 'vue'

const emit = defineEmits(['cancel', 'update:modelValue'])

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

const form = ref({ ...(edit ? formData : {}) })
const formRef = ref<FormInstance>()

// 生成校验规则
const rules: FormRules = options.list.reduce((acc, item) => {
  if (item.required) {
    const baseRule: FormItemRule = {
      required: true,
      message: `${item.label}不能为空`,
      trigger: ['blur', 'change'],
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
    } else if (item.type === 'select') {
      baseRule.type = 'enum'
      baseRule.enum = item.opts?.map((opt) => opt.value) || []
    }

    acc[item.prop] = fieldRules
  }
  return acc
}, {} as FormRules)

// 处理输入事件，实时校验
const handleInput = (prop: string) => {
  if (formRef.value) {
    formRef.value.validateField(prop)
  }
}

const saveEdit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  formEl.validate((valid) => {
    if (valid) {
      update(form.value)
    }
  })
}

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
