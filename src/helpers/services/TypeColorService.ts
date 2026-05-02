import type { IResponse, TrTypeColor } from "@/interfaces/IModel.interface";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";
import type {
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

export const TypeColorService = {
  getTypeColorListByTypeIds,
  insertTypeColor,
};
