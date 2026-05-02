import type { IRequestWithLoading } from "./IModel.interface";

export interface GetTypeColorListByTypeIdsRequest extends IRequestWithLoading {
  typeIds: number[];
}

export interface InsertTypeColorRequest extends IRequestWithLoading {
  typeId: number;
  colorId: number;
  userIn: number;
}
