import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { service_name, amount, currency, billing_cycle, next_billing_date } = await req.json();

  if (!service_name || !amount || !next_billing_date) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      service_name,
      amount: parseFloat(amount),
      currency,
      billing_cycle,
      next_billing_date,
      status: 'active',
      source: 'manual' // Đã thêm cột này trong migration 20260411
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating manual subscription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
