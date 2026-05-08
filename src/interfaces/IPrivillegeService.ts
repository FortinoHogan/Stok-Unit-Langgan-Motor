import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetPrivillegeListRequest extends IGetListRequest {}

export interface InsertPrivillegeRequest extends IRequestWithLoading {
  privillegeName: string;
  userIn: number;
}

export interface UpdatePrivillegeRequest extends IRequestWithLoading {
  privillegeId: number;
  privillegeName: string;
  userUp: number;
  updatedAt: string;
}

export interface DeletePrivillegeRequest extends IRequestWithLoading {
  privillegeId: number;
  userUp: number;
  updatedAt: string;
}
