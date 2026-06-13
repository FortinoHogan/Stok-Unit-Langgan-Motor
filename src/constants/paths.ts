import LoginPage from "@/views/auth-page/LoginPage";
import HomePage from "@/views/home-page/HomePage";
import ManageCategoryPage from "@/views/manage-category-page/ManageCategoryPage";
import ManageColorPage from "@/views/manage-color-page/ManageColorPage";
import ManagePrivillegePage from "@/views/manage-privillege-page/ManagePrivillegePage";
import ManageRolePage from "@/views/manage-role-page/ManageRolePage";
import ManageTypePage from "@/views/manage-type-page/ManageTypePage";
import ManageUserPage from "@/views/manage-user-page/ManageUserPage";
import RoleAndPrivillegePage from "@/views/role-and-privillege-page/RoleAndPrivillegePage";
import TypeAndColorPage from "@/views/type-and-color-page/TypeAndColorPage";
import { routes } from "./routeValues";
import TransactionPage from "@/views/transaction-page/TransactionPage";
import ReportPage from "@/views/report-page/ReportPage";

export { routes };

export const routePaths = [
  { path: routes.home, Component: HomePage },
  { path: routes.login, Component: LoginPage },
  { path: routes.manageUsers, Component: ManageUserPage },
  { path: routes.manageMasterDataCategory, Component: ManageCategoryPage },
  { path: routes.manageMasterDataColor, Component: ManageColorPage },
  { path: routes.manageMasterDataType, Component: ManageTypePage },
  { path: routes.manageMasterDataRole, Component: ManageRolePage },
  { path: routes.manageMasterDataPrivillege, Component: ManagePrivillegePage },
  { path: routes.typeAndColor, Component: TypeAndColorPage },
  { path: routes.roleAndPrivillege, Component: RoleAndPrivillegePage },
  { path: routes.transaction, Component: TransactionPage },
  { path: routes.report, Component: ReportPage },
];
