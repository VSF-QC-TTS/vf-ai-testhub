import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserSummary {
  publicId: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: UserSummary | null;
  isAuthenticated: boolean;
  setSession: (accessToken: string, user: UserSummary) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setSession: (accessToken, user) =>
        set({ accessToken, user, isAuthenticated: true }),
      clearSession: () => set({ accessToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "vf-auth-storage",
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // only persist safe data
    }
  )
);
