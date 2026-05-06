import type { PostgrestError } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";

// Sidebar Model
export type SidebarSubMenuItem = {
  title: string;
  url: string;
  isAdminOnly?: boolean;
};

export type SidebarMenuItem = {
  title: string;
  url?: string;
  isAdminOnly?: boolean;
  icon?: LucideIcon;
  subItems?: SidebarSubMenuItem[];
};

export type SidebarMenuGroup = {
  title: string;
  items: SidebarMenuItem[];
};

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

export interface TrTransaction extends IModel {
  transactionId: number;
  typeColorId: number;
  noMesin: string;
  noRangka: string;
  year: number;
  isRFS: boolean;
  dateDO: string;
  dateOUT: string;
}
