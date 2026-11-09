"use client";

import * as React from "react";
import {
  clearSessionCookie,
  clearStoredTokens,
  setAccessToken,
  setSessionCookie,
} from "@/lib/api/client";
import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  refreshApi,
  registerApi,
} from "@/lib/api/auth";
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
  login: (credentials: LoginInput) => Promise<User>;
  register: (data: RegisterInput) => Promise<User>;
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
    try {
      // Attempt silent refresh on initial application load using httpOnly cookie
      const refreshData = await refreshApi();
      if (refreshData?.access_token) {
        setAccessToken(refreshData.access_token);
        setSessionCookie();
        setToken(refreshData.access_token);
        const currentUser = await getCurrentUserApi();
        setUser(currentUser);
      } else {
        setAccessToken(null);
        clearSessionCookie();
        setUser(null);
        setToken(null);
      }
    } catch {
      setAccessToken(null);
      clearSessionCookie();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    initSession();
  }, [initSession]);

  const login = async (credentials: LoginInput): Promise<User> => {
    setIsLoading(true);
    try {
      const authData = await loginApi(credentials);
      setAccessToken(authData.access_token);
      setSessionCookie();
      setUser(authData.user);
      setToken(authData.access_token);
      return authData.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterInput): Promise<User> => {
    setIsLoading(true);
    try {
      const authData = await registerApi(data);
      setAccessToken(authData.access_token);
      setSessionCookie();
      setUser(authData.user);
      setToken(authData.access_token);
      return authData.user;
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
