import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetRoleListRequest extends IGetListRequest {}

export interface InsertRoleRequest extends IRequestWithLoading {
  roleName: string;
  userIn: number;
}

export interface UpdateRoleRequest extends IRequestWithLoading {
  roleId: number;
  roleName: string;
  userUp: number;
  updatedAt: string;
}

export interface DeleteRoleRequest extends IRequestWithLoading {
  roleId: number;
  userUp: number;
  updatedAt: string;
}
