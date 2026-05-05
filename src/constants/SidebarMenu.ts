import {
  FileText,
  House,
  Palette,
  ShoppingCart,
  Truck,
  User,
  type LucideIcon,
} from "lucide-react";
import { routes } from "./paths";

type SidebarSubMenuItem = {
  title: string;
  url: string;
  isAdminOnly?: boolean;
};

type SidebarMenuItem = {
  title: string;
  url?: string;
  isAdminOnly?: boolean;
  icon?: LucideIcon;
  subItems?: SidebarSubMenuItem[];
};

type SidebarMenuGroup = {
  title: string;
  items: SidebarMenuItem[];
};

export const sidebarMenu: SidebarMenuGroup[] = [
  {
    title: "Dashboard",
    items: [{ title: "Home", url: routes.home, icon: House }],
  },
  {
    title: "Management",
    items: [
      {
        title: "Manage Users",
        url: routes.manageUsers,
        isAdminOnly: true,
        icon: User,
      },
      {
        title: "Manage Master Data",
        icon: FileText,
        subItems: [
          { title: "Master Category", url: routes.manageMasterDataCategory },
          { title: "Master Color", url: routes.manageMasterDataColor },
          { title: "Master Type", url: routes.manageMasterDataType },
        ],
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      { title: "Type and Color", url: routes.typeAndColor, icon: Palette },
      {
        title: "Transaction",
        icon: ShoppingCart,
        subItems: [
          { title: "Delivery Order", url: routes.deliveryOrder },
          { title: "Selling", url: routes.selling },
        ],
      },
    ],
  },
];
