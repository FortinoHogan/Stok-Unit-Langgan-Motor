import {
  FileText,
  House,
  Palette,
  ShoppingCart,
  User,
  UserKey,
} from "lucide-react";
import { routes } from "./paths";
import type { SidebarMenuGroup } from "@/interfaces/IModel.interface";

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
        icon: User,
      },
      {
        title: "Manage Master Data",
        icon: FileText,
        subItems: [
          { title: "Master Category", url: routes.manageMasterDataCategory },
          { title: "Master Color", url: routes.manageMasterDataColor },
          { title: "Master Type", url: routes.manageMasterDataType },
          { title: "Master Role", url: routes.manageMasterDataRole },
          { title: "Master Privillege", url: routes.manageMasterDataPrivillege },
        ],
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      { title: "Role and Privillege", url: routes.roleAndPrivillege, icon: UserKey },
      { title: "Type and Color", url: routes.typeAndColor, icon: Palette },
      {
        title: "Transaction",
        icon: ShoppingCart,
        url: routes.transaction,
      },
    ],
  },
];
