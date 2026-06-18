import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetProgramListRequest extends IGetListRequest {}

export interface InsertProgramRequest extends IRequestWithLoading {
  programName: string;
  userIn: number;
}

export interface UpdateProgramRequest extends IRequestWithLoading {
  programId: number;
  programName: string;
  userUp: number;
  updatedAt: string;
}

export interface DeleteProgramRequest extends IRequestWithLoading {
  programId: number;
  userUp: number;
  updatedAt: string;
}
