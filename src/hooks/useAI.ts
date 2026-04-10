"use client";

import { useQuery } from '@tanstack/react-query';
import type { Notification } from '@/types/database.types';

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
      const data = await res.json();
      return data as Notification[];
    },
    refetchInterval: 1000 * 60 * 5, // Every 5 mins
  });
}
