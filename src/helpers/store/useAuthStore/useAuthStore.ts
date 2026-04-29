import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import type { AuthState } from "./useAuthStore.interface";

const encodeBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const decodeBase64 = (value: string): string => {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
};

const obfuscatedStorage: StateStorage = {
  getItem: (name) => {
    const persistedValue = localStorage.getItem(name);

    if (!persistedValue) {
      return null;
    }

    try {
      return decodeBase64(persistedValue);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    localStorage.setItem(name, encodeBase64(value));
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authenticatedUser: null,
      setAuthenticatedUser: (user) => set({ authenticatedUser: user }),
      clearAuthenticatedUser: () => set({ authenticatedUser: null }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => obfuscatedStorage),
    },
  ),
);
