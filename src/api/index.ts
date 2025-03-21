import request from '../utils/request'
import type { Site } from '@/types/site'
import type { Grid, GridQuery, GridCreate, GridUpdate } from '@/types/grid'
import type { Community, CommunityQuery, CommunityCreate, CommunityUpdate } from '@/types/community'
import type { MarketingGroup } from '@/types/marketing-group'
import type { Role } from '@/types/role'
import type { Account, AccountCreate, AccountUpdate } from '@/types/account'
import type { Tag, TagQuery, TagCreate, TagUpdate, TagSiteConfig } from '@/types/tag'
import type {
  Strategy,
  StrategyQuery,
  StrategyCreate,
  StrategyUpdate,
  StrategySiteConfig,
} from '@/types/strategy'
import type { Prospect } from '@/types/prospect'

/**
 * API 响应数据接口
 * @template T - 响应数据的类型
 */
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

/**
 * 登录参数接口
 */
interface LoginParams {
  username: string
  password: string
}

/**
 * 局点查询参数接口
 */
interface SiteQueryParams {
  carrier?: string
  siteName?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 营销组查询参数接口
 */
interface MarketingGroupQueryParams {
  carrier?: string
  siteName?: string
  marketingGroupName?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 角色查询参数接口
 */
interface RoleQueryParams {
  roleName?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 潜客查询参数接口
 */
interface ProspectQueryParams {
  siteName?: string
  gridName?: string
  userAccount?: string
  pageNum?: number
  pageSize?: number
}

/**
 * 用户登录
 * @param data - 登录参数，包含用户名和密码
 * @returns Promise<ApiResponse> - 返回登录结果，成功时包含token和权限信息
 */
export const login = (
  data: LoginParams,
): Promise<
  ApiResponse<{
    token: string
    permissions: string[]
    userInfo: {
      username: string
      avatar: string
      role: string
    }
  }>
> => {
  return request({
    url: '/api/login',
    method: 'post',
    data,
  })
}

/**
 * 获取局点数据列表
 * @param params - 查询参数，包含运营商、局点名称和分页信息
 * @returns Promise<ApiResponse> - 返回局点数据列表和总数
 */
export const fetchSiteData = (
  params?: SiteQueryParams,
): Promise<ApiResponse<{ list: Site[]; total: number }>> => {
  return request({
    url: '/api/site/list',
    method: 'post',
    data: {
      carrier: params?.carrier === 'all' ? '' : params?.carrier || '',
      siteName: params?.siteName || '',
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    },
  })
}

/**
 * 添加新局点
 * @param data - 局点数据，包含运营商、局点名称、局点描述和创建者信息
 * @returns Promise<ApiResponse> - 返回添加结果，成功时包含新增的局点数据
 */
export const addSite = (data: {
  carrier: string
  siteName: string
  siteDes: string
  creator: string
}): Promise<ApiResponse<Site>> => {
  return request({
    url: '/api/site/add',
    method: 'post',
    data,
  })
}

/**
 * 更新局点信息
 * @param data - 局点数据，包含运营商、局点名称和局点描述
 * @returns Promise<ApiResponse> - 返回更新结果，成功时包含更新后的局点数据
 */
export const updateSite = (data: {
  id: number
  carrier: string
  siteName: string
  siteDes: string
}): Promise<ApiResponse<Site>> => {
  return request({
    url: '/api/site/modify',
    method: 'put',
    data,
  })
}

/**
 * 删除局点
 * @param id 局点ID
 */
export const deleteSite = (id: string) => {
  return request({
    url: '/api/site/delete',
    method: 'delete',
    data: { id },
  })
}

/**
 * 网格管理接口
 */
// 获取网格列表
export const fetchGridData = (
  params: GridQuery,
): Promise<ApiResponse<{ list: Grid[]; total: number }>> => {
  return request({
    url: '/api/grid/list',
    method: 'post',
    data: {
      carrier: params?.carrier === 'all' ? '' : params?.carrier || '',
      siteName: params?.siteName || '',
      gridName: params?.gridName || '',
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    },
  })
}

// 新增网格
export const addGrid = (data: GridCreate) => {
  return request({
    url: '/api/grid/add',
    method: 'post',
    data,
  }) as Promise<ApiResponse<Grid>>
}

// 更新网格
export const updateGrid = (data: GridUpdate) => {
  return request({
    url: '/api/grid/modify',
    method: 'put',
    data,
  }) as Promise<ApiResponse<Grid>>
}

/**
 * 删除网格
 * @param id 网格ID
 */
export const deleteGrid = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/grid/delete',
    method: 'delete',
    data: { id },
  })
}

/**
 * 小区管理接口
 */
// 获取小区列表
export const fetchCommunityData = (
  params: CommunityQuery,
): Promise<ApiResponse<{ list: Community[]; total: number }>> => {
  return request({
    url: '/api/community/list',
    method: 'post',
    data: {
      carrier: params?.carrier === 'all' ? '' : params?.carrier || '',
      siteName: params?.siteName || '',
      gridName: params?.gridName || '',
      communityName: params?.communityName || '',
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    },
  })
}

