import { matchPath } from "react-router-dom";
import { routes } from "@/constants/routeValues";

interface RoutePrivilegeRule {
  path: string;
  resourceName: string;
}

// Namanya harus persis sama di sidebar
const RoutePrivilegeRuleList: RoutePrivilegeRule[] = [
  { path: routes.manageUsers, resourceName: "Manage Users" },
  { path: routes.manageMasterDataCategory, resourceName: "Master Category" },
  { path: routes.manageMasterDataColor, resourceName: "Master Color" },
  { path: routes.manageMasterDataType, resourceName: "Master Type" },
  { path: routes.manageMasterDataRole, resourceName: "Master Role" },
  {
    path: routes.manageMasterDataPrivilege,
    resourceName: "Master Privilege",
  },
  { path: routes.manageMasterDataProgram, resourceName: "Master Program" },
  { path: routes.manageMasterDataPeriod, resourceName: "Master Period" },
  { path: routes.manageMasterDataSales, resourceName: "Master Sales" },
  {
    path: routes.manageMasterDataSellingType,
    resourceName: "Master Selling Type",
  },
  { path: routes.manageMasterDataVolume, resourceName: "Master Volume" },
  { path: routes.typeAndColor, resourceName: "Type and Color" },
  { path: routes.roleAndPrivilege, resourceName: "Role and privilege" },
  { path: routes.transaction, resourceName: "Transaction" },
  { path: routes.report, resourceName: "Report" },
];

const ACTION_READ = "Read";
const ACTION_INSERT = "Insert";
const ACTION_UPDATE = "Update";
const ACTION_DELETE = "Delete";

export const getprivilegeName = (actionName: string, resourceName: string) => {
  return `${actionName} ${resourceName}`;
};

export const hasPrivilege = (
  privilegeList: string[],
  privilegeName: string,
) => {
  return privilegeList.includes(privilegeName);
};

export const canReadResource = (
  privilegeList: string[],
  resourceName: string,
) => {
  return hasPrivilege(
    privilegeList,
    getprivilegeName(ACTION_READ, resourceName),
  );
};

export const canInsertResource = (
  privilegeList: string[],
  resourceName: string,
) => {
  return hasPrivilege(
    privilegeList,
    getprivilegeName(ACTION_INSERT, resourceName),
  );
};

export const canUpdateResource = (
  privilegeList: string[],
  resourceName: string,
) => {
  return hasPrivilege(
    privilegeList,
    getprivilegeName(ACTION_UPDATE, resourceName),
  );
};

export const canDeleteResource = (
  privilegeList: string[],
  resourceName: string,
) => {
  return hasPrivilege(
    privilegeList,
    getprivilegeName(ACTION_DELETE, resourceName),
  );
};

const resolveRouteResourceNameList = (pathname: string) => {
  const matchedRuleList = RoutePrivilegeRuleList.filter((rule) =>
    Boolean(matchPath({ path: rule.path, end: true }, pathname)),
  );

  return matchedRuleList.map((rule) => rule.resourceName);
};

export const canAccessPathByprivilege = (
  pathname: string,
  privilegeList: string[],
) => {
  const resourceNameList = resolveRouteResourceNameList(pathname);

  if (!resourceNameList.length) {
    return true;
  }

  return resourceNameList.some((resourceName) =>
    canReadResource(privilegeList, resourceName),
  );
};
