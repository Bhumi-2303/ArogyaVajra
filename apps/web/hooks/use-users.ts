"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateUserApi,
  deactivateUserApi,
  getUserApi,
  getUsersApi,
  updateUserApi,
} from "@/lib/api/users";
import { UserSearchParams, UserUpdateInput } from "@/lib/api/types";

export const USERS_QUERY_KEY = ["users"];

export function useUsers(params?: UserSearchParams) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: () => getUsersApi(params),
  });
}

export function useUser(userId: string | null | undefined) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return getUserApi(userId);
    },
    enabled: Boolean(userId),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UserUpdateInput;
    }) => updateUserApi(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...USERS_QUERY_KEY, variables.userId],
      });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => activateUserApi(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...USERS_QUERY_KEY, userId],
      });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deactivateUserApi(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...USERS_QUERY_KEY, userId],
      });
    },
  });
}
