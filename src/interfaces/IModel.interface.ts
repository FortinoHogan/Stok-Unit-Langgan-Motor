import type { PostgrestError } from "@supabase/supabase-js";

interface IModel {
  createdAt: string;
  userIn: number;
  userUp: number;
  updatedAt: string;
}

export interface IResponse<T> {
  data: T | null;
  error: PostgrestError | null;
  status: number;
  statusText: string;
}

export interface AuthenticatedUser {
  createdAt: string;
  userId: number;
  email: string;
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
}

export interface TrTypeColor extends IModel {
  typeColorId: number;
  colorId: number;
  typeId: number;
}
