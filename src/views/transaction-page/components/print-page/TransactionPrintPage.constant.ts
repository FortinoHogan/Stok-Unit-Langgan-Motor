import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  viewer: {
    width: "100%",
    height: "80vh",
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
    paddingVertical: 4,
    paddingHorizontal: 2,
    paddingLeft: 10,
    paddingTop: 8,
    fontSize: 7.5,
    fontFamily: "Calibri",
  },
  secondCard: {
    height: "100%",
    justifyContent: "center",
    gap: 2,
  },
  secondBuyerGroup: {
    gap: 1,
  },
  secondBuyerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  secondBuyerDateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  secondBuyerLabel: {
    width: 30,
  },
  secondBuyerColon: {
    width: 4,
  },
  secondBuyerValue: {
    flex: 1,
  },
  secondBuyerDateValue: {
    flex: 1,
    fontSize: 10,
    fontWeight: 900,
    fontFamily: "Helvetica",
  },
  thirdPage: {
    paddingHorizontal: 22,
    paddingVertical: 18,
    paddingBottom: 40,
    fontSize: 12,
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
  fourthPage: {
    paddingTop: 18,
    paddingRight: 22,
    paddingBottom: 18,
    paddingLeft: 22,
    fontSize: 10,
  },

  fourthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  fourthCompanyBlock: {
    flexDirection: "row",
    gap: 10,
  },

  fourthCompanyInfo: {
    gap: 2,
  },

  fourthCompanyName: {
    fontSize: 14,
    fontWeight: "bold",
  },

  fourthDocumentNo: {
    textAlign: "right",
    alignSelf: "flex-end",
    fontSize: 10,
    marginTop: 8,
  },

  fourthTitle: {
    borderWidth: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    paddingVertical: 6,
    marginBottom: 9,
  },

  fourthSection: {
    marginBottom: 4,
  },

  fourthVehicleRow: {
    flexDirection: "row",
    marginBottom: 4,
    gap: 3,
  },

  fourthVehicleLabel: {
    width: 90,
  },

  fourthVehicleColon: {
    width: 10,
  },

  fourthVehicleValue: {
    flex: 1,
  },

  fourthEquipmentTable: {
    marginTop: 8,
    marginBottom: 6,
  },

  fourthEquipmentRow: {
    flexDirection: "row",
  },

  fourthEquipmentCell: {
    width: "33.33%",
    flexDirection: "row",
    borderWidth: 1,
    borderTopWidth: 1,
  },

  fourthCheckBox: {
    width: 18,
    borderRightWidth: 1,
    textAlign: "center",
    paddingTop: 3,
  },

  fourthEquipmentText: {
    flex: 1,
    paddingHorizontal: 4,
    paddingTop: 3,
  },

  fourthSignatureSection: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  fourthNotesBlock: {
    width: "40%",
  },

  fourthNotesTitle: {
    marginBottom: 4,
  },

  fourthNotesText: {
    fontSize: 10,
    fontStyle: "italic",
    lineHeight: 1.4,
  },
});
