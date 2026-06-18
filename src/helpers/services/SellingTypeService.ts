import type {
  IGetListRequest,
  IResponse,
  MsSellingType,
} from "@/interfaces/IModel.interface";
import type {
  DeleteSellingTypeRequest,
  InsertSellingTypeRequest,
  UpdateSellingTypeRequest,
} from "@/interfaces/ISellingTypeService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getSellingTypeList = async (
  params: IGetListRequest,
): Promise<IResponse<MsSellingType[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    return await ApiService.request<MsSellingType[]>(() =>
      (() => {
        let query = supabase
          .from("MsSellingType")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("createdAt", { ascending: false })
          .order("sellingTypeId", { ascending: false })
          .range(from, to);

        if (search?.trim()) {
          query = query.ilike("sellingTypeName", `%${search.trim()}%`);
        }

        return query;
      })(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const insertSellingType = async (
  params: InsertSellingTypeRequest,
): Promise<IResponse<MsSellingType>> => {
  const { sellingTypeName, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsSellingType>(() =>
      supabase
        .from("MsSellingType")
        .insert({ sellingTypeName, userIn })
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updateSellingType = async (
  params: UpdateSellingTypeRequest,
): Promise<IResponse<MsSellingType>> => {
  const { sellingTypeId, sellingTypeName, userUp, updatedAt, setIsLoading } =
    params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsSellingType>(() =>
      supabase
        .from("MsSellingType")
        .update({ sellingTypeName, userUp, updatedAt })
        .eq("sellingTypeId", sellingTypeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deleteSellingType = async (
  params: DeleteSellingTypeRequest,
): Promise<IResponse<MsSellingType>> => {
  const { sellingTypeId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsSellingType>(() =>
      supabase
        .from("MsSellingType")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("sellingTypeId", sellingTypeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const SellingTypeService = {
  getSellingTypeList,
  insertSellingType,
  updateSellingType,
  deleteSellingType,
};
