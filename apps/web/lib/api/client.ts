/**
 * Centralized API client with automatic token attachment and 401 recovery.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("arogyavajra_access_token");
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("arogyavajra_refresh_token");
}

export function setStoredTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("arogyavajra_access_token", accessToken);
  localStorage.setItem("arogyavajra_refresh_token", refreshToken);
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("arogyavajra_access_token");
  localStorage.removeItem("arogyavajra_refresh_token");
}

/**
 * Execute an authenticated API request with automatic header injection and 401 handling.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const token = getStoredAccessToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with token refresh attempt
  if (response.status === 401 && !endpoint.includes("/auth/refresh") && !endpoint.includes("/auth/login")) {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccess = refreshData.data.access_token;
          const newRefresh = refreshData.data.refresh_token;
          setStoredTokens(newAccess, newRefresh);

          // Retry original request with fresh token
          headers["Authorization"] = `Bearer ${newAccess}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          clearStoredTokens();
        }
      } catch {
        clearStoredTokens();
      }
    } else {
      clearStoredTokens();
    }
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    let errorData: unknown = null;
    try {
      errorData = await response.json();
      if (typeof errorData === "object" && errorData !== null && "detail" in errorData) {
        const detail = (errorData as { detail: unknown }).detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail) && detail.length > 0 && detail[0].msg) {
          errorMessage = detail[0].msg;
        }
      } else if (typeof errorData === "object" && errorData !== null && "message" in errorData) {
        errorMessage = String((errorData as { message: unknown }).message);
      }
    } catch {
      // Body not JSON
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json() as Promise<T>;
}
