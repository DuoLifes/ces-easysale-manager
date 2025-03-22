/**
 * 策略管理相关类型定义
 */

/**
 * 策略信息接口
 */
export interface Strategy {
  id: number // 策略ID
  strategyName: string // 策略名称
  carrier: string // 运营商
  product: string // 推荐产品
  technique: string // 话术
  strategyType: string // 策略类别
  sites: string // 所属局点
  creator?: string // 创建人（可选）
  createTime?: string // 创建时间（可选）
  updateTime?: string // 更新时间（可选）
}

/**
 * 策略查询参数接口
 */
export interface StrategyQuery {
  strategyName?: string // 策略名称
  carrier?: string // 运营商
  strategyType?: string // 策略类别
  site?: string // 所属局点
  pageNo?: number // 当前页码
  pageSize?: number // 每页条数
}

/**
 * 策略创建参数接口
 */
export interface StrategyCreate {
  strategyName: string // 策略名称
  carrier: string // 运营商
  product: string // 推荐产品
  technique: string // 话术
  strategyType: string // 策略类别
  creator: string // 创建人
}

/**
 * 策略更新参数接口
 */
export interface StrategyUpdate extends Omit<StrategyCreate, 'creator'> {
  id: number // 策略ID
}

/**
 * 策略局点配置参数接口
 */
export interface StrategySiteConfig {
  id: number // 策略ID
  sites: string // 所属局点（多个局点用逗号分隔）
}
