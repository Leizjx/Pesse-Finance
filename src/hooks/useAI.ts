"use client";

import { useQuery } from '@tanstack/react-query';

export function useAIInsight() {
  return useQuery({
    queryKey: ['ai-insight'],
    queryFn: async () => {
      const res = await fetch('/api/ai/insight');
      if (!res.ok) throw new Error('Failed to fetch AI insight');
      return res.json() as Promise<{ insight: string }>;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json() as Promise<any[]>;
    },
    refetchInterval: 1000 * 60 * 5, // Every 5 mins
  });
}
