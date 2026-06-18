import type { ReactNode } from "react";
import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner";
import { routes } from "@/constants/paths";
import { usePrivilegeStore } from "@/helpers/hooks/usePrivilegeStore/usePrivilegeStore";
import { canAccessPathByprivilege } from "@/constants/privilegeAccess";

interface AppContentProps {
  children: ReactNode;
}

const AppContent = ({ children }: AppContentProps) => {
  const location = useLocation();
  const privilegeList = usePrivilegeStore((state) => state.privilegeList);
  const loadedRoleId = usePrivilegeStore((state) => state.loadedRoleId);

  const canAccessCurrentPath = useMemo(
    () => canAccessPathByprivilege(location.pathname, privilegeList),
    [location.pathname, privilegeList],
  );

  if (loadedRoleId === null) {
    return <AppSpinner />;
  }

  if (!canAccessCurrentPath) {
    return <Navigate to={routes.home} replace />;
  }

  return <>{children}</>;
};

export default AppContent;
