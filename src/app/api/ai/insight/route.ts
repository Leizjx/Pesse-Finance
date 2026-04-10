import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { generateFinancialInsight } from '@/lib/aiService';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Aggregate Data for AI
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  // 1. Transactions - Monthly total & categories
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', firstDayOfMonth);

  // 2. Subscriptions
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id);

  // 3. Profile for Income (mocked if not found, or use a default)
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_balance')
    .eq('id', user.id)
    .single();

  const totalExpenses = transactions?.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0) || 0;
  const income = transactions?.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0) || 5000000; // default 5M if no income found

  const categories: Record<string, number> = {};
  transactions?.forEach(t => {
    if (t.type === 'expense') {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    }
  });

  const insight = await generateFinancialInsight({
    monthlyIncome: income,
    totalExpenses,
    expensesByCategory: categories,
    subscriptions: subscriptions || []
  });

  return NextResponse.json({ insight });
}
