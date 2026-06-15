import type { IRequestWithLoading, IResponse } from "./IModel.interface";

export interface GetTableReportDataRequest extends IRequestWithLoading {
  transactionYear: string;
  transactionMonth: string;
  transactionDay: string;
  categoryId: string;
  typeId: string;
  colorId: string;
  reportEvent: "delivery-order" | "selling";
}

export interface ReportTransactionSummaryRow {
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

export interface ReportCategoryRaw {
  categoryName: string | null;
}

export interface ReportColorRaw {
  colorName: string | null;
}

export interface ReportTypeRaw {
  typeName: string | null;
  typeCode: string | null;
  MsCategory: ReportCategoryRaw | ReportCategoryRaw[] | null;
}

export interface ReportTypeColorRaw {
  MsType: ReportTypeRaw | ReportTypeRaw[] | null;
  MsColor: ReportColorRaw | ReportColorRaw[] | null;
}

export interface ReportQueryRawRow {
  transactionId: number;
  typeColorId: number;
  noMesin: string;
  noRangka: string;
  year: number;
  isRFS: boolean;
  dateDO: string | null;
  dateOUT: string | null;
  TrTypeColor: ReportTypeColorRaw | ReportTypeColorRaw[] | null;
}

export interface GetTableReportDataResponse extends IResponse<
  ReportTransactionSummaryRow[]
> {}
