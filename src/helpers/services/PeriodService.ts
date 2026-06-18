import type {
  IGetListRequest,
  IResponse,
  MsPeriod,
} from "@/interfaces/IModel.interface";
import type {
  DeletePeriodRequest,
  InsertPeriodRequest,
  UpdatePeriodRequest,
} from "@/interfaces/IPeriodService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getPeriodList = async (
  params: IGetListRequest,
): Promise<IResponse<MsPeriod[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    return await ApiService.request<MsPeriod[]>(() =>
      (() => {
        let query = supabase
          .from("MsPeriod")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("isDefault", { ascending: false })
          .order("startDate", { ascending: false })
          .order("periodId", { ascending: false })
          .range(from, to);

        if (search?.trim()) {
          const normalizedSearch = search.trim();
          query = query.or(
            `startDate.ilike.*${normalizedSearch}*,endDate.ilike.*${normalizedSearch}*`,
          );
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

const insertPeriod = async (
  params: InsertPeriodRequest,
): Promise<IResponse<MsPeriod>> => {
  const { startDate, endDate, isDefault, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    if (isDefault) {
      await supabase
        .from("MsPeriod")
        .update({ isDefault: false })
        .eq("isDefault", true);
    }

    return await ApiService.request<MsPeriod>(() =>
      supabase
        .from("MsPeriod")
        .insert({ startDate, endDate, isDefault, userIn })
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updatePeriod = async (
  params: UpdatePeriodRequest,
): Promise<IResponse<MsPeriod>> => {
  const {
    periodId,
    startDate,
    endDate,
    isDefault,
    userUp,
    updatedAt,
    setIsLoading,
  } = params;
  setIsLoading?.(true);

  try {
    if (isDefault) {
      await supabase
        .from("MsPeriod")
        .update({ isDefault: false })
        .neq("periodId", periodId)
        .eq("isDefault", true);
    }

    return await ApiService.request<MsPeriod>(() =>
      supabase
        .from("MsPeriod")
        .update({ startDate, endDate, isDefault, userUp, updatedAt })
        .eq("periodId", periodId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deletePeriod = async (
  params: DeletePeriodRequest,
): Promise<IResponse<MsPeriod>> => {
  const { periodId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsPeriod>(() =>
      supabase
        .from("MsPeriod")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("periodId", periodId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const PeriodService = {
  getPeriodList,
  insertPeriod,
  updatePeriod,
  deletePeriod,
};
