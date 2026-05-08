import { create } from "zustand";
import type { PrivillegeState } from "./usePrivillegeStore.interface";

export const usePrivillegeStore = create<PrivillegeState>((set) => ({
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
}));
