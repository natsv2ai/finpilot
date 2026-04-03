"use client";

import { create } from "zustand";
import { TOKEN_KEY } from "@/lib/constants";

interface AuthState {
  user: any | null;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  login: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("finpilot_user", JSON.stringify(user));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("finpilot_user");
    set({ user: null, token: null });
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
}));