import type { IGetListRequest, IResponse, MsPrivillege } from "@/interfaces/IModel.interface";
import type {
  DeletePrivillegeRequest,
  InsertPrivillegeRequest,
  UpdatePrivillegeRequest,
} from "@/interfaces/IPrivillegeService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getPrivillegeList = async (
  params: IGetListRequest,
): Promise<IResponse<MsPrivillege[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    const res = await ApiService.request<MsPrivillege[]>(() =>
      (() => {
        let query = supabase
          .from("MsPrivillege")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("createdAt", { ascending: false })
          .order("privillegeId", { ascending: false })
          .range(from, to);

        if (search?.trim()) {
          query = query.ilike("privillegeName", `%${search.trim()}%`);
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

const insertPrivillege = async (
  params: InsertPrivillegeRequest,
): Promise<IResponse<MsPrivillege>> => {
  const { privillegeName, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsPrivillege>(() =>
      supabase
        .from("MsPrivillege")
        .insert({ privillegeName, userIn })
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updatePrivillege = async (
  params: UpdatePrivillegeRequest,
): Promise<IResponse<MsPrivillege>> => {
  const { privillegeId, privillegeName, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsPrivillege>(() =>
      supabase
        .from("MsPrivillege")
        .update({ privillegeName, userUp, updatedAt })
        .eq("privillegeId", privillegeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deletePrivillege = async (
  params: DeletePrivillegeRequest,
): Promise<IResponse<MsPrivillege>> => {
  const { privillegeId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    await ApiService.request(() =>
      supabase
        .from("TrRolePrivillege")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("privillegeId", privillegeId),
    );

    return await ApiService.request<MsPrivillege>(() =>
      supabase
        .from("MsPrivillege")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("privillegeId", privillegeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const PrivillegeService = {
  getPrivillegeList,
  insertPrivillege,
  updatePrivillege,
  deletePrivillege,
};
