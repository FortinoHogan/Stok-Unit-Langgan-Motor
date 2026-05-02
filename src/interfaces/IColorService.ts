import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetColorListRequest extends IGetListRequest {}

export interface InsertColorRequest extends IRequestWithLoading {
  colorName: string;
  userIn: number;
}

export interface UpdateColorRequest extends IRequestWithLoading {
  colorId: number;
  colorName: string;
  userUp: number;
  updatedAt: string;
}

export interface DeleteColorRequest extends IRequestWithLoading {
  colorId: number;
  userUp: number;
  updatedAt: string;
}
