import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PrivilegeState } from "./usePrivilegeStore.interface";

export const usePrivilegeStore = create<PrivilegeState>()(
  persist(
    (set) => ({
      privilegeList: [],
      loadedRoleId: null,
      isLoading: false,
      setPrivilegeList: (privileges, roleId) =>
        set({
          privilegeList: privileges,
          loadedRoleId: roleId,
          isLoading: false,
        }),
      setIsLoading: (value) => set({ isLoading: value }),
      clearPrivileges: () =>
        set({
          privilegeList: [],
          loadedRoleId: null,
          isLoading: false,
        }),
    }),
    {
      name: "privilege-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        privilegeList: state.privilegeList,
        loadedRoleId: state.loadedRoleId,
      }),
    },
  ),
);
