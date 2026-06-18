import type {
  IGetListRequest,
  IResponse,
  MsSales,
} from "@/interfaces/IModel.interface";
import type {
  DeleteSalesRequest,
  InsertSalesRequest,
  UpdateSalesRequest,
} from "@/interfaces/ISalesService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getSalesList = async (
  params: IGetListRequest,
): Promise<IResponse<MsSales[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    return await ApiService.request<MsSales[]>(() =>
      (() => {
        let query = supabase
          .from("MsSales")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("salesId", { ascending: true })
          .range(from, to);

        if (search?.trim()) {
          query = query.ilike("salesName", `%${search.trim()}%`);
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

const insertSales = async (
  params: InsertSalesRequest,
): Promise<IResponse<MsSales>> => {
  const { salesName, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsSales>(() =>
      supabase.from("MsSales").insert({ salesName, userIn }).select().single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updateSales = async (
  params: UpdateSalesRequest,
): Promise<IResponse<MsSales>> => {
  const { salesId, salesName, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsSales>(() =>
      supabase
        .from("MsSales")
        .update({ salesName, userUp, updatedAt })
        .eq("salesId", salesId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deleteSales = async (
  params: DeleteSalesRequest,
): Promise<IResponse<MsSales>> => {
  const { salesId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsSales>(() =>
      supabase
        .from("MsSales")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("salesId", salesId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const SalesService = {
  getSalesList,
  insertSales,
  updateSales,
  deleteSales,
};
