<template>
  <el-select
    v-model="selectedValue"
    :placeholder="placeholder"
    clearable
    filterable
    @change="handleChange"
    :loading="loading"
  >
    <el-option
      v-for="item in siteList"
      :key="item.id"
      :label="item.siteName"
      :value="item.siteName"
    />
  </el-select>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import request from '@/utils/request'

// 定义站点数据结构
interface Site {
  id?: string | number
  siteName?: string
  carrier?: string
  carrierId?: number | string
  // 可能有其他字段
}

export default defineComponent({
  name: 'SiteSelect',
  props: {
    // 当前选中的站点
    modelValue: {
      type: String,
      default: '',
    },
    // 当前选中的运营商
    carrier: {
      type: [String, Number],
      default: '',
    },
    // 是否显示全部选项
    showAll: {
      type: Boolean,
      default: false,
    },
    // 是否允许站点反向选择运营商
    showReverseSelect: {
      type: Boolean,
      default: true,
    },
    // 占位文本
    placeholder: {
      type: String,
      default: '请选择站点',
    },
  },
  emits: ['update:modelValue', 'change', 'update:carrier'],
  setup(props, { emit }) {
    const loading = ref(false)
    const siteList = ref<Site[]>([])
    const selectedValue = ref<string>(props.modelValue || '')
    const siteCarrierMap = ref<Record<string, string | number>>({})

    // 记录当前来自站点选择的更新状态
    const fromSiteUpdate = ref<{ site: string; carrier: string | number } | null>(null)

    // 增加一个标记，用于反选场景，明确表示当前是否处于反选过程中
    const isReverseSelection = ref(false)

    // 增加一个保存的站点值，用于在反选过程中恢复
    const savedSite = ref<string>('')

    // 当 modelValue 变化时更新内部状态
    watch(
      () => props.modelValue,
      (newValue) => {
        console.log('SiteSelect: 监测到 modelValue 变化:', newValue)

        // 如果是反选过程中，且新值为空，则不更新内部状态（防止清空）
        if (isReverseSelection.value && !newValue && savedSite.value) {
          console.log('SiteSelect: 检测到反选过程中站点被清空，将保持原值:', savedSite.value)
          // 延迟恢复站点，等待运营商变化完成
          setTimeout(() => {
            console.log('SiteSelect: 恢复保存的站点值:', savedSite.value)
            selectedValue.value = savedSite.value
            emit('update:modelValue', savedSite.value)
          }, 200)
          return
        }

        // 正常情况下，同步内部状态
        console.log('SiteSelect: 更新内部选中值:', newValue)
        selectedValue.value = newValue as string
      },
      { immediate: true }, // 确保组件初始化时立即执行一次
    )

    // 监听运营商变化，重新获取站点列表
    watch(
      () => props.carrier,
      (newCarrier, oldCarrier) => {
        console.log('SiteSelect: 监测到运营商变化:', {
          新值: newCarrier || '空',
          旧值: oldCarrier || '空',
          当前站点: props.modelValue || '空',
          当前选中值: selectedValue.value || '空',
          fromSiteUpdate: fromSiteUpdate.value
            ? `${fromSiteUpdate.value.site} -> ${fromSiteUpdate.value.carrier}`
            : null,
          isReverseSelection: isReverseSelection.value,
          savedSite: savedSite.value,
        })

        // 如果是由站点选择引起的运营商变化（反选）
        if (fromSiteUpdate.value && String(fromSiteUpdate.value.carrier) === String(newCarrier)) {
          console.log(
            'SiteSelect: 运营商变化由站点选择引起，将保持当前站点选择:',
            fromSiteUpdate.value.site,
          )

          // 设置反选标记和保存当前站点
          isReverseSelection.value = true
          savedSite.value = fromSiteUpdate.value.site

          // 在请求站点列表前，先确保内部状态保持一致
          selectedValue.value = fromSiteUpdate.value.site

          // 获取新的站点列表
          getSiteList().then(() => {
            console.log('SiteSelect: 反选模式 - 站点列表更新完成，确保选择值保持:', savedSite.value)

            // 确保选中值不变
            selectedValue.value = savedSite.value

            // 如果外部值被清空，则重新设置
            if (props.modelValue !== savedSite.value) {
              console.log('SiteSelect: 反选模式 - 检测到外部值被清空，恢复为:', savedSite.value)
              emit('update:modelValue', savedSite.value)
            }

            // 延迟重置反选状态，确保所有操作完成
            setTimeout(() => {
              console.log('SiteSelect: 反选模式 - 完成所有流程，重置状态')
              isReverseSelection.value = false
              fromSiteUpdate.value = null
              savedSite.value = ''
            }, 300)
          })
        }
        // 正常的运营商变化（正选）- 需要清空站点选择
        else {
          console.log('SiteSelect: 正常运营商变化，清空站点选择')

          // 重置反选相关状态
          isReverseSelection.value = false
          savedSite.value = ''

          // 先清空选择，再获取新列表
          selectedValue.value = ''

          // 只有当外部值不为空时才需要发出清空事件
          if (props.modelValue) {
            emit('update:modelValue', '')
          }

          // 获取新的站点列表
          getSiteList()
        }
      },
    )

    const getSiteList = async () => {
      console.log('SiteSelect: 开始获取局点列表, 运营商:', props.carrier)
      loading.value = true

      // 重置站点-运营商映射
      siteCarrierMap.value = {}

      try {
        const res = await request({
          url: '/api/site/list',
          method: 'post',
          data: {
            carrierId: props.carrier,
            pageNum: 1,
            pageSize: 1000, // 获取足够多的局点数据
          },
        })
        console.log('SiteSelect: 局点列表接口返回:', res)

        // 适配不同的数据结构
        let siteData: Site[] = []

        if (Array.isArray(res.data)) {
          // 直接是数组格式
          siteData = res.data
        } else if (res.data && res.data.code === 200 && res.data.data && res.data.data.list) {
          // 嵌套结构
          siteData = res.data.data.list
        } else if (res.data && res.data.list) {
          // 简单的data.list结构
          siteData = res.data.list
        } else if (res.data && res.data.code === 200 && res.data.list) {
          // 另一种可能的结构
          siteData = res.data.list
        } else {
          console.warn('SiteSelect: 无法识别的局点数据结构:', res)
          siteData = []
        }

        // 构建站点与运营商的映射关系
        for (const site of siteData) {
          if (site.siteName) {
            // 优先使用 carrierId 字段，如果不存在则使用 carrier 字段
            const carrierValue = site.carrierId !== undefined ? site.carrierId : site.carrier
            if (carrierValue !== undefined) {
              siteCarrierMap.value[site.siteName] = carrierValue
            }
          }
        }

        // 如果需要显示"全部"选项
        if (props.showAll) {
          siteList.value = [{ id: '', siteName: '全部', carrier: '' }, ...siteData]
        } else {
          siteList.value = siteData
        }

        console.log('SiteSelect: 局点列表数据:', siteList.value.length, '个站点')
        console.log(
          'SiteSelect: 站点-运营商映射:',
          Object.keys(siteCarrierMap.value).length,
          '个映射',
        )

        // 重要:
        // 1. 在正选流程中（普通运营商变化），我们已经在watch中清空了选择
        // 2. 在反选流程中（站点引起的运营商变化），我们会在watch回调中处理选择的保留或清空
        // 因此，getSiteList不应该直接操作选择状态，避免冲突
      } catch (error) {
        console.error('SiteSelect: 获取局点列表失败:', error)
        // 出错时清空列表
        siteList.value = props.showAll ? [{ id: '', siteName: '全部', carrier: '' }] : []
      } finally {
        loading.value = false
      }

      return siteList.value
    }

    const handleChange = (value: string) => {
      console.log('SiteSelect: 局点选择变化:', value, {
        isReverseSelection: isReverseSelection.value,
        savedSite: savedSite.value,
        fromSiteUpdate: fromSiteUpdate.value
          ? `${fromSiteUpdate.value.site} -> ${fromSiteUpdate.value.carrier}`
          : null,
      })

      // 如果正在反选过程中，且当前值为空，但有保存的值
      if (isReverseSelection.value && !value && savedSite.value) {
        console.log('SiteSelect: 反选过程中检测到清空操作，恢复保存的值:', savedSite.value)
        setTimeout(() => {
          selectedValue.value = savedSite.value
          emit('update:modelValue', savedSite.value)
        }, 100)
        return
      }

      // 同步内部状态和触发外部更新
      selectedValue.value = value
      emit('update:modelValue', value)
      emit('change', value)

      // 如果正在处理回填，跳过反向设置
      if (fromSiteUpdate.value) {
        console.log('SiteSelect: 跳过反向设置运营商 (正在回填中)')
        return
      }

      // 如果选择的是"全部"，不进行运营商回填
      if (value === '全部') {
        console.log('SiteSelect: 选择了"全部"选项，不进行运营商回填')
        return
      }

      // 处理空值情况
      if (!value) {
        console.log('SiteSelect: 清空了选择，不进行运营商回填')
        // 确保清空反选状态
        isReverseSelection.value = false
        savedSite.value = ''
        return
      }

      // 如果选择了局点，检查是否需要更新运营商
      // 仅当启用了反向选择时执行
      if (props.showReverseSelect && value && siteCarrierMap.value[value]) {
        const newCarrier = siteCarrierMap.value[value]
        const shouldUpdate =
          props.carrier === '' || String(siteCarrierMap.value[value]) !== String(props.carrier)

        if (shouldUpdate) {
          console.log('SiteSelect: 开始反选流程 - 根据选择的局点回填运营商:', {
            siteName: value,
            newCarrier,
            currentCarrier: props.carrier || '空',
          })

          // 设置反选标记和保存站点值
          isReverseSelection.value = true
          savedSite.value = value

          // 记录回填操作，用于carrier的watch判断
          fromSiteUpdate.value = {
            site: value,
            carrier: newCarrier,
          }

          // 触发运营商更新
          emit('update:carrier', newCarrier)
        } else {
          console.log('SiteSelect: 局点对应的运营商与当前相同，无需回填', {
            siteName: value,
            carrier: newCarrier,
          })
        }
      }
    }

    onMounted(() => {
      console.log('SiteSelect: 组件已挂载，初始值:', {
        modelValue: props.modelValue,
        carrier: props.carrier,
        selectedValue: selectedValue.value,
      })

      // 获取当前运营商的局点列表
      getSiteList()

      // 如果当前没有选择运营商，但有选择站点，则预先加载所有站点以支持反选
      // 仅当启用了反向选择时执行
      if (props.showReverseSelect && !props.carrier && props.modelValue) {
        console.log('SiteSelect: 检测到初始化时有站点但无运营商，准备反选流程')

        // 设置反选状态，并保存站点值
        isReverseSelection.value = true
        savedSite.value = props.modelValue

        // 延迟执行以避免与正常加载冲突
        setTimeout(async () => {
          try {
            if (fromSiteUpdate.value) {
              console.log('SiteSelect: 跳过预加载 (正在回填中)')
              return
            }

            loading.value = true

            const res = await request({
              url: '/api/site/list',
              method: 'post',
              data: {
                pageNum: 1,
                pageSize: 5000, // 尝试获取所有局点
              },
            })

            console.log('SiteSelect: 预加载所有站点数据成功')

            // 解析数据
            let allSites: Site[] = []

            if (Array.isArray(res.data)) {
              allSites = res.data
            } else if (res.data && res.data.code === 200 && res.data.data && res.data.data.list) {
              allSites = res.data.data.list
            } else if (res.data && res.data.list) {
              allSites = res.data.list
            } else if (res.data && res.data.code === 200 && res.data.list) {
              allSites = res.data.list
            }

            // 构建完整的站点-运营商映射
            for (const site of allSites) {
              if (site.siteName) {
                const carrierValue = site.carrierId !== undefined ? site.carrierId : site.carrier
                if (carrierValue !== undefined) {
                  siteCarrierMap.value[site.siteName] = carrierValue
                }
              }
            }

            // 检查当前选中的站点是否在映射中
            if (
              props.showReverseSelect &&
              props.modelValue &&
              siteCarrierMap.value[props.modelValue] &&
              !props.carrier
            ) {
              console.log('SiteSelect: 找到当前选中站点的运营商信息，准备回填', {
                站点: props.modelValue,
                运营商: siteCarrierMap.value[props.modelValue],
              })
              const newCarrier = siteCarrierMap.value[props.modelValue]

              // 使用与handleChange中相同的逻辑
              // 确保值和状态保存正确
              savedSite.value = props.modelValue
              isReverseSelection.value = true

              // 记录回填信息用于watch判断
              fromSiteUpdate.value = {
                site: props.modelValue,
                carrier: newCarrier,
              }

              // 发送回填事件
              emit('update:carrier', newCarrier)
            }
          } catch (error) {
            console.error('SiteSelect: 预加载所有站点数据失败:', error)
            // 重置反选状态
            isReverseSelection.value = false
            savedSite.value = ''
          } finally {
            loading.value = false
          }
        }, 100)
      }
    })

    return {
      loading,
      siteList,
      selectedValue,
      handleChange,
    }
  },
})
</script>
