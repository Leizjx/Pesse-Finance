import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { parseSubscriptionEmail, deduplicateSubscriptions, ParsedSubscription } from '@/lib/parsers/subscriptionRegex';

export async function POST(req: Request) {
  // 1. Authenticate user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch Profile to check premium status
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_type')
    .eq('id', user.id)
    .single();

  if (!profile || profile.plan_type !== 'premium') {
    return NextResponse.json({ error: 'Tính năng này yêu cầu tài khoản Premium' }, { status: 403 });
  }

  // 3. Fetch Data Connection for Gmail
  const { data: connection } = await supabase
    .from('data_connections')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'gmail')
    .eq('sync_status', 'active')
    .single();

  if (!connection || !connection.provider_refresh_token) {
    return NextResponse.json({ error: 'Chưa kết nối Gmail hợp lệ' }, { status: 400 });
  }

  // 4. Initialize Gmail API
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  
  oauth2Client.setCredentials({
    refresh_token: connection.provider_refresh_token
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    // 5. Query for subscription emails (last 6 months, receipts etc)
    const query = 'subject:(receipt OR invoice OR thanh toán OR gia hạn) (netflix OR spotify OR icloud OR youtube OR canva OR adobe OR microsoft OR google one OR notion OR figma) newer_than:6m';
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50,
    });

    const messages = response.data.messages || [];
    
    if (messages.length === 0) {
      return NextResponse.json({ success: true, synced: 0, subscriptions: [] });
    }

    const parsedRecords: (ParsedSubscription & { _msgId: string })[] = [];

    // Process each message
    for (const msg of messages) {
      if (!msg.id) continue;
      
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      });

      const payload = fullMessage.data.payload;
      if (!payload) continue;

      let subject = '';
      const headers = payload.headers;
      if (headers) {
        const subjHeader = headers.find((h) => h.name?.toLowerCase() === 'subject');
        if (subjHeader) subject = subjHeader.value || '';
      }

      // Decode body (base64url)
      let bodyData = '';
      if (payload.body?.data) {
        bodyData = Buffer.from(payload.body.data, 'base64url').toString('utf-8');
      } else if (payload.parts && payload.parts.length > 0) {
        // Find html or plain text part
        const htmlPart = payload.parts.find(p => p.mimeType === 'text/html');
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        const partToUse = htmlPart || textPart;
        if (partToUse?.body?.data) {
          bodyData = Buffer.from(partToUse.body.data, 'base64url').toString('utf-8');
        }
      }

      const parsed = parseSubscriptionEmail(subject, bodyData);
      if (parsed) {
        parsedRecords.push({ ...parsed, _msgId: msg.id });
      }
    }

    // 6. Deduplicate (only keeps the most recent for each service)
    const finalRecords = deduplicateSubscriptions(parsedRecords) as (ParsedSubscription & { _msgId: string })[];

    // 7. Insert using Service Role Key to bypass RLS restrictions if needed
    // The policy does allow users to insert their own records, so actually
    // the user client could do it. BUT the user objective explicitly says:
    // "Ensuring data integrity and security by utilizing the Supabase Service Role Key for database operations."
    
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    );

    const subscriptionsToInsert = finalRecords.map(record => ({
      user_id: user.id,
      service_name: record.serviceName,
      logo_url: record.logoUrl,
      amount: record.amount,
      currency: record.currency,
      billing_cycle: record.billingCycle,
      last_billing_date: record.transactionDate,
      next_billing_date: record.nextBillingDate,
      status: 'active',
      gmail_msg_id: record._msgId,
      source: 'gmail',
    }));

    if (subscriptionsToInsert.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from('subscriptions')
        .upsert(subscriptionsToInsert, {
          onConflict: 'user_id,gmail_msg_id',
          ignoreDuplicates: true
        });

      if (upsertError) {
        console.error('Supabase Upsert Error:', upsertError);
        return NextResponse.json({ error: 'Lỗi lưu trữ dữ liệu đăng ký' }, { status: 500 });
      }
    }

    // Return the inserted records back to client
    const { data: latestSubscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      synced: finalRecords.length,
      subscriptions: latestSubscriptions || []
    });

  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Lỗi trong quá trình đồng bộ', details: String(error) }, { status: 500 });
  }
}
