"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "@/services/api";
import { PERMISSIONS } from "@/config/permissions";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "EMPLOYEE";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  permissions: string[];
  avatarUrl: string | null;
  phone: string | null;
  jobTitle: string | null;
  companyId: number | null;
  company?: { id: number; name: string; logoUrl: string | null; status?: string; plan?: string } | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canSeeFinancials: boolean;
  can: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get<AuthUser>("/auth/me");
      setUser(response.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  async function login(email: string, password: string) {
    const response = await api.post<{ user: AuthUser; expiresIn: string }>(
      "/auth/login",
      { email, password },
    );

    setUser(response.data.user);
    return response.data.user;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
      window.location.replace("/login");
    }
  }

  const value = useMemo<AuthContextValue>(
    () => {
      const can = (permission: string) => Boolean(user?.permissions?.includes("*") || user?.permissions?.includes(permission));
      return ({
      user,
      loading,
      login,
      logout,
      refreshUser,
      isAdmin: user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || can(PERMISSIONS.USERS_MANAGE),
      isSuperAdmin: user?.role === "SUPER_ADMIN",
      canSeeFinancials: can(PERMISSIONS.DASHBOARD_FINANCIALS),
      can,
    });
    },
    [user, loading, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
