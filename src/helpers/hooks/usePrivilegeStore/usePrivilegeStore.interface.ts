export interface PrivilegeState {
  privilegeList: string[];
  loadedRoleId: number | null;
  isLoading: boolean;
  setPrivilegeList: (privileges: string[], roleId: number) => void;
  setIsLoading: (value: boolean) => void;
  clearPrivileges: () => void;
}
