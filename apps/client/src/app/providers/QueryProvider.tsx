import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute
            retry: (failureCount, error: any) => {
              // Don't retry on 401/403/404
              if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
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
