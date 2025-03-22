/**
 * 账号管理相关类型定义
 */

/**
 * 账号信息接口
 */
export interface Account {
  id: number
  carrier: string
  siteName: string
  userAccount: string
  userName: string
  roleName: string
  marketingGroup: string
  isEnabled: boolean
  validUntil: string
  isExpired: boolean
  creator: string
  createTime: string
  updateTime: string
}

/**
 * 账号查询参数接口
 */
export interface AccountQuery {
  carrier?: string
  siteName?: string
  username?: string
  realName?: string
  enabled?: string
  expired?: string
  marketingGroup?: string
  pageNo?: number
  pageSize?: number
}

/**
 * 账号创建参数接口
 */
export interface AccountCreate {
  carrier: string
  siteName: string
  userAccount: string
  userName: string
  roleName: string
  marketingGroup: string
  isEnabled: boolean
  validUntil: string
  creator: string
}

/**
 * 账号更新参数接口
 */
export interface AccountUpdate extends AccountCreate {
  id: number
  createTime?: string
  updateTime?: string
}