// 新增小区
export const addCommunity = (data: CommunityCreate): Promise<ApiResponse<Community>> => {
  return request({
    url: '/api/community/add',
    method: 'post',
    data,
  })
}

// 更新小区
export const updateCommunity = (data: CommunityUpdate): Promise<ApiResponse<Community>> => {
  return request({
    url: '/api/community/modify',
    method: 'put',
    data,
  })
}

// 删除小区
export const deleteCommunity = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/community/delete',
    method: 'delete',
    data: { id },
  })
}

/**
 * 获取营销组数据列表
 * @param params - 查询参数，包含运营商、局点名称、营销组名称和分页信息
 * @returns Promise<ApiResponse> - 返回营销组数据列表和总数
 */
export const fetchMarketingGroupData = (
  params?: MarketingGroupQueryParams,
): Promise<ApiResponse<{ list: MarketingGroup[]; total: number }>> => {
  return request({
    url: '/api/marketing-group/list',
    method: 'post',
    data: {
      carrier: params?.carrier === 'all' ? '' : params?.carrier || '',
      siteName: params?.siteName || '',
      marketingGroupName: params?.marketingGroupName || '',
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    },
  })
}

/**
 * 添加新营销组
 * @param data - 营销组数据，包含运营商、局点名称、营销组名称、营销组描述和创建者信息
 * @returns Promise<ApiResponse> - 返回添加结果，成功时包含新增的营销组数据
 */
export const addMarketingGroup = (data: {
  carrier: string
  siteName: string
  marketingGroupName: string
  marketingGroupDes: string
  creator: string
}): Promise<ApiResponse<MarketingGroup>> => {
  return request({
    url: '/api/marketing-group/add',
    method: 'post',
    data,
  })
}

/**
 * 更新营销组信息
 * @param data - 营销组数据，包含运营商、局点名称、营销组名称和营销组描述
 * @returns Promise<ApiResponse> - 返回更新结果，成功时包含更新后的营销组数据
 */
export const updateMarketingGroup = (data: {
  id: number
  carrier: string
  siteName: string
  marketingGroupName: string
  marketingGroupDes: string
}): Promise<ApiResponse<MarketingGroup>> => {
  return request({
    url: '/api/marketing-group/modify',
    method: 'put',
    data,
  })
}

/**
 * 删除营销组
 * @param id 营销组ID
 */
export const deleteMarketingGroup = (id: string) => {
  return request({
    url: '/api/marketing-group/delete',
    method: 'delete',
    data: { id },
  })
}

/**
 * 获取角色数据列表
 * @param params - 查询参数，包含角色名称和分页信息
 * @returns Promise<ApiResponse> - 返回角色数据列表和总数
 */
export const fetchRoleData = (
  params?: RoleQueryParams,
): Promise<ApiResponse<{ list: Role[]; total: number }>> => {
  return request({
    url: '/api/role/list',
    method: 'post',
    data: {
      roleName: params?.roleName || '',
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    },
  })
}

/**
 * 添加新角色
 * @param data - 角色数据，包含角色名称、角色描述和创建者信息
 * @returns Promise<ApiResponse> - 返回添加结果，成功时包含新增的角色数据
 */
export const addRole = (data: {
  roleName: string
  roleDes: string
  creator: string
}): Promise<ApiResponse<Role>> => {
  return request({
    url: '/api/role/add',
    method: 'post',
    data,
  })
}

/**
 * 更新角色信息
 * @param data - 角色数据，包含角色名称和角色描述
 * @returns Promise<ApiResponse> - 返回更新结果，成功时包含更新后的角色数据
 */
export const updateRole = (data: {
  id: number
  roleName: string
  roleDes: string
}): Promise<ApiResponse<Role>> => {
  return request({
    url: '/api/role/modify',
    method: 'put',
    data,
  })
}

/**
 * 删除角色
 * @param id 角色ID
 */
export const deleteRole = (id: string) => {
  return request({
    url: '/api/role/delete',
    method: 'delete',
    data: { id },
  })
}

/**
 * 账号管理接口
 */
// 获取账户列表
export const fetchAccountList = (params: {
  carrier?: string
  siteName?: string
  userAccount?: string
  userName?: string
  roleName?: string
  marketingGroup?: string
  isEnabled?: boolean
  isExpired?: boolean
  pageNum: number
  pageSize: number
}) => {
  return request({
    url: '/api/account/list',
    method: 'post',
    data: {
      carrier: params.carrier || '',
      siteName: params.siteName || '',
      userAccount: params.userAccount || '',
      userName: params.userName || '',
      roleName: params.roleName || '',
      marketingGroup: params.marketingGroup || '',
      isEnabled: params.isEnabled,
      isExpired: params.isExpired,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    },
  })
}

