import LoginPage from "@/views/auth-page/LoginPage";
import HomePage from "@/views/home-page/HomePage";
import ManageCategoryPage from "@/views/manage-category-page/ManageCategoryPage";
import ManageColorPage from "@/views/manage-color-page/ManageColorPage";
import ManagePrivilegePage from "@/views/manage-privilege-page/ManagePrivilegePage";
import ManageRolePage from "@/views/manage-role-page/ManageRolePage";
import ManageTypePage from "@/views/manage-type-page/ManageTypePage";
import ManageUserPage from "@/views/manage-user-page/ManageUserPage";
import ManageProgramPage from "@/views/manage-program-page/ManageProgramPage";
import ManagePeriodPage from "@/views/manage-period-page/ManagePeriodPage";
import ManageSalesPage from "@/views/manage-sales-page/ManageSalesPage";
import ManageSellingTypePage from "@/views/manage-selling-type-page/ManageSellingTypePage";
import ManageVolumePage from "@/views/manage-volume-page/ManageVolumePage";
import RoleAndPrivilegePage from "@/views/role-and-privilege-page/RoleAndPrivilegePage";
import TypeAndColorPage from "@/views/type-and-color-page/TypeAndColorPage";
import { routes } from "./routeValues";
import TransactionPage from "@/views/transaction-page/TransactionPage";
import ReportPage from "@/views/report-page/ReportPage";
import TransactionPrintPage from "@/views/transaction-page/components/print-page/TransactionPrintPage";

export { routes };

export const routePaths = [
  { path: routes.home, Component: HomePage },
  { path: routes.login, Component: LoginPage },
  { path: routes.manageUsers, Component: ManageUserPage },
  { path: routes.manageMasterDataCategory, Component: ManageCategoryPage },
  { path: routes.manageMasterDataColor, Component: ManageColorPage },
  { path: routes.manageMasterDataType, Component: ManageTypePage },
  { path: routes.manageMasterDataRole, Component: ManageRolePage },
  { path: routes.manageMasterDataPrivilege, Component: ManagePrivilegePage },
  { path: routes.manageMasterDataProgram, Component: ManageProgramPage },
  { path: routes.manageMasterDataPeriod, Component: ManagePeriodPage },
  { path: routes.manageMasterDataSales, Component: ManageSalesPage },
  {
    path: routes.manageMasterDataSellingType,
    Component: ManageSellingTypePage,
  },
  { path: routes.manageMasterDataVolume, Component: ManageVolumePage },
  { path: routes.typeAndColor, Component: TypeAndColorPage },
  { path: routes.roleAndPrivilege, Component: RoleAndPrivilegePage },
  { path: routes.transaction, Component: TransactionPage },
  { path: routes.transactionPrint, Component: TransactionPrintPage },
  { path: routes.report, Component: ReportPage },
];
