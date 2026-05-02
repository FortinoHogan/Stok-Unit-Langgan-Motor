import type {
  IGetListRequest,
  IResponse,
  MsCategory,
} from "@/interfaces/IModel.interface";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";
import type {
  DeleteCategoryRequest,
  InsertCategoryRequest,
  UpdateCategoryRequest,
} from "@/interfaces/ICategoryService";

const getCategoryList = async (
  params: IGetListRequest,
): Promise<IResponse<MsCategory[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    const res = await ApiService.request<MsCategory[]>(() =>
      (() => {
        let query = supabase
          .from("MsCategory")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("createdAt", { ascending: false })
          .order("categoryId", { ascending: false })
          .range(from, to);

        if (search?.trim()) {
          query = query.ilike("categoryName", `%${search.trim()}%`);
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

const insertCategory = async (
  params: InsertCategoryRequest,
): Promise<IResponse<MsCategory>> => {
  const { categoryName, userIn, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<MsCategory>(() =>
      supabase
        .from("MsCategory")
        .insert({ categoryName, userIn })
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

const updateCategory = async (
  params: UpdateCategoryRequest,
): Promise<IResponse<MsCategory>> => {
  const { categoryId, categoryName, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<MsCategory>(() =>
      supabase
        .from("MsCategory")
        .update({ categoryName, userUp, updatedAt })
        .eq("categoryId", categoryId)
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

const deleteCategory = async (
  params: DeleteCategoryRequest,
): Promise<IResponse<MsCategory>> => {
  const { categoryId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<MsCategory>(() =>
      supabase
        .from("MsCategory")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("categoryId", categoryId)
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

export const CategoryService = {
  getCategoryList,
  insertCategory,
  updateCategory,
  deleteCategory,
};
