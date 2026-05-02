import type { PostgrestError } from "@supabase/supabase-js";

interface IModel {
  createdAt: string;
  userIn: number;
  userUp: number;
  updatedAt: string;
}

interface IModelMaster extends IModel {
  isDeleted: boolean;
}

export interface IResponse<T> {
  data: T | null;
  error: PostgrestError | null;
  status: number;
  statusText: string;
  count?: number | null;
}

export interface IRequestWithLoading {
  setIsLoading?: (val: boolean) => void;
}

export interface IGetListRequest extends IRequestWithLoading {
  page: number;
  pageSize: number;
  search?: string;
}

export interface AuthenticatedUser {
  createdAt: string;
  userId: number;
  email: string;
  isAdmin: boolean;
  isDeleted: boolean;
}

export interface MsCategory extends IModelMaster {
  categoryId: number;
  categoryName: string;
}

export interface MsColor extends IModelMaster {
  colorId: number;
  colorName: string;
}

export interface MsType extends IModelMaster {
  typeId: number;
  typeName: string;
  typeCode: string;
  typeDescription: string;
}

export interface TrTypeColor extends IModel {
  typeColorId: number;
  colorId: number;
  typeId: number;
}
