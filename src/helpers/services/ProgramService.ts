import type {
  IGetListRequest,
  IResponse,
  MsProgram,
} from "@/interfaces/IModel.interface";
import type {
  DeleteProgramRequest,
  InsertProgramRequest,
  UpdateProgramRequest,
} from "@/interfaces/IProgramService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getProgramList = async (
  params: IGetListRequest,
): Promise<IResponse<MsProgram[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    return await ApiService.request<MsProgram[]>(() =>
      (() => {
        let query = supabase
          .from("MsProgram")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("programId", { ascending: true })
          .range(from, to);

        if (search?.trim()) {
          query = query.ilike("programName", `%${search.trim()}%`);
        }

        return query;
      })(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const insertProgram = async (
  params: InsertProgramRequest,
): Promise<IResponse<MsProgram>> => {
  const { programName, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsProgram>(() =>
      supabase
        .from("MsProgram")
        .insert({ programName, userIn })
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updateProgram = async (
  params: UpdateProgramRequest,
): Promise<IResponse<MsProgram>> => {
  const { programId, programName, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsProgram>(() =>
      supabase
        .from("MsProgram")
        .update({ programName, userUp, updatedAt })
        .eq("programId", programId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deleteProgram = async (
  params: DeleteProgramRequest,
): Promise<IResponse<MsProgram>> => {
  const { programId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsProgram>(() =>
      supabase
        .from("MsProgram")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("programId", programId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const ProgramService = {
  getProgramList,
  insertProgram,
  updateProgram,
  deleteProgram,
};
