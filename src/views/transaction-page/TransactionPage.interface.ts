import type { TransactionMode } from "./TransactionPage.constant";

export interface TransactionPageProps {
  mode: TransactionMode;
}

export type TransactionModeWording = {
  title: string;
  description: string;
};
