import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetPrivilegeListRequest extends IGetListRequest {}

export interface InsertPrivilegeRequest extends IRequestWithLoading {
  privilegeName: string;
  userIn: number;
}

export interface UpdatePrivilegeRequest extends IRequestWithLoading {
  privilegeId: number;
  privilegeName: string;
  userUp: number;
  updatedAt: string;
}

export interface DeletePrivilegeRequest extends IRequestWithLoading {
  privilegeId: number;
  userUp: number;
  updatedAt: string;
}
