import type { ReportTransactionSummaryRow } from "@/interfaces/IReportService.interface";

export interface ReportTableSectionProps {
  table: any;
  reportEvent: "delivery-order" | "selling";
  isLoading?: boolean;
  page?: number;
  pageSize?: number;
  rowCount?: number;
  hasNextPage?: boolean;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onPageSizeChange?: (nextPageSize: number) => void;
  emptyMessage: string;
  detailOpen: boolean;
  onDetailOpenChange: (open: boolean) => void;
  detailTitle: string;
  detailRows: ReportTransactionSummaryRow[];
}
