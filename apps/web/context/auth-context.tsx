"use client";

import * as React from "react";
import {
  clearStoredTokens,
  getStoredAccessToken,
  setStoredTokens,
} from "@/lib/api/client";
import { getCurrentUserApi, loginApi, logoutApi, registerApi } from "@/lib/api/auth";
import { LoginInput, RegisterInput, User } from "@/lib/api/types";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
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

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
