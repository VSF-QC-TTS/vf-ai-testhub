import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: (failureCount, error: unknown) => {
              // Don't retry on 401/403/404
              const status = typeof error === "object" && error !== null && "status" in error ? error.status : undefined;
              if (status === 401 || status === 403 || status === 404) {
                return false;
              }
              // Retry max 2 times for idempotent reads
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Do not blindly retry mutations
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
