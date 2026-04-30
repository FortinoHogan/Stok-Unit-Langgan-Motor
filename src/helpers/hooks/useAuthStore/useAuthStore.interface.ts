import type { AuthenticatedUser } from "@/interfaces/IModel.interface";

export interface AuthState {
  authenticatedUser: AuthenticatedUser | null;
  setAuthenticatedUser: (user: AuthenticatedUser | null) => void;
  clearAuthenticatedUser: () => void;
}