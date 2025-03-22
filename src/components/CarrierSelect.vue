<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    clearable
    filterable
    @change="handleChange"
  >
    <el-option v-for="item in carrierList" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script lang="ts">
import { ref, onMounted, watch } from 'vue'
import request from '@/utils/request'

interface Carrier {
  id: number | string
  name: string
}

export default {
  name: 'CarrierSelect',
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    placeholder: {
      type: String,
      default: '请选择运营商',
    },
    showAll: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const carrierList = ref<Carrier[]>([])
    const selectedValue = ref<string | number>(props.modelValue)

    // 监听modelValue变化
    watch(
      () => props.modelValue,
      (newVal) => {
        selectedValue.value = newVal
      },
    )

    const getCarrierList = async () => {
      console.log('开始获取运营商列表')
      try {
        const res = await request({
          url: '/api/carrier/list',
          method: 'post',
          data: {},
        })
        console.log('运营商列表接口返回:', res)

        // 适配不同的数据结构
        let carrierData: Carrier[] = []

        if (Array.isArray(res.data)) {
          // 直接是数组格式
          carrierData = res.data
        } else if (res.data && res.data.code === 200 && res.data.data && res.data.data.list) {
          // 之前的嵌套结构
          carrierData = res.data.data.list
        } else if (res.data && res.data.list) {
          // 另一种可能的结构
          carrierData = res.data.list
        } else {
          console.warn('无法识别的运营商数据结构:', res.data)
          carrierData = []
        }

        // 如果需要显示"全部"选项
        if (props.showAll) {
          carrierList.value = [{ id: '', name: '全部' }, ...carrierData]
        } else {
          carrierList.value = carrierData
        }

        console.log('运营商列表数据:', carrierList.value)
      } catch (error) {
        console.error('获取运营商列表失败:', error)
      }
    }

    const handleChange = (value: string | number) => {
      console.log('运营商选择变化:', value)
      emit('update:modelValue', value)
      emit('change', value)
    }

    onMounted(() => {
      console.log('CarrierSelect组件已挂载')
      getCarrierList()
    })

    return {
      carrierList,
      selectedValue,
      handleChange,
    }
  },
}
</script>
