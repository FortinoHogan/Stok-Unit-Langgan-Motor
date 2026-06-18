import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetSalesListRequest extends IGetListRequest {}

export interface InsertSalesRequest extends IRequestWithLoading {
  salesName: string;
  userIn: number;
}

export interface UpdateSalesRequest extends IRequestWithLoading {
  salesId: number;
  salesName: string;
  userUp: number;
  updatedAt: string;
}

export interface DeleteSalesRequest extends IRequestWithLoading {
  salesId: number;
  userUp: number;
  updatedAt: string;
}
