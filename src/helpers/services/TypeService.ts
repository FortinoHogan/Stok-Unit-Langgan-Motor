import type {
  IGetListRequest,
  IResponse,
  MsType,
} from "@/interfaces/IModel.interface";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";
import type {
  DeleteTypeRequest,
  InsertTypeRequest,
  UpdateTypeRequest,
} from "@/interfaces/ITypeService";

const getTypeList = async (
  params: IGetListRequest,
): Promise<IResponse<MsType[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    const res = await ApiService.request<MsType[]>(() =>
      (() => {
        let query = supabase
          .from("MsType")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("categoryId", { ascending: true })
          .order("typeName", { ascending: true })
          .range(from, to);

        if (search?.trim()) {
          const normalizedSearch = search.trim().toLowerCase();

          query = query.or(
            `typeName.ilike.*${normalizedSearch}*,typeCode.ilike.*${normalizedSearch}*,typeDescription.ilike.*${normalizedSearch}*`,
          );
        }

        return query;
      })(),
    );

    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const insertType = async (
  params: InsertTypeRequest,
): Promise<IResponse<MsType>> => {
  const {
    typeName,
    typeCode,
    typeDescription,
    categoryId,
    userIn,
    setIsLoading,
  } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<MsType>(() =>
      supabase
        .from("MsType")
        .insert({ typeName, typeCode, typeDescription, categoryId, userIn })
        .select()
        .single(),
    );
    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updateType = async (
  params: UpdateTypeRequest,
): Promise<IResponse<MsType>> => {
  const {
    typeId,
    typeName,
    typeCode,
    typeDescription,
    categoryId,
    userUp,
    updatedAt,
    setIsLoading,
  } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<MsType>(() =>
      supabase
        .from("MsType")
        .update({
          typeName,
          typeCode,
          typeDescription,
          categoryId,
          userUp,
          updatedAt,
        })
        .eq("typeId", typeId)
        .select()
        .single(),
    );
    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deleteType = async (
  params: DeleteTypeRequest,
): Promise<IResponse<MsType>> => {
  const { typeId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<MsType>(() =>
      supabase
        .from("MsType")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("typeId", typeId)
        .select()
        .single(),
    );
    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const TypeService = {
  getTypeList,
  insertType,
  updateType,
  deleteType,
};
