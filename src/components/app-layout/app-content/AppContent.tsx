import type { ReactNode } from "react";
import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppSpinner from "@/components/app-components/app-spinner/AppSpinner";
import { routes } from "@/constants/paths";
import { usePrivillegeStore } from "@/helpers/hooks/usePrivillegeStore/usePrivillegeStore";
import { canAccessPathByPrivillege } from "@/constants/privillegeAccess";

interface AppContentProps {
  children: ReactNode;
}

const AppContent = ({ children }: AppContentProps) => {
  const location = useLocation();
  const privillegeList = usePrivillegeStore((state) => state.privillegeList);
  const loadedRoleId = usePrivillegeStore((state) => state.loadedRoleId);

  const canAccessCurrentPath = useMemo(
    () => canAccessPathByPrivillege(location.pathname, privillegeList),
    [location.pathname, privillegeList],
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
