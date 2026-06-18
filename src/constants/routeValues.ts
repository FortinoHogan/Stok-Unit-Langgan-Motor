export const routes = {
  // Authentication
  home: "/",
  login: "/login",
  notFound: "*",

  // Management
  manageUsers: "/management/manage-users",

  // Management - Master Data
  manageMasterDataCategory: "/management/manage-master-data/category",
  manageMasterDataColor: "/management/manage-master-data/color",
  manageMasterDataType: "/management/manage-master-data/type",
  manageMasterDataRole: "/management/manage-master-data/role",
  manageMasterDataPrivilege: "/management/manage-master-data/privilege",
  manageMasterDataProgram: "/management/manage-master-data/program",
  manageMasterDataPeriod: "/management/manage-master-data/period",
  manageMasterDataSales: "/management/manage-master-data/sales",
  manageMasterDataSellingType: "/management/manage-master-data/selling-type",
  manageMasterDataVolume: "/management/manage-master-data/volume",

  // Configuration
  typeAndColor: "/configuration/type-and-color",
  roleAndPrivilege: "/configuration/role-and-privilege",
  transaction: "/configuration/transaction",
  transactionPrint: "/configuration/transaction/print/:transactionId",
  report: "/configuration/report",
};
