import type { AutoCompleteOption } from "@/components/app-components/app-auto-complete/AppAutoComplete.interface";
import type { ReportAppliedFilter } from "./ReportPage.interface";

export const reportEventOptions: AutoCompleteOption[] = [
  { value: "delivery-order", label: "Delivery Order" },
  { value: "selling", label: "Selling" },
];

export const reportFilterInitial: ReportAppliedFilter = {
  categoryId: "All",
  typeId: "All",
  colorId: "All",
  reportEvent: "delivery-order",
};
