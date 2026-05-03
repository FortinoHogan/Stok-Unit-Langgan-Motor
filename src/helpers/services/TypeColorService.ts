import type { IResponse, TrTypeColor } from "@/interfaces/IModel.interface";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";
import type {
  DeleteTypeColorRequest,
  GetTypeColorListByTypeIdsRequest,
  InsertTypeColorRequest,
} from "@/interfaces/ITypeColorService";

const getTypeColorListByTypeIds = async (
  params: GetTypeColorListByTypeIdsRequest,
): Promise<IResponse<TrTypeColor[]>> => {
  const { typeIds, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    if (!typeIds.length) {
      return {
        data: [],
        error: null,
        status: 200,
        statusText: "OK",
      };
    }

    const res = await ApiService.request<TrTypeColor[]>(() =>
      supabase
        .from("TrTypeColor")
        .select("*")
        .in("typeId", typeIds)
        .eq("isDeleted", false)
        .order("createdAt", { ascending: false }),
    );

    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const insertTypeColor = async (
  params: InsertTypeColorRequest,
): Promise<IResponse<TrTypeColor>> => {
  const { typeId, colorId, userIn, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<TrTypeColor>(() =>
      supabase
        .from("TrTypeColor")
        .insert({ typeId, colorId, userIn })
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

const deleteTypeColor = async (
  params: DeleteTypeColorRequest,
): Promise<IResponse<TrTypeColor>> => {
  const { typeColorId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<TrTypeColor>(() =>
      supabase
        .from("TrTypeColor")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("typeColorId", typeColorId)
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

export const TypeColorService = {
  getTypeColorListByTypeIds,
  insertTypeColor,
  deleteTypeColor,
};
