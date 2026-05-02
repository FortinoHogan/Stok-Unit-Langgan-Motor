import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetTypeListRequest extends IGetListRequest {}

export interface InsertTypeRequest extends IRequestWithLoading {
  typeName: string;
  typeCode: string;
  typeDescription: string;
  userIn: number;
}

export interface UpdateTypeRequest extends IRequestWithLoading {
  typeId: number;
  typeName: string;
  typeCode: string;
  typeDescription: string;
  userUp: number;
  updatedAt: string;
}

export interface DeleteTypeRequest extends IRequestWithLoading {
  typeId: number;
  userUp: number;
  updatedAt: string;
}
