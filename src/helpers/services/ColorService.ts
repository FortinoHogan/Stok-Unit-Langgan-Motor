import type {
  IGetListRequest,
  IResponse,
  MsColor,
} from "@/interfaces/IModel.interface";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";
import type {
  DeleteColorRequest,
  InsertColorRequest,
  UpdateColorRequest,
} from "@/interfaces/IColorService";

const getColorList = async (
  params: IGetListRequest,
): Promise<IResponse<MsColor[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    const res = await ApiService.request<MsColor[]>(() =>
      (() => {
        let query = supabase
          .from("MsColor")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("createdAt", { ascending: false })
          .order("colorId", { ascending: false })
          .range(from, to);

        if (search?.trim()) {
          query = query.ilike("colorName", `%${search.trim()}%`);
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

const insertColor = async (
  params: InsertColorRequest,
): Promise<IResponse<MsColor>> => {
  const { colorName, userIn, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<MsColor>(() =>
      supabase.from("MsColor").insert({ colorName, userIn }).select().single(),
    );
    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updateColor = async (
  params: UpdateColorRequest,
): Promise<IResponse<MsColor>> => {
  const { colorId, colorName, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<MsColor>(() =>
      supabase
        .from("MsColor")
        .update({ colorName, userUp, updatedAt })
        .eq("colorId", colorId)
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

const deleteColor = async (
  params: DeleteColorRequest,
): Promise<IResponse<MsColor>> => {
  const { colorId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<MsColor>(() =>
      supabase
        .from("MsColor")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("colorId", colorId)
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

export const ColorService = {
  getColorList,
  insertColor,
  updateColor,
  deleteColor,
};
