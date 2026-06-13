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
}

export interface ReportCategoryTotal {
  categoryName: string;
  total: number;
}
