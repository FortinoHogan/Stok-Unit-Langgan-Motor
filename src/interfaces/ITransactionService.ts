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

export interface GetTransactionsByModeYearRequest extends IRequestWithLoading {
  mode: "DO" | "SELLING";
  year: number;
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
