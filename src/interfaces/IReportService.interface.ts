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
  categoryName: string | null;
  typeName: string | null;
  typeCode: string | null;
}

export interface ReportCategoryRaw {
  categoryName: string | null;
}

export interface ReportTypeRaw {
  typeName: string | null;
  typeCode: string | null;
  MsCategory: ReportCategoryRaw | ReportCategoryRaw[] | null;
}

export interface ReportTypeColorRaw {
  MsType: ReportTypeRaw | ReportTypeRaw[] | null;
}

export interface ReportQueryRawRow {
  TrTypeColor: ReportTypeColorRaw | ReportTypeColorRaw[] | null;
}

export interface GetTableReportDataResponse extends IResponse<
  ReportTransactionSummaryRow[]
> {}
