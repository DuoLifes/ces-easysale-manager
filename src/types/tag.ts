/**
 * 标签管理相关类型定义
 */

/**
 * 标签信息接口
 */
export interface Tag {
  id: number
  tagName: string
  tagType: string
  sites: string
  creator: string
  createTime: string
  updateTime: string
}

/**
 * 标签查询参数接口
 */
export interface TagQuery {
  tagName?: string
  tagType?: string
  site?: string
  pageNo?: number
  pageSize?: number
}

/**
 * 标签创建参数接口
 */
export interface TagCreate {
  tagName: string
  tagType: string
  creator: string
}

/**
 * 标签更新参数接口
 */
export interface TagUpdate extends Omit<TagCreate, 'creator'> {
  id: number
}

/**
 * 标签局点配置参数接口
 */
export interface TagSiteConfig {
  id: number
  sites: string
}
