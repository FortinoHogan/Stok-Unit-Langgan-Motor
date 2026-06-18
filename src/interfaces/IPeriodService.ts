import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetPeriodListRequest extends IGetListRequest {}

export interface InsertPeriodRequest extends IRequestWithLoading {
  startDate: string;
  endDate: string;
  isDefault: boolean;
  userIn: number;
}

export interface UpdatePeriodRequest extends IRequestWithLoading {
  periodId: number;
  startDate: string;
  endDate: string;
  isDefault: boolean;
  userUp: number;
  updatedAt: string;
}

export interface DeletePeriodRequest extends IRequestWithLoading {
  periodId: number;
  userUp: number;
  updatedAt: string;
}
