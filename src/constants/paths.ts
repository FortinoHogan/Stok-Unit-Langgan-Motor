import LoginPage from "@/views/auth-page/LoginPage";
import DeliveryOrderPage from "@/views/transaction-page/components/delivery-order/delivery-order-page/DeliveryOrderPage";
import DeliveryOrderDetailPage from "@/views/transaction-page/components/delivery-order/delivery-order-detail-page/DeliveryOrderDetailPage";
import DeliveryOrderDayDetailPage from "@/views/transaction-page/components/delivery-order/delivery-order-day-detail-page/DeliveryOrderDayDetailPage";
import DeliveryOrderMonthDetailPage from "@/views/transaction-page/components/delivery-order/delivery-order-month-detail-page/DeliveryOrderMonthDetailPage";
import HomePage from "@/views/home-page/HomePage";
import ManageCategoryPage from "@/views/manage-category-page/ManageCategoryPage";
import ManageColorPage from "@/views/manage-color-page/ManageColorPage";
import ManagePrivillegePage from "@/views/manage-privillege-page/ManagePrivillegePage";
import ManageRolePage from "@/views/manage-role-page/ManageRolePage";
import ManageTypePage from "@/views/manage-type-page/ManageTypePage";
import ManageUserPage from "@/views/manage-user-page/ManageUserPage";
import RoleAndPrivillegePage from "@/views/role-and-privillege-page/RoleAndPrivillegePage";
import SellingPage from "@/views/transaction-page/components/selling/selling-page/SellingPage";
import SellingDetailPage from "@/views/transaction-page/components/selling/selling-detail-page/SellingDetailPage";
import SellingDayDetailPage from "@/views/transaction-page/components/selling/selling-day-detail-page/SellingDayDetailPage";
import SellingMonthDetailPage from "@/views/transaction-page/components/selling/selling-month-detail-page/SellingMonthDetailPage";
import TypeAndColorPage from "@/views/type-and-color-page/TypeAndColorPage";
import { routes } from "./routeValues";

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
  { path: routes.deliveryOrder, Component: DeliveryOrderPage },
  { path: routes.deliveryOrderDetail, Component: DeliveryOrderDetailPage },
  { path: routes.deliveryOrderMonthDetail, Component: DeliveryOrderMonthDetailPage },
  { path: routes.deliveryOrderDayDetail, Component: DeliveryOrderDayDetailPage },
  { path: routes.selling, Component: SellingPage },
  { path: routes.sellingDetail, Component: SellingDetailPage },
  { path: routes.sellingMonthDetail, Component: SellingMonthDetailPage },
  { path: routes.sellingDayDetail, Component: SellingDayDetailPage },
];
