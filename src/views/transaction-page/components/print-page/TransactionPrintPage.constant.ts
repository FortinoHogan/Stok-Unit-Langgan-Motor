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
  secondPage: {
    padding: 8,
    fontSize: 5,
    fontFamily: "Helvetica",
    color: "#3b4555",
  },
  secondCard: {
    padding: 8,
    height: "100%",
    justifyContent: "space-between",
    gap: 4,
    fontWeight: 900,
  },
  secondBuyerGroup: {
    gap: 6,
  },
  secondBuyerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  secondBuyerLabel: {
    width: 24,
  },
  secondBuyerColon: {
    width: 6,
  },
  secondBuyerValue: {
    flex: 1,
  },
  secondBuyerDateValue: {
    flex: 1,
  },
  secondSeparator: {
    borderTopWidth: 1,
    borderTopColor: "#d6dde7",
    marginVertical: 4,
  },
  thirdPage: {
    paddingTop: 16,
    paddingRight: 20,
    paddingBottom: 16,
    paddingLeft: 20,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#2f3844",
  },
  thirdCard: {
    borderWidth: 1,
    borderColor: "#858e99",
    padding: 10,
    height: "100%",
  },
  thirdHeaderBox: {
    borderWidth: 1,
    borderColor: "#8f98a3",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    marginBottom: 10,
    gap: 3,
  },
  thirdTitle: {
    fontSize: 18,
    fontWeight: 900,
  },
  thirdHeaderDivider: {
    alignSelf: "stretch",
    borderTopWidth: 1,
    borderTopColor: "#8f98a3",
    marginHorizontal: -8,
    marginVertical: 2,
  },
  thirdSubTitle: {
    fontSize: 14,
    fontWeight: 900,
  },
  thirdPeriod: {
    fontSize: 14,
    fontWeight: 900,
  },
  thirdBody: {
    marginTop: 4,
    gap: 6,
  },
  thirdSectionTitle: {
    fontSize: 8,
  },
  thirdInfoRows: {
    width: "72%",
    gap: 3,
  },
  thirdInfoRow: {
    flexDirection: "row",
  },
  thirdInfoLabel: {
    width: 64,
    fontWeight: 500,
  },
  thirdInfoColon: {
    width: 8,
  },
  thirdInfoValue: {
    flex: 1,
    fontWeight: 700,
  },
  thirdStatement: {
    marginTop: 2,
    fontSize: 8,
  },
  thirdGiftLine: {
    marginTop: 4,
    marginLeft: 10,
    fontSize: 8,
    fontWeight: 700,
  },
  thirdSignatures: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  thirdSignatureBlock: {
    width: "42%",
    gap: 4,
  },
  thirdDate: {
    textAlign: "center",
  },
  thirdSignatureGap: {
    marginTop: 36,
  },
  thirdSignatureName: {
    marginTop: 4,
    textAlign: "center",
    fontWeight: 700,
  },
});
