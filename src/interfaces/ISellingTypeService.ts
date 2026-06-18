import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetSellingTypeListRequest extends IGetListRequest {}

export interface InsertSellingTypeRequest extends IRequestWithLoading {
  sellingTypeName: string;
  userIn: number;
}

export interface UpdateSellingTypeRequest extends IRequestWithLoading {
  sellingTypeId: number;
  sellingTypeName: string;
  userUp: number;
  updatedAt: string;
}

export interface DeleteSellingTypeRequest extends IRequestWithLoading {
  sellingTypeId: number;
  userUp: number;
  updatedAt: string;
}
