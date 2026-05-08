import type { IRequestWithLoading } from "./IModel.interface";

export interface GetRolePrivillegeListByRoleIdsRequest extends IRequestWithLoading {
  roleIds: number[];
}

export interface InsertRolePrivillegeRequest extends IRequestWithLoading {
  roleId: number;
  privillegeId: number;
  userIn: number;
}

export interface DeleteRolePrivillegeRequest extends IRequestWithLoading {
  rolePrivillegeId: number;
  userUp: number;
  updatedAt: string;
}
