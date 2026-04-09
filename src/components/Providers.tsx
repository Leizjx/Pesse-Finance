/**
 * Providers.tsx
 * -------------
 * Client-side providers wrapper for Next.js App Router.
 * Must be 'use client' because TanStack Query and Zustand need browser context.
 *
 * Pattern: Keep root layout as a Server Component, delegate client providers here.
 */

"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/queryClient";
import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Stable QueryClient via lazy useState — created only once, React-rule compliant
  const [queryClient] = useState<QueryClient>(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
