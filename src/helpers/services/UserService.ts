import type {
  AuthenticatedUser,
  IResponse,
} from "@/interfaces/IModel.interface";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";
import type {
  DeleteAuthenticatedUserRequest,
  GetAuthenticatedUserListRequest,
  GetUserByEmailRequest,
  InsertAuthenticatedUserRequest,
  UpdateAuthenticatedUserRequest,
} from "@/interfaces/IUserService.interface";

const getUserByEmail = async (
  params: GetUserByEmailRequest,
): Promise<IResponse<AuthenticatedUser>> => {
  const { email, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<AuthenticatedUser>(() =>
      supabase
        .from("AuthenticatedUser")
        .select("*")
        .eq("email", email)
        .eq("isDeleted", false)
        .maybeSingle(),
    );

    return res;
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const getAuthenticatedUserList = async (
  params: GetAuthenticatedUserListRequest,
): Promise<IResponse<AuthenticatedUser[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    const res = await ApiService.request<AuthenticatedUser[]>(() =>
      (() => {
        let query = supabase
          .from("AuthenticatedUser")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("createdAt", { ascending: false })
          .order("userId", { ascending: false })
          .range(from, to);

        if (search?.trim()) {
          query = query.ilike("email", `%${search.trim()}%`);
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

const insertAuthenticatedUser = async (
  params: InsertAuthenticatedUserRequest,
): Promise<IResponse<AuthenticatedUser>> => {
  const { email, roleId, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<AuthenticatedUser>(() =>
      supabase
        .from("AuthenticatedUser")
        .insert({ email, roleId })
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

const updateAuthenticatedUser = async (
  params: UpdateAuthenticatedUserRequest,
): Promise<IResponse<AuthenticatedUser>> => {
  const { userId, email, roleId, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<AuthenticatedUser>(() =>
      supabase
        .from("AuthenticatedUser")
        .update({ email, roleId })
        .eq("userId", userId)
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

const deleteAuthenticatedUser = async (
  params: DeleteAuthenticatedUserRequest,
): Promise<IResponse<AuthenticatedUser>> => {
  const { userId, setIsLoading } = params;
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<AuthenticatedUser>(() =>
      supabase
        .from("AuthenticatedUser")
        .update({ isDeleted: true })
        .eq("userId", userId)
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

export const UserService = {
  getUserByEmail,
  getAuthenticatedUserList,
  insertAuthenticatedUser,
  updateAuthenticatedUser,
  deleteAuthenticatedUser,
};
