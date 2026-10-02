"use client";

import * as React from "react";
import {
  clearStoredTokens,
  getStoredAccessToken,
  setStoredTokens,
} from "@/lib/api/client";
import { getCurrentUserApi, loginApi, logoutApi, registerApi } from "@/lib/api/auth";
import { LoginInput, RegisterInput, User, UserRole } from "@/lib/api/types";
import {
  Permission,
  getRolePermissions,
  hasAllPermissions as checkHasAllPermissions,
  hasAnyPermission as checkHasAnyPermission,
  hasPermission as checkHasPermission,
  hasRole as checkHasRole,
} from "@/lib/auth/permissions";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  permissions: readonly Permission[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasRole: (roles: UserRole | readonly UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: readonly Permission[]) => boolean;
  hasAllPermissions: (permissions: readonly Permission[]) => boolean;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const initSession = React.useCallback(async () => {
    const existingToken = getStoredAccessToken();
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUserApi();
      setUser(currentUser);
      setToken(existingToken);
    } catch {
      clearStoredTokens();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    initSession();
  }, [initSession]);

  const login = async (credentials: LoginInput) => {
    setIsLoading(true);
    try {
      const authData = await loginApi(credentials);
      setStoredTokens(authData.access_token, authData.refresh_token);
      setUser(authData.user);
      setToken(authData.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const authData = await registerApi(data);
      setStoredTokens(authData.access_token, authData.refresh_token);
      setUser(authData.user);
      setToken(authData.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi().catch(() => {
        // Ignore network errors on logout
      });
    } finally {
      clearStoredTokens();
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    await initSession();
  };

  const userRole = user?.role ?? null;
  const permissions = React.useMemo(() => getRolePermissions(userRole), [userRole]);

  const hasRole = React.useCallback(
    (roles: UserRole | readonly UserRole[]) => checkHasRole(userRole, roles),
    [userRole]
  );

  const hasPermission = React.useCallback(
    (permission: Permission) => checkHasPermission(userRole, permission),
    [userRole]
  );

  const hasAnyPermission = React.useCallback(
    (perms: readonly Permission[]) => checkHasAnyPermission(userRole, perms),
    [userRole]
  );

  const hasAllPermissions = React.useCallback(
    (perms: readonly Permission[]) => checkHasAllPermissions(userRole, perms),
    [userRole]
  );

  const value: AuthContextType = {
    user,
    token,
    role: userRole,
    permissions,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshSession,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