// 新增账号
export const addAccount = (data: AccountCreate) => {
  return request({
    url: '/api/account/add',
    method: 'post',
    data,
  })
}

// 更新账号
export const updateAccount = (data: AccountUpdate) => {
  return request({
    url: '/api/account/update',
    method: 'put',
    data,
  })
}

// 删除账号
export const deleteAccount = (id: number) => {
  return request({
    url: `/api/account/delete/${id}`,
    method: 'delete',
  })
}

// 更新账号状态
export const updateAccountStatus = (id: number, enabled: boolean): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/account/status',
    method: 'put',
    data: { id, enabled },
  })
}

/**
 * 获取账号详情
 * @param id 账号ID
 */
export const getAccountDetail = (id: number): Promise<ApiResponse<Account>> => {
  return request({
    url: `/api/account/detail/${id}`,
    method: 'get',
  })
}

/**
 * 更新账号角色
 * @param id 账号ID
 * @param roleName 角色名称
 */
export const updateAccountRole = (id: number, roleName: string): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/account/role',
    method: 'put',
    data: { id, roleName },
  })
}

/**
 * 更新账号营销组
 * @param id 账号ID
 * @param marketingGroups 营销组名称，多个营销组用逗号分隔
 */
export const updateAccountMarketingGroup = (
  id: number,
  marketingGroups: string,
): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/account/marketing-group',
    method: 'put',
    data: { id, marketingGroups },
  })
}

/**
 * 标签管理接口
 */
// 获取标签列表
export const fetchTagList = (
  params: TagQuery,
): Promise<ApiResponse<{ list: Tag[]; total: number }>> => {
  return request({
    url: '/api/tag/list',
    method: 'post',
    data: {
      tagName: params.tagName || '',
      tagType: params.tagType || '',
      site: params.site || '',
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
    },
  })
}

// 新增标签
export const addTag = (data: TagCreate): Promise<ApiResponse<Tag>> => {
  return request({
    url: '/api/tag/add',
    method: 'post',
    data,
  })
}

// 更新标签
export const updateTag = (data: TagUpdate): Promise<ApiResponse<Tag>> => {
  return request({
    url: '/api/tag/modify',
    method: 'put',
    data,
  })
}

// 删除标签
export const deleteTag = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/tag/delete',
    method: 'delete',
    data: { id },
  })
}

// 获取标签详情
export const getTagDetail = (id: number): Promise<ApiResponse<Tag>> => {
  return request({
    url: `/api/tag/detail/${id}`,
    method: 'get',
  })
}

// 更新标签局点配置
export const updateTagSites = (data: TagSiteConfig): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/tag/modify',
    method: 'put',
    data,
  })
}

/**
 * 策略管理接口
 */
// 获取策略列表
export const fetchStrategyList = (
  params: StrategyQuery,
): Promise<ApiResponse<{ list: Strategy[]; total: number }>> => {
  return request({
    url: '/api/strategy/list',
    method: 'post',
    data: {
      strategyName: params.strategyName || '',
      carrier: params.carrier || '',
      strategyType: params.strategyType || '',
      site: params.site || '',
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
    },
  })
}

// 新增策略
export const addStrategy = (data: StrategyCreate): Promise<ApiResponse<Strategy>> => {
  return request({
    url: '/api/strategy/add',
    method: 'post',
    data,
  })
}

// 更新策略
export const updateStrategy = (data: StrategyUpdate): Promise<ApiResponse<Strategy>> => {
  return request({
    url: '/api/strategy/modify',
    method: 'put',
    data,
  })
}

// 删除策略
export const deleteStrategy = (id: number): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/strategy/delete',
    method: 'delete',
    data: { id },
  })
}

// 获取策略详情
export const getStrategyDetail = (id: number): Promise<ApiResponse<Strategy>> => {
  return request({
    url: `/api/strategy/detail/${id}`,
    method: 'get',
  })
}

// 更新策略局点配置
export const updateStrategySites = (data: StrategySiteConfig): Promise<ApiResponse<null>> => {
  return request({
    url: '/api/strategy/modify',
    method: 'put',
    data,
  })
}

/**
 * 获取潜客数据列表
 * @param params - 查询参数，包含局点、网格，用户账号和分页信息
 * @returns Promise<ApiResponse> - 返回潜客数据列表和总数
 */
export const fetchProspectData = (
  params?: ProspectQueryParams,
): Promise<ApiResponse<{ list: Prospect[]; total: number }>> => {
  return request({
    url: '/api/prospect/list',
    method: 'post',
    data: {
      siteName: params?.siteName === 'all' ? '' : params?.siteName || '',
      gridName: params?.gridName === 'all' ? '' : params?.gridName || '',
      userAccount: params?.userAccount || '',
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
    },
  })
}

/**
 * 删除潜客
 * @param id 潜客ID
 */
export const deleteProspect = (id: string) => {
  return request({
    url: '/api/prospect/delete',
    method: 'delete',
    data: { id },
  })
}
