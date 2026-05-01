import { House, User, type LucideIcon } from "lucide-react";
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
  subItems?: SidebarSubMenuItem[];
};

type SidebarMenuGroup = {
  title: string;
  icon?: LucideIcon;
  items: SidebarMenuItem[];
};

export const sidebarMenu: SidebarMenuGroup[] = [
  {
    title: "Dashboard",
    icon: House,
    items: [{ title: "Home", url: routes.home }],
  },
  {
    title: "Management",
    icon: User,
    items: [
      { title: "Manage Users", url: routes.manageUsers, isAdminOnly: true },
    ],
  }
];
