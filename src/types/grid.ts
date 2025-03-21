/**
 * 网格信息接口
 */
export interface Grid {
  id: number
  carrier: string
  siteName: string
  gridName: string
  creator: string
  createTime: string
  updateTime: string
}

/**
 * 网格查询参数
 */
export interface GridQuery {
  carrier?: string
  siteName?: string
  gridName?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 网格创建参数
 */
export interface GridCreate {
  carrier: string
  siteName: string
  gridName: string
  creator: string
}

/**
 * 网格更新参数
 */
export interface GridUpdate {
  id: number
  carrier: string
  siteName: string
  gridName: string
}
