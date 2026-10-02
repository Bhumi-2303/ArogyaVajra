"use client";

import { useContext } from "react";
import { AuthContext, AuthContextType } from "@/context/auth-context";

/**
 * Access the current authentication state and actions.
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
