import { create } from "zustand";
import { ApiError, api } from "../lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  emailVerified: boolean;
  language: string;
  theme: string;
  finCoins: number;
  xp: number;
  streak: number;
};

type Status = "loading" | "authed" | "guest" | "error";

type AuthState = {
  user: User | null;
  status: Status;
  load: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, language: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  status: "loading",

  // Checks if the visitor is already logged in. Runs once when the app opens.
  load: async () => {
    try {
      const data = await api<{ user: User }>("/api/auth/me");
      set({ user: data.user, status: "authed" });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) set({ user: null, status: "guest" });
      else set({ user: null, status: "error" });
    }
  },

  login: async (email, password) => {
    const data = await api<{ user: User }>("/api/auth/login", { method: "POST", body: { email, password } });
    set({ user: data.user, status: "authed" });
  },

  signup: async (name, email, password, language) => {
    const data = await api<{ user: User }>("/api/auth/signup", {
      method: "POST",
      body: { name, email, password, language },
    });
    set({ user: data.user, status: "authed" });
  },

  logout: async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } finally {
      set({ user: null, status: "guest" });
    }
  },
}));