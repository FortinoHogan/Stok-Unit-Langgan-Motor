import type {
  IGetListRequest,
  IRequestWithLoading,
} from "@/interfaces/IModel.interface";

export interface GetAuthenticatedUserListRequest extends IGetListRequest {}

export interface GetUserByEmailRequest extends IRequestWithLoading {
  email: string;
}

export interface InsertAuthenticatedUserRequest extends IRequestWithLoading {
  email: string;
  roleId: number;
}

export interface UpdateAuthenticatedUserRequest extends IRequestWithLoading {
  userId: number;
  email: string;
  roleId: number;
}

export interface DeleteAuthenticatedUserRequest extends IRequestWithLoading {
  userId: number;
}
