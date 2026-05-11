import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PrivillegeState } from "./usePrivillegeStore.interface";

export const usePrivillegeStore = create<PrivillegeState>()(
  persist(
    (set) => ({
      privillegeList: [],
      loadedRoleId: null,
      isLoading: false,
      setPrivillegeList: (privilleges, roleId) =>
        set({
          privillegeList: privilleges,
          loadedRoleId: roleId,
          isLoading: false,
        }),
      setIsLoading: (value) => set({ isLoading: value }),
      clearPrivilleges: () =>
        set({
          privillegeList: [],
          loadedRoleId: null,
          isLoading: false,
        }),
    }),
    {
      name: "privillege-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        privillegeList: state.privillegeList,
        loadedRoleId: state.loadedRoleId,
      }),
    },
  ),
);
