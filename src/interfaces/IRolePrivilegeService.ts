import type { IRequestWithLoading } from "./IModel.interface";

export interface GetRolePrivilegeListByRoleIdsRequest extends IRequestWithLoading {
  roleIds: number[];
}

export interface InsertRolePrivilegeRequest extends IRequestWithLoading {
  roleId: number;
  privilegeId: number;
  userIn: number;
}

export interface DeleteRolePrivilegeRequest extends IRequestWithLoading {
  rolePrivilegeId: number;
  userUp: number;
  updatedAt: string;
}
