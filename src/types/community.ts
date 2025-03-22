/**
 * 小区信息接口
 */
export interface Community {
  id: number
  carrier: string
  siteName: string
  gridName: string
  communityName: string
  creator: string
  createTime: string
  updateTime: string
}

/**
 * 小区查询参数
 */
export interface CommunityQuery {
  carrier?: string
  siteName?: string
  gridName?: string
  communityName?: string
  pageNo?: number
  pageSize?: number
}

/**
 * 小区创建参数
 */
export interface CommunityCreate {
  carrier: string
  siteName: string
  gridName: string
  communityName: string
  creator: string
}

/**
 * 小区更新参数
 */
export interface CommunityUpdate {
  id: number
  carrier: string
  siteName: string
  gridName: string
  communityName: string
}
