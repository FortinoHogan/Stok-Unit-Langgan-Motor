import type { IResponse, TrRolePrivillege } from "@/interfaces/IModel.interface";
import type {
  DeleteRolePrivillegeRequest,
  GetRolePrivillegeListByRoleIdsRequest,
  InsertRolePrivillegeRequest,
} from "@/interfaces/IRolePrivillegeService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getRolePrivillegeListByRoleIds = async (
  params: GetRolePrivillegeListByRoleIdsRequest,
): Promise<IResponse<TrRolePrivillege[]>> => {
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

    return await ApiService.request<TrRolePrivillege[]>(() =>
      supabase
        .from("TrRolePrivillege")
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

const insertRolePrivillege = async (
  params: InsertRolePrivillegeRequest,
): Promise<IResponse<TrRolePrivillege>> => {
  const { roleId, privillegeId, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<TrRolePrivillege>(() =>
      supabase
        .from("TrRolePrivillege")
        .insert({ roleId, privillegeId, userIn })
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deleteRolePrivillege = async (
  params: DeleteRolePrivillegeRequest,
): Promise<IResponse<TrRolePrivillege>> => {
  const { rolePrivillegeId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<TrRolePrivillege>(() =>
      supabase
        .from("TrRolePrivillege")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("rolePrivillegeId", rolePrivillegeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const RolePrivillegeService = {
  getRolePrivillegeListByRoleIds,
  insertRolePrivillege,
  deleteRolePrivillege,
};
