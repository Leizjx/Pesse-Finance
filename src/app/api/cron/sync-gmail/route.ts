import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GmailSyncService } from '@/lib/services/gmailSyncService';
import { AiParserService } from '@/lib/services/aiParserService';
import { parseBankEmail } from '@/lib/parsers/bankRegex';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateStatus(action: 'start' | 'progress' | 'finish', payload?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  try {
    await fetch(`${baseUrl}/api/sync-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CRON_SECRET ?? ''}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch (e) {}
}

const BANK_QUERY_MAP: Record<string, string> = {
  vcb: '(vietcombank VND) newer_than:1d',
  tcb: '(techcombank VND) newer_than:1d',
  mb:  '(mbbank VND) newer_than:1d',
  tpb: '(tpbank VND) newer_than:1d',
  acb: '(acb.com VND) newer_than:1d',
};

const FROM_BANK_MAP: Record<string, string> = {
  vietcombank: 'vcb',
  techcombank: 'tcb',
  mbbank:      'mb',
  tpbank:      'tpb',
  'acb.com':   'acb',
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  await updateStatus('start', { log: 'Bắt đầu đồng bộ tự động...' });

  try {
    const { data: connections } = await supabaseAdmin
      .from('data_connections')
      .select('*')
      .eq('sync_status', 'active');

    if (!connections || connections.length === 0) {
      await updateStatus('finish');
      return NextResponse.json({ message: 'No active connections' });
    }

    const gmailService = new GmailSyncService({
      clientId:     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri:  process.env.GOOGLE_REDIRECT_URI!,
    });

    const aiParser = new AiParserService(process.env.GEMINI_API_KEY!);
    const VALID_CATEGORIES = ["food", "transport", "entertainment", "health", "education", "shopping", "utilities", "rent", "salary", "investment", "insurance", "other"];

    let totalProcessed = 0;

    for (const connection of connections) {
      try {
        const selectedBanks = (connection.selected_banks as string[]) || [];
        const query = selectedBanks.map(b => BANK_QUERY_MAP[b]).filter(Boolean).join(' OR ');
        if (!query) continue;

        gmailService.setCredentials(connection.provider_refresh_token);
        const messages = await gmailService.fetchMessages(query, 10); // Cron fetch ít hơn manual
        
        const allParsed: any[] = [];
        for (const msg of messages) {
          const aiResult = await aiParser.parseTransaction(msg.body);
          let tx: any = null;

          if (aiResult) {
            let cat = (aiResult.category || 'other').toLowerCase();
            if (!VALID_CATEGORIES.includes(cat)) cat = 'other';
            tx = {
              user_id: connection.user_id,
              amount: aiResult.amount,
              type: aiResult.type || 'expense',
              category: cat,
              date: aiResult.date || new Date().toISOString().split('T')[0],
              note: aiResult.description || msg.subject,
              bank_id: aiResult.bank_name?.toLowerCase() || selectedBanks[0] || 'vcb',
            };
          } else {
            const matchedBankId = Object.entries(FROM_BANK_MAP).find(([kw]) => 
              msg.from.toLowerCase().includes(kw)
            )?.[1] || selectedBanks[0] || 'vcb';
            const parsed = parseBankEmail(msg.body, matchedBankId);
            if (parsed) {
              tx = { ...parsed, user_id: connection.user_id };
            }
          }

          if (tx) allParsed.push(tx);
        }

        if (allParsed.length > 0) {
          const { data: existing } = await supabaseAdmin
            .from('transactions')
            .select('amount, date, note')
            .eq('user_id', connection.user_id);

          const filtered = allParsed.filter(p => !existing?.some(e => 
            Number(e.amount) === Number(p.amount) && 
            e.date === p.date && 
            (e.note || '').includes((p.note || '').substring(0, 10))
          ));

          if (filtered.length > 0) {
            await supabaseAdmin.from('transactions').insert(filtered);
            totalProcessed += filtered.length;
          }
        }
      } catch (err) {
        console.error(`Error syncing connection ${connection.email_address}:`, err);
      }
    }

    await updateStatus('finish');
    return NextResponse.json({ success: true, processed: totalProcessed });
  } catch (error: any) {
    await updateStatus('finish');
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
