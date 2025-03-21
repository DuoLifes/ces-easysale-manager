export interface MarketingGroup {
  id: number
  carrier: string
  siteName: string
  marketingGroupName: string
  marketingGroupDes: string
  creator: string
  createTime: string
  updateTime: string
}

export interface MarketingGroupRegister {
  carrier: string
  siteName: string
  marketingGroupName: string
  marketingGroupDes: string
}
