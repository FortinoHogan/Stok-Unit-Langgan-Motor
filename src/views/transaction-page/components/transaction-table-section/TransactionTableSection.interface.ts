import type { TransactionDetailRow } from "@/interfaces/ITransactionService";

export interface TransactionTableSectionProps {
  table: any;
  emptyMessage: string;
  detailOpen: boolean;
  onDetailOpenChange: (open: boolean) => void;
  detailTitle: string;
  detailRows: TransactionDetailRow[];
  canUpdateDetail?: boolean;
  canDeleteDetail?: boolean;
  canSellDetail?: boolean;
  onEditDetailRow?: (row: TransactionDetailRow) => void;
  onDeleteDetailRow?: (row: TransactionDetailRow) => void;
  onSellDetailRow?: (row: TransactionDetailRow) => void;
}
