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
    marginVertical: 6,
  },
  signature: {
    marginTop: 40,
  },
  secondPage: {
    padding: 4,
    fontSize: 7,
    fontFamily: "Helvetica",
  },
  secondCard: {
    padding: 2,
    height: "100%",
    justifyContent: "space-between",
    gap: 2,
    fontWeight: 900,
  },
  secondBuyerGroup: {
    gap: 3,
    marginBottom: 4,
  },
  secondBuyerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  secondBuyerLabel: {
    width: 34,
  },
  secondBuyerColon: {
    width: 4,
  },
  secondBuyerValue: {
    flex: 1,
  },
  secondBuyerDateValue: {
    flex: 1,
  },
  secondSeparator: {
    borderTopWidth: 1,
    marginVertical: 4,
  },
  thirdPage: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    paddingBottom: 28,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  thirdCard: {
    borderWidth: 1,
    padding: 10,
    height: "100%",
  },
  thirdHeaderBox: {
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    marginBottom: 10,
    gap: 3,
  },
  thirdTitle: {
    fontSize: 20,
    fontWeight: 900,
  },
  thirdHeaderDivider: {
    alignSelf: "stretch",
    borderTopWidth: 1,
    marginHorizontal: -8,
    marginVertical: 2,
  },
  thirdSubTitle: {
    fontSize: 16,
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
  },
  thirdGiftLine: {
    marginTop: 4,
    marginLeft: 10,
    fontWeight: 700,
  },
  thirdSignatures: {
    marginTop: 18,
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
