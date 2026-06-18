import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetVolumeListRequest extends IGetListRequest {}

export interface InsertVolumeRequest extends IRequestWithLoading {
  volume: number;
  userIn: number;
}

export interface UpdateVolumeRequest extends IRequestWithLoading {
  volumeId: number;
  volume: number;
  userUp: number;
  updatedAt: string;
}

export interface DeleteVolumeRequest extends IRequestWithLoading {
  volumeId: number;
  userUp: number;
  updatedAt: string;
}
