import { createClient } from '@/lib/supabaseServer';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function scanAndNotify(userId: string) {
  const supabase = await createClient();
  
  // Use Admin Client to skip RLS if we need to insert system notifications
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();

  // 1. Scan Budgets for > 80% usage
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId);

  if (budgets) {
    for (const budget of budgets) {
      if (budget.spent_amount >= budget.limit_amount * 0.8) {
        // Create notification if not already created today
        const todayStr = now.toISOString().split('T')[0];
        const title = `Cảnh báo ngân sách: ${budget.category}`;
        
        // Check if warned today
        const { data: existing } = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('title', title)
          .gte('created_at', todayStr)
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            type: 'budget_alert',
            title,
            content: `Bạn đã sử dụng ${Math.round((budget.spent_amount / budget.limit_amount) * 100)}% ngân sách cho hạng mục "${budget.category}".`,
          });
        }
      }
    }
  }

  // 2. Scan Subscriptions for renewal tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('next_billing_date', tomorrowStr);

  if (subs) {
    for (const sub of subs) {
      const title = `Nhắc lịch gia hạn: ${sub.service_name}`;
      
      // Prevent double notifications
      const { data: existing } = await supabaseAdmin
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('title', title)
        .gte('created_at', now.toISOString().split('T')[0])
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabaseAdmin.from('notifications').insert({
          user_id: userId,
          type: 'subscription_reminder',
          title,
          content: `Gói dịch vụ "${sub.service_name}" của bạn sẽ gia hạn vào ngày mai với số tiền ${sub.amount.toLocaleString()} ${sub.currency}.`,
        });
      }
    }
  }
}
