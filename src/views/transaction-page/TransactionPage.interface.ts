import type { TransactionMode } from "./TransactionPage.constant";

export interface TransactionPageProps {
  mode: TransactionMode;
}

export interface TransactionDistinctYears {
  dateDOYears: number[];
  dateOUTYears: number[];
  dateDOYearQuantity: Record<number, number>;
  dateOUTYearQuantity: Record<number, number>;
}

export type TransactionModeWording = {
  title: string;
  description: string;
  cardAction: string;
};
