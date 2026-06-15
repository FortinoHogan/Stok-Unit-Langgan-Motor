import type { ReportTransactionSummaryRow } from "@/interfaces/IReportService.interface";

export interface ReportAppliedPeriodFilter {
  year: string;
  month: string;
  day: string;
}

export interface ReportAppliedFilter {
  categoryId: string;
  typeId: string;
  colorId: string;
  reportEvent: "delivery-order" | "selling";
}

export interface ReportRow {
  key: string;
  categoryName: string;
  typeName: string;
  typeCode: string;
  quantity: number;
  details: ReportTransactionSummaryRow[];
}

export interface ReportCategoryTotal {
  categoryName: string;
  total: number;
}
