// client/src/lib/auth.ts

import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "./queryClient";

interface User {
  id: number;
  email: string;
  fullName: string;
}

interface AuthResponse {
  user: User | null;
}

export function useAuth() {
  const { data: response, isLoading, error } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  return {
    user: response?.user ?? null,
    isLoading,
    isAuthenticated: !!response?.user,
    error,
  };
}
