import type { IRequestWithLoading } from "./IModel.interface";

export interface TransactionYearRow {
  dateDO: string | null;
  dateOUT: string | null;
}

export interface GetDistinctTransactionYearsRequest extends IRequestWithLoading {}

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
}

export interface RawTransactionDetailRow {
  transactionId: number;
  typeColorId: number;
  noMesin: string;
  noRangka: string;
  year: number;
  isRFS: boolean;
  dateDO: string | null;
  dateOUT: string | null;
}

export interface TransactionTypeColorMapRow {
  typeColorId: number;
  typeId: number;
  colorId: number;
}

export interface TransactionTypeMapRow {
  typeId: number;
  typeName: string;
  typeCode: string;
  categoryId: number;
}

export interface TransactionCategoryMapRow {
  categoryId: number;
  categoryName: string;
}

export interface TransactionColorMapRow {
  colorId: number;
  colorName: string;
}

export interface RawTypeColorOptionRow {
  typeColorId: number;
  typeId: number;
  colorId: number;
}

export interface TransactionTypeColorOption {
  typeColorId: number;
  categoryName: string | null;
  typeName: string | null;
  typeCode: string | null;
  colorName: string | null;
}

export interface GetTransactionsByModeYearRequest extends IRequestWithLoading {
  mode: "DO" | "SELLING";
  year: number;
  month?: number;
  day?: number;
  categoryName?: string;
  typeName?: string;
  colorName?: string;
  transactionYear?: number;
  status?: "RFS" | "NRFS";
}

export interface GetSellableTransactionsByDateRequest extends IRequestWithLoading {
  date: string;
}

export interface UpdateTransactionAsSoldRequest extends IRequestWithLoading {
  transactionId: number;
  dateOUT: string;
  userUp: number;
  updatedAt: string;
}

export interface UpdateTransactionRequest extends IRequestWithLoading {
  transactionId: number;
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
