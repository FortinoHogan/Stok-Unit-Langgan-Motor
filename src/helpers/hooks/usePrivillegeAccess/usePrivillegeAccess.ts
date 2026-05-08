import { useMemo } from "react";
import { usePrivillegeStore } from "@/helpers/hooks/usePrivillegeStore/usePrivillegeStore";
import {
  canDeleteResource,
  canInsertResource,
  canReadResource,
  canUpdateResource,
} from "@/constants/privillegeAccess";

// Ini yang dipanggil di setiap page
export const usePrivillegeAccess = (resourceName: string) => {
  const privillegeList = usePrivillegeStore((state) => state.privillegeList);

  return useMemo(
    () => ({
      canRead: canReadResource(privillegeList, resourceName),
      canInsert: canInsertResource(privillegeList, resourceName),
      canUpdate: canUpdateResource(privillegeList, resourceName),
      canDelete: canDeleteResource(privillegeList, resourceName),
    }),
    [privillegeList, resourceName],
  );
};
