import type {
  IGetListRequest,
  IResponse,
  MsVolume,
} from "@/interfaces/IModel.interface";
import type {
  DeleteVolumeRequest,
  InsertVolumeRequest,
  UpdateVolumeRequest,
} from "@/interfaces/IVolumeService";
import { ApiService } from "@/utilities/ApiService";
import { supabase } from "../supabase/client";

const getVolumeList = async (
  params: IGetListRequest,
): Promise<IResponse<MsVolume[]>> => {
  const { page, pageSize, search, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    const from = (Math.max(page, 1) - 1) * Math.max(pageSize, 1);
    const to = from + Math.max(pageSize, 1) - 1;

    return await ApiService.request<MsVolume[]>(() =>
      (() => {
        let query = supabase
          .from("MsVolume")
          .select("*", { count: "exact" })
          .eq("isDeleted", false)
          .order("volume", { ascending: true })
          .order("volumeId", { ascending: true })
          .range(from, to);

        if (search?.trim()) {
          const normalizedSearch = Number(search.trim());

          if (!Number.isNaN(normalizedSearch)) {
            query = query.eq("volume", normalizedSearch);
          }
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

const insertVolume = async (
  params: InsertVolumeRequest,
): Promise<IResponse<MsVolume>> => {
  const { volume, userIn, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsVolume>(() =>
      supabase.from("MsVolume").insert({ volume, userIn }).select().single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const updateVolume = async (
  params: UpdateVolumeRequest,
): Promise<IResponse<MsVolume>> => {
  const { volumeId, volume, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsVolume>(() =>
      supabase
        .from("MsVolume")
        .update({ volume, userUp, updatedAt })
        .eq("volumeId", volumeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

const deleteVolume = async (
  params: DeleteVolumeRequest,
): Promise<IResponse<MsVolume>> => {
  const { volumeId, userUp, updatedAt, setIsLoading } = params;
  setIsLoading?.(true);

  try {
    return await ApiService.request<MsVolume>(() =>
      supabase
        .from("MsVolume")
        .update({ userUp, updatedAt, isDeleted: true })
        .eq("volumeId", volumeId)
        .select()
        .single(),
    );
  } catch (error) {
    throw error;
  } finally {
    setIsLoading?.(false);
  }
};

export const VolumeService = {
  getVolumeList,
  insertVolume,
  updateVolume,
  deleteVolume,
};
