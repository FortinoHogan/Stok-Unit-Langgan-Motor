import LoginPage from "@/views/auth-page/LoginPage";
import HomePage from "@/views/home-page/HomePage";
import ManageUserPage from "@/views/manage-user-page/ManageUserPage";

export const routes = {
  home: "/",
  login: "/login",
  manageUsers: "/manage-users",
};

export const routePaths = [
  { path: routes.home, Component: HomePage },
  { path: routes.login, Component: LoginPage },
  { path: routes.manageUsers, Component: ManageUserPage },
];
