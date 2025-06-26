import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "./queryClient";

interface User {
  id: number;
  email: string;
  fullName: string;
}

export function useAuth() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  return {
    user: response?.user as User | null,
    isLoading,
    isAuthenticated: !!response?.user,
    error,
  };
}
