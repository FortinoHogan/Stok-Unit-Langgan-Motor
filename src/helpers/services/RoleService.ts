import type { IGetListRequest, IResponse, MsRole } from "@/interfaces/IModel.interface";
import type { DeleteRoleRequest, InsertRoleRequest, UpdateRoleRequest } from "@/interfaces/IRoleService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getRoleList = async (
  params: IGetListRequest,
): Promise<IResponse<MsRole[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    const res = await ApiService.request<MsRole[]>(() =>
      (() => {
        let query = supabase
          .from("MsRole")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("createdAt", { ascending: false })
          .order("roleId", { ascending: false })
          .range(from, to);

        if (search?.trim()) {
          query = query.ilike("roleName", `%${search.trim()}%`);
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

const insertRole = async (
  params: InsertRoleRequest,
): Promise<IResponse<MsRole>> => {
  const { roleName, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsRole>(() =>
      supabase
        .from("MsRole")
        .insert({ roleName, userIn })
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updateRole = async (
  params: UpdateRoleRequest,
): Promise<IResponse<MsRole>> => {
  const { roleId, roleName, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsRole>(() =>
      supabase
        .from("MsRole")
        .update({ roleName, userUp, updatedAt })
        .eq("roleId", roleId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deleteRole = async (
  params: DeleteRoleRequest,
): Promise<IResponse<MsRole>> => {
  const { roleId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    await ApiService.request(() =>
      supabase
        .from("TrRolePrivillege")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("roleId", roleId),
    );

    return await ApiService.request<MsRole>(() =>
      supabase
        .from("MsRole")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("roleId", roleId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const RoleService = {
  getRoleList,
  insertRole,
  updateRole,
  deleteRole,
};
