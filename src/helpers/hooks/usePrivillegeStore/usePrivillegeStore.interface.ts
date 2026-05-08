export interface PrivillegeState {
  privillegeList: string[];
  loadedRoleId: number | null;
  isLoading: boolean;
  setPrivillegeList: (privilleges: string[], roleId: number) => void;
  setIsLoading: (value: boolean) => void;
  clearPrivilleges: () => void;
}
