import type { TransactionDetailRow } from "@/interfaces/ITransactionService";

export type TransactionWording = {
  title: string;
  description: string;
  cardAction: string;
  addModalTitle: string;
  addModalDescription: string;
  confirmAddModalTitle: string;
  confirmAddQuestionActionText: string;
  editModalTitle: string;
  editDateLabel: string;
  editDatePlaceholder: string;
  confirmUpdateModalTitle: string;
  confirmDeleteModalTitle: string;
};

export interface TransactionDayGroupedRow {
  key: string;
  categoryName: string;
  typeName: string;
  typeCode: string;
  year: number;
  quantity: number;
  details: TransactionDetailRow[];
}

export interface IFormData {
  category: string;
  type: string;
  color: string;
  year: string;
  status: string;
  isSold: boolean;
}
