import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetCategoryListRequest extends IGetListRequest {}

export interface InsertCategoryRequest extends IRequestWithLoading {
  categoryName: string;
  userIn: number;
}

export interface UpdateCategoryRequest extends IRequestWithLoading {
  categoryId: number;
  categoryName: string;
  userUp: number;
  updatedAt: string;
}

export interface DeleteCategoryRequest extends IRequestWithLoading {
  categoryId: number;
  userUp: number;
  updatedAt: string;
}
