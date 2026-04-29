import LoginPage from "@/views/auth-page/LoginPage";
import HomePage from "@/views/home-page/HomePage";

export const routes = {
  home: "/",
  login: "/login",
};

export const routePaths = [
  { path: routes.home, Component: HomePage },
  { path: routes.login, Component: LoginPage },
];
