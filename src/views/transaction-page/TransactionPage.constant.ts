import type { TransactionModeWording } from "./TransactionPage.interface";

export type TransactionMode = "DO" | "SELLING";

export const transactionModeWordingList: Record<
  TransactionMode,
  TransactionModeWording
> = {
  DO: {
    title: "Delivery Order",
    description: "Manage Delivery Order/Barang In",
  },
  SELLING: {
    title: "Selling",
    description: "Manage Selling/Out",
  },
};
