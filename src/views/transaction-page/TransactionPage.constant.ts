import type { AutoCompleteOption } from "@/components/app-components/app-auto-complete/AppAutoComplete.interface";
import type {
  IFormData,
  TransactionWording,
} from "./TransactionPage.interface";

export const transactionWording: TransactionWording = {
  title: "Transaction",
  description: "Manage transactions in one page",
  cardAction: "In",
  addModalTitle: "Add Delivery Order",
  addModalDescription: "Fill the form below to add delivery order",
  confirmAddModalTitle: "Confirm Add Delivery Order",
  confirmAddQuestionActionText: "Add Delivery Order",
  editModalTitle: "Edit Delivery Order",
  editDateLabel: "Date DO",
  editDatePlaceholder: "Pick date DO",
  confirmUpdateModalTitle: "Confirm Update Delivery Order",
  confirmDeleteModalTitle: "Confirm Delete Delivery Order",
};

export const FormDataInitial: IFormData = {
  category: "",
  type: "",
  color: "",
  year: "",
  status: "",
  isSold: false,
};

export const statusOptions: AutoCompleteOption[] = [
  { value: "RFS", label: "RFS" },
  { value: "NRFS", label: "NRFS" },
];
