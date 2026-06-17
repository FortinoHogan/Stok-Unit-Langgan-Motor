import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  viewer: {
    width: "100%",
    height: "100vh",
    border: 0,
  },
  page: {
    paddingTop: 18,
    paddingRight: 22,
    paddingBottom: 18,
    paddingLeft: 22,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#244a78",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  companyBlock: {
    width: "48%",
    gap: 3,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 2,
  },
  companyLogo: {
    width: 40,
    height: 40,
    objectFit: "contain",
  },
  companyInfo: {
    flex: 1,
    gap: 2,
  },
  companyTitle: {
    fontSize: 10,
    fontWeight: 700,
  },
  topRightBlock: {
    width: "42%",
    gap: 3,
  },
  row: {
    flexDirection: "row",
  },
  label: {
    width: 66,
    fontWeight: 700,
  },
  value: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: 900,
    marginBottom: 12,
    paddingVertical: 1.5,
    borderWidth: 1,
    borderColor: "#7ea0c3",
  },
  content: {
    flexDirection: "row",
    gap: 3,
  },
  leftContent: {
    width: "45%",
    gap: 3,
  },
  rightContent: {
    width: "55%",
  },
  vehicleIntro: {
    fontSize: 9,
    fontWeight: 700,
  },
  vehicleRow: {
    flexDirection: "row",
  },
  vehicleLabel: {
    width: 86,
    fontWeight: 700,
  },
  vehicleColon: {
    width: 10,
  },
  vehicleValue: {
    flex: 1,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 6,
  },
  noteItem: {
    flexDirection: "row",
  },
  noteNumber: {
    width: 12,
  },
  noteText: {
    flex: 1,
    lineHeight: 0.75,
  },
  footer: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBlock: {
    width: "50%",
    gap: 6,
  },
  footerLine: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 1.5,
    borderColor: "#7ea0c3",
    marginVertical: 6,
  },
  signature: {
    marginTop: 40,
  },
});
