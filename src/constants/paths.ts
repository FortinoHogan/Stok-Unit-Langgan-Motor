import LoginPage from "@/views/auth-page/LoginPage";
import DeliveryOrderPage from "@/views/delivery-order-page/DeliveryOrderPage";
import HomePage from "@/views/home-page/HomePage";
import ManageCategoryPage from "@/views/manage-category-page/ManageCategoryPage";
import ManageColorPage from "@/views/manage-color-page/ManageColorPage";
import ManageTypePage from "@/views/manage-type-page/ManageTypePage";
import ManageUserPage from "@/views/manage-user-page/ManageUserPage";
import SellingPage from "@/views/selling-page/SellingPage";
import TypeAndColorPage from "@/views/type-and-color-page/TypeAndColorPage";

export const routes = {
  // Authentication
  home: "/",
  login: "/login",
  
  // Management
  manageUsers: "/management/manage-users",
  manageMasterDataCategory: "/management/manage-master-data/category",
  manageMasterDataColor: "/management/manage-master-data/color",
  manageMasterDataType: "/management/manage-master-data/type",

  // Configuration
  typeAndColor: "/configuration/type-and-color",
  deliveryOrder: "/configuration/delivery-order",
  selling: "/configuration/selling",
};

export const routePaths = [
  { path: routes.home, Component: HomePage },
  { path: routes.login, Component: LoginPage },
  { path: routes.manageUsers, Component: ManageUserPage },
  { path: routes.manageMasterDataCategory, Component: ManageCategoryPage },
  { path: routes.manageMasterDataColor, Component: ManageColorPage },
  { path: routes.manageMasterDataType, Component: ManageTypePage },
  { path: routes.typeAndColor, Component: TypeAndColorPage },
  { path: routes.deliveryOrder, Component: DeliveryOrderPage },
  { path: routes.selling, Component: SellingPage },
];
