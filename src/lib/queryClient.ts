/**
 * queryClient.ts
 * --------------
 * TanStack Query v5 client configuration.
 *
 * Defaults chosen for a finance app:
 * - staleTime: 5 min — balance/transaction data doesn't change every second
 * - retry: 1 — avoid hammering the DB on transient failures
 * - refetchOnWindowFocus: false — user shouldn't see stale → fresh flash mid-work
 */

import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        // On mutation errors, don't retry — financial writes must be explicit
        retry: 0,
      },
    },
  });
}

// Browser singleton — only one QueryClient per browser session
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a fresh client to avoid cross-request caching
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
