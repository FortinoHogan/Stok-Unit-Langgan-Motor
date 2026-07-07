import type { AutoCompleteOption } from "@/components/app-components/app-auto-complete/AppAutoComplete.interface";
import type { ReportAppliedFilter } from "./ReportPage.interface";
import { StyleSheet } from "@react-pdf/renderer";

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

export const exportStyles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#555",
  },
  categoryTitle: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 11,
    fontWeight: 700,
  },
  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#222",
    paddingVertical: 4,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#bbb",
    paddingVertical: 3,
  },
  colCode: { width: "8%" },
  colName: { width: "30%", paddingRight: 4 },
  colColor: { width: "14%" },
  colRangka: { width: "23%"},
  colMesin: { width: "17%" },
  colDate: { width: "8%" },
  empty: {
    marginTop: 12,
    color: "#666",
  },
});
