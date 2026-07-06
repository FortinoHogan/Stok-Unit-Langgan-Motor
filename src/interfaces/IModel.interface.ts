import type { PostgrestError } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";

// Sidebar Model
export type SidebarSubMenuItem = {
  title: string;
  url: string;
};

export type SidebarMenuItem = {
  title: string;
  url?: string;
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
  isDeleted: boolean;
  roleId: number;
  roleName: string;
}

export interface MsCategory extends IModel {
  categoryId: number;
  categoryName: string;
}

export interface MsColor extends IModel {
  colorId: number;
  colorName: string;
}

export interface MsPeriod extends IModel {
  periodId: number;
  startDate: string;
  endDate: string;
  isDefault: boolean;
}

export interface MsPrivilege extends IModel {
  privilegeId: number;
  privilegeName: string;
}

export interface MsProgram extends IModel {
  programId: number;
  programName: string;
}

export interface MsRole extends IModel {
  roleId: number;
  roleName: string;
}

export interface MsSales extends IModel {
  salesId: number;
  salesName: string;
}

export interface MsSellingType extends IModel {
  sellingTypeId: number;
  sellingTypeName: string;
}

export interface MsType extends IModel {
  typeId: number;
  typeName: string;
  typeCode: string;
  typeDescription: string;
  categoryId: number;
}

export interface MsVolume extends IModel {
  volumeId: number;
  volume: number;
}

export interface TrRolePrivilege extends IModel {
  rolePrivilegeId: number;
  roleId: number;
  privilegeId: number;
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

export interface TrTransactionDetail extends IModel {
  transactionDetailId: number;
  transactionId: number;
  volumeId: number;
  sellingTypeId: number;
  sellingNumber: string;
  name: string;
  address: string;
  phone: string;
  salesId: number;
}

export interface TrTypeColor extends IModel {
  typeColorId: number;
  colorId: number;
  typeId: number;
}
