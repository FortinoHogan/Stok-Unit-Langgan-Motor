import type { PostgrestError } from "@supabase/supabase-js";

// API Call Base Model
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

// Database Model

interface IModel {
  createdAt: string;
  userIn: number;
  userUp: number;
  updatedAt: string;
  isDeleted: boolean;
}

export interface AuthenticatedUser {
  createdAt: string;
  userId: number;
  email: string;
  isAdmin: boolean;
  isDeleted: boolean;
}

export interface MsCategory extends IModel {
  categoryId: number;
  categoryName: string;
}

export interface MsColor extends IModel {
  colorId: number;
  colorName: string;
}

export interface MsType extends IModel {
  typeId: number;
  typeName: string;
  typeCode: string;
  typeDescription: string;
  categoryId: number;
}

export interface TrTypeColor extends IModel {
  typeColorId: number;
  colorId: number;
  typeId: number;
}
