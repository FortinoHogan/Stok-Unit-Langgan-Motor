import type {
  IGetListRequest,
  IResponse,
  MsPrivilege,
} from "@/interfaces/IModel.interface";
import type {
  DeletePrivilegeRequest,
  InsertPrivilegeRequest,
  UpdatePrivilegeRequest,
} from "@/interfaces/IPrivilegeService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getPrivilegeList = async (
  params: IGetListRequest,
): Promise<IResponse<MsPrivilege[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    const res = await ApiService.request<MsPrivilege[]>(() =>
      (() => {
        let query = supabase
          .from("MsPrivilege")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("createdAt", { ascending: false })
          .order("privilegeId", { ascending: false })
          .range(from, to);

        if (search?.trim()) {
          query = query.ilike("privilegeName", `%${search.trim()}%`);
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

const insertPrivilege = async (
  params: InsertPrivilegeRequest,
): Promise<IResponse<MsPrivilege>> => {
  const { privilegeName, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsPrivilege>(() =>
      supabase
        .from("MsPrivilege")
        .insert({ privilegeName, userIn })
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updatePrivilege = async (
  params: UpdatePrivilegeRequest,
): Promise<IResponse<MsPrivilege>> => {
  const { privilegeId, privilegeName, userUp, updatedAt, setIsLoading } =
    params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsPrivilege>(() =>
      supabase
        .from("MsPrivilege")
        .update({ privilegeName, userUp, updatedAt })
        .eq("privilegeId", privilegeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deletePrivilege = async (
  params: DeletePrivilegeRequest,
): Promise<IResponse<MsPrivilege>> => {
  const { privilegeId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    await ApiService.request(() =>
      supabase
        .from("TrRolePrivilege")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("privilegeId", privilegeId),
    );

    return await ApiService.request<MsPrivilege>(() =>
      supabase
        .from("MsPrivilege")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("privilegeId", privilegeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const PrivilegeService = {
  getPrivilegeList,
  insertPrivilege,
  updatePrivilege,
  deletePrivilege,
};
