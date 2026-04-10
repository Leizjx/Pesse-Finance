import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabaseClient';
import type { Subscription, SyncSubscriptionsResponse } from '@/types/database.types';
import { useAuth } from './useAuth';

export function useSubscriptions() {
  const { user } = useAuth();
  const supabase = createClient();

  return useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: async (): Promise<Subscription[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('next_billing_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useSyncSubscriptions() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (): Promise<SyncSubscriptionsResponse> => {
      const response = await fetch('/api/sync/subscriptions', {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Lỗi khi đồng bộ đăng ký');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate the cache to trigger a re-fetch or use the returned data
      queryClient.setQueryData(['subscriptions', user?.id], data.subscriptions);
    },
  });
}
