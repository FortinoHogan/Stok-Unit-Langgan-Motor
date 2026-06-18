import { useMemo } from "react";
import { usePrivilegeStore } from "@/helpers/hooks/usePrivilegeStore/usePrivilegeStore";
import {
  canDeleteResource,
  canInsertResource,
  canReadResource,
  canUpdateResource,
} from "@/constants/privilegeAccess";

// Ini yang dipanggil di setiap page
export const usePrivilegeAccess = (resourceName: string) => {
  const privilegeList = usePrivilegeStore((state) => state.privilegeList);

  return useMemo(
    () => ({
      canRead: canReadResource(privilegeList, resourceName),
      canInsert: canInsertResource(privilegeList, resourceName),
      canUpdate: canUpdateResource(privilegeList, resourceName),
      canDelete: canDeleteResource(privilegeList, resourceName),
    }),
    [privilegeList, resourceName],
  );
};
