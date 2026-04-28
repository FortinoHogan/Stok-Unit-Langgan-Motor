import type {
  AuthenticatedUser,
  IResponse,
} from "@/interfaces/IModel.interface";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getUserByEmail = async (
  email: string,
  setIsLoading?: (val: boolean) => void,
): Promise<IResponse<AuthenticatedUser>> => {
  setIsLoading?.(true);
  try {
    const res = await ApiService.request<AuthenticatedUser>(() =>
      supabase
        .from("AuthenticatedUser")
        .select("*")
        .eq("email", email)
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
};
