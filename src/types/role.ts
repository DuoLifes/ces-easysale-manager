export interface Role {
  id: number
  roleName: string
  roleDes: string
  creator: string
  createTime: string
  updateTime: string
}

export interface RoleRegister {
  roleName: string
  roleDes: string
}
