import { matchPath } from "react-router-dom";
import { routes } from "@/constants/routeValues";

interface RoutePrivillegeRule {
  path: string;
  resourceName: string;
}

const routePrivillegeRuleList: RoutePrivillegeRule[] = [
  { path: routes.manageUsers, resourceName: "Manage Users" },
  { path: routes.manageMasterDataCategory, resourceName: "Master Category" },
  { path: routes.manageMasterDataColor, resourceName: "Master Color" },
  { path: routes.manageMasterDataType, resourceName: "Master Type" },
  { path: routes.manageMasterDataRole, resourceName: "Master Role" },
  { path: routes.manageMasterDataPrivillege, resourceName: "Master Privillege" },
  { path: routes.typeAndColor, resourceName: "Type and Color" },
  { path: routes.roleAndPrivillege, resourceName: "Role and Privillege" },
  { path: routes.deliveryOrder, resourceName: "Delivery Order" },
  { path: routes.deliveryOrderDetail, resourceName: "Delivery Order" },
  { path: routes.deliveryOrderMonthDetail, resourceName: "Delivery Order" },
  { path: routes.deliveryOrderDayDetail, resourceName: "Delivery Order" },
  { path: routes.selling, resourceName: "Selling" },
  { path: routes.sellingDetail, resourceName: "Selling" },
  { path: routes.sellingMonthDetail, resourceName: "Selling" },
  { path: routes.sellingDayDetail, resourceName: "Selling" },
];

const ACTION_READ = "Read";
const ACTION_INSERT = "Insert";
const ACTION_UPDATE = "Update";
const ACTION_DELETE = "Delete";

export const getPrivillegeName = (actionName: string, resourceName: string) => {
  return `${actionName} ${resourceName}`;
};

export const hasPrivillege = (privillegeList: string[], privillegeName: string) => {
  return privillegeList.includes(privillegeName);
};

export const canReadResource = (privillegeList: string[], resourceName: string) => {
  return hasPrivillege(privillegeList, getPrivillegeName(ACTION_READ, resourceName));
};

export const canInsertResource = (privillegeList: string[], resourceName: string) => {
  return hasPrivillege(privillegeList, getPrivillegeName(ACTION_INSERT, resourceName));
};

export const canUpdateResource = (privillegeList: string[], resourceName: string) => {
  return hasPrivillege(privillegeList, getPrivillegeName(ACTION_UPDATE, resourceName));
};

export const canDeleteResource = (privillegeList: string[], resourceName: string) => {
  return hasPrivillege(privillegeList, getPrivillegeName(ACTION_DELETE, resourceName));
};

const resolveRouteResourceName = (pathname: string) => {
  const matchedRule = routePrivillegeRuleList.find((rule) =>
    Boolean(matchPath({ path: rule.path, end: true }, pathname)),
  );

  return matchedRule?.resourceName || null;
};

export const canAccessPathByPrivillege = (pathname: string, privillegeList: string[]) => {
  const resourceName = resolveRouteResourceName(pathname);

  if (!resourceName) {
    return true;
  }

  return canReadResource(privillegeList, resourceName);
};
