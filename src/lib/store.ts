/**
 * Zustand auth store – tokens, user, active flat.
 */
import { create } from "zustand";
import type { User, AuthTokens, Flat } from "./types";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  activeFlatId: string | null;
  permissions: string[];
  setUser: (u: User | null) => void;
  setTokens: (t: AuthTokens | null) => void;
  setActiveFlatId: (id: string | null) => void;
  setPermissions: (p: string[]) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  activeFlatId: null,
  permissions: [],

  setUser: (user) => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
    set({ user });
  },

  setTokens: (tokens) => {
    if (tokens) {
      localStorage.setItem("tokens", JSON.stringify(tokens));
    } else {
      localStorage.removeItem("tokens");
    }
    set({ tokens });
  },

  setActiveFlatId: (id) => {
    if (id) {
      localStorage.setItem("active_flat_id", id);
    } else {
      localStorage.removeItem("active_flat_id");
    }
    set({ activeFlatId: id });
  },

  setPermissions: (permissions) => set({ permissions }),

  logout: () => {
    localStorage.removeItem("tokens");
    localStorage.removeItem("active_flat_id");
    localStorage.removeItem("user");
    set({ user: null, tokens: null, activeFlatId: null, permissions: [] });
  },

  hydrate: () => {
    const tokens = localStorage.getItem("tokens");
    const flatId = localStorage.getItem("active_flat_id");
    const user = localStorage.getItem("user");
    set({
      tokens: tokens ? JSON.parse(tokens) : null,
      activeFlatId: flatId || null,
      user: user ? JSON.parse(user) : null,
    });
  },
}));
