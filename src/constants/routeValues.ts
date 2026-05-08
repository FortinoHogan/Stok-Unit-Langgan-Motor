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
  manageMasterDataPrivillege: "/management/manage-master-data/privillege",

  // Configuration
  typeAndColor: "/configuration/type-and-color",
  roleAndPrivillege: "/configuration/role-and-privillege",

  // Configuration - Transaction
  deliveryOrder: "/configuration/transaction/delivery-order",
  deliveryOrderDetail: "/configuration/transaction/delivery-order/:year",
  deliveryOrderMonthDetail: "/configuration/transaction/delivery-order/:year/:month",
  deliveryOrderDayDetail: "/configuration/transaction/delivery-order/:year/:month/:day",
  selling: "/configuration/transaction/selling",
  sellingDetail: "/configuration/transaction/selling/:year",
  sellingMonthDetail: "/configuration/transaction/selling/:year/:month",
  sellingDayDetail: "/configuration/transaction/selling/:year/:month/:day",
};
