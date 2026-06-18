import type { IResponse, TrRolePrivilege } from "@/interfaces/IModel.interface";
import type {
  DeleteRolePrivilegeRequest,
  GetRolePrivilegeListByRoleIdsRequest,
  InsertRolePrivilegeRequest,
} from "@/interfaces/IRolePrivilegeService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getRolePrivilegeListByRoleIds = async (
  params: GetRolePrivilegeListByRoleIdsRequest,
): Promise<IResponse<TrRolePrivilege[]>> => {
  const { roleIds, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    if (!roleIds.length) {
      return {
        data: [],
        error: null,
        status: 200,
        statusText: "OK",
      };
    }

    return await ApiService.request<TrRolePrivilege[]>(() =>
      supabase
        .from("TrRolePrivilege")
        .select("*")
        .in("roleId", roleIds)
        .eq("isDeleted", false)
        .order("createdAt", { ascending: false }),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const insertRolePrivilege = async (
  params: InsertRolePrivilegeRequest,
): Promise<IResponse<TrRolePrivilege>> => {
  const { roleId, privilegeId, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<TrRolePrivilege>(() =>
      supabase
        .from("TrRolePrivilege")
        .insert({ roleId, privilegeId, userIn })
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deleteRolePrivilege = async (
  params: DeleteRolePrivilegeRequest,
): Promise<IResponse<TrRolePrivilege>> => {
  const { rolePrivilegeId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<TrRolePrivilege>(() =>
      supabase
        .from("TrRolePrivilege")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("rolePrivilegeId", rolePrivilegeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const RolePrivilegeService = {
  getRolePrivilegeListByRoleIds,
  insertRolePrivilege,
  deleteRolePrivilege,
};
