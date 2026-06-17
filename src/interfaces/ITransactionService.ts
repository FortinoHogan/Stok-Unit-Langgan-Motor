import type { IGetListRequest, IRequestWithLoading } from "./IModel.interface";

export interface GetTypeColorOptionsRequest extends IRequestWithLoading {}

export interface GetCategoryOptionsRequest extends IRequestWithLoading {}

export interface GetTypeOptionsByCategoryRequest extends IRequestWithLoading {
  categoryId: string;
}

export interface GetColorOptionsByTypeRequest extends IRequestWithLoading {
  categoryId: string;
  typeId: string;
}

export interface GetYearOptionsRequest extends IRequestWithLoading {
  categoryId: string;
  typeId: string;
  colorId: string;
}

export interface GetTableTransactionDataRequest extends IGetListRequest {
  transactionYear: string;
  transactionMonth: string;
  transactionDay: string;
  categoryId: string;
  typeId: string;
  colorId: string;
  year: string;
  isRFS: boolean;
  isSold: boolean;
}

export interface GetTransactionDetailByTransactionIdRequest extends IRequestWithLoading {
  transactionId: number;
}

export interface GetTransactionPrintDataByTransactionIdRequest extends IRequestWithLoading {
  transactionId: number;
}

export interface TransactionDetailRow {
  transactionId: number;
  typeColorId: number;
  categoryName: string | null;
  typeName: string | null;
  typeCode: string | null;
  colorName: string | null;
  noMesin: string;
  noRangka: string;
  year: number;
  isRFS: boolean;
  dateDO: string | null;
  dateOUT: string | null;
  transactionDetailId: number | null;
  volume: number | null;
  sellingType: string | null;
  number: number | null;
  name: string | null;
  address: string | null;
  phone: string | null;
}

export interface TransactionTypeColorOption {
  typeColorId: number;
  categoryName: string | null;
  typeName: string | null;
  typeCode: string | null;
  colorName: string | null;
}

export interface TransactionPrintData {
  transactionId: number;
  typeName: string | null;
  typeCode: string | null;
  typeDescription: string | null;
  colorName: string | null;
  year: number;
  volume: number | null;
  noRangka: string;
  noMesin: string;
  sellingType: string | null;
  number: number | null;
  name: string | null;
  address: string | null;
  phone: string | null;
  dateOUT: string | null;
}

export interface UpdateTransactionAsSoldRequest extends IRequestWithLoading {
  transactionId: number;
  dateOUT: string;
  userUp: number;
  updatedAt: string;
}

export interface UpdateTransactionRequest extends IRequestWithLoading {
  transactionId: number;
  typeColorId: number;
  noMesin: string;
  noRangka: string;
  year: number;
  isRFS: boolean;
  dateDO: string | null;
  dateOUT: string | null;
  userUp: number;
  updatedAt: string;
}

export interface DeleteTransactionRequest extends IRequestWithLoading {
  transactionId: number;
  userUp: number;
  updatedAt: string;
}

export interface DeleteTransactionDetailRequest extends IRequestWithLoading {
  transactionId: number;
  userUp: number;
  updatedAt: string;
}

export interface InsertTransactionRequest extends IRequestWithLoading {
  typeColorId: number;
  noMesin: string;
  noRangka: string;
  year: number;
  isRFS: boolean;
  dateDO: string | null;
  dateOUT: string | null;
  userIn: number;
}

export interface InsertTransactionDetailRequest extends IRequestWithLoading {
  transactionId: number;
  volume: number;
  sellingType: string;
  number: number;
  name: string;
  address: string;
  phone: string;
  userIn: number;
}

export interface UpdateTransactionDetailRequest extends IRequestWithLoading {
  transactionId: number;
  volume: number;
  sellingType: string;
  number: number;
  name: string;
  address: string;
  phone: string;
  userUp: number;
  updatedAt: string;
}
