/**
 * Manual Sync Route - Secure version for user-triggered sync.
 * Forces HMR update to clear stale module cache.
 */
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { parseBankEmail } from '@/lib/parsers/bankRegex';
import { GmailSyncService } from '@/lib/services/gmailSyncService';
import { AiParserService } from '@/lib/services/aiParserService';

// Admin client for DB operations (bypass RLS if needed for sync)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const supabase = await createServerClient();
  
  // 1. Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    // 2. Get active connections for THIS user only
    const { data: connections, error } = await supabaseAdmin
      .from('data_connections')
      .select('id, user_id, email_address, selected_banks, provider_refresh_token')
      .eq('user_id', userId)
      .eq('sync_status', 'active');

    if (error) throw error;
    if (!connections || connections.length === 0) {
      return NextResponse.json({ message: 'Không có kết nối active nào.' });
    }

    const BANK_QUERY_MAP: Record<string, string> = {
      vcb: '(vietcombank VND) newer_than:7d',
      tcb: '(techcombank VND) newer_than:7d',
      mb:  '(mbbank VND) newer_than:7d',
      tpb: '(tpbank VND) newer_than:7d',
      acb: '(acb.com.vn VND) newer_than:7d',
      vib: '(vib VND) newer_than:7d',
      ctg: '(vietinbank VND) newer_than:7d',
      bidv: '(bidv VND) newer_than:7d',
    };

    const gmailService = new GmailSyncService({
      clientId:     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri:  process.env.GOOGLE_REDIRECT_URI!,
    });

    const aiParser = new AiParserService(process.env.GEMINI_API_KEY!);

    let totalFound = 0;
    let aiSuccess = 0;
    let regexSuccess = 0;
    let errors: string[] = [];
    const allParsedTransactions: any[] = [];

    // Duyệt qua từng kết nối Gmail
    for (const connection of connections) {
      try {
        let selectedBanks: string[] = [];
        if (Array.isArray(connection.selected_banks)) {
          selectedBanks = connection.selected_banks;
        } else if (typeof connection.selected_banks === 'string') {
          selectedBanks = (connection.selected_banks as string).split(',').map(s => s.trim());
        }
        
        const gmailQuery = selectedBanks
          .map(id => BANK_QUERY_MAP[id.toLowerCase()])
          .filter(Boolean)
          .join(' OR ');

        if (!gmailQuery) continue;

        console.log(`[Sync] Scanning ${connection.email_address} with query: ${gmailQuery}`);
        
        gmailService.setCredentials(connection.provider_refresh_token!);
        const messages = await gmailService.fetchMessages(gmailQuery, 20);
        totalFound += messages.length;

        for (const msg of messages) {
          try {
            // 1. Ưu tiên AI
            const aiResult = await aiParser.parseTransaction(msg.body);
            
            if (aiResult) {
              aiSuccess++;
              const VALID_CATEGORIES = ["food", "transport", "entertainment", "health", "education", "shopping", "utilities", "rent", "salary", "investment", "insurance", "other"];
              let cat = (aiResult.category || 'other').toLowerCase();
              if (!VALID_CATEGORIES.includes(cat)) cat = 'other';

              allParsedTransactions.push({
                user_id: userId,
                amount: aiResult.amount,
                type: aiResult.type || 'expense',
                category: cat as any,
                date: aiResult.date || new Date().toISOString(),
                note: aiResult.description || msg.subject,
                gmail_msg_id: msg.id
              });
            } else {
              // 2. Dự phòng Regex - Cần xác định bankId từ địa chỉ gửi hoặc danh sách đã chọn
              const FROM_BANK_MAP: Record<string, string> = {
                vietcombank: 'vcb',
                techcombank: 'tcb',
                mbbank:      'mb',
                tpbank:      'tpb',
                'acb.com':   'acb',
                'vib.com.vn': 'vib',
                vietinbank: 'ctg',
                bidv:       'bidv',
              };
              
              const matchedBankId = Object.entries(FROM_BANK_MAP).find(([kw]) => 
                msg.from.toLowerCase().includes(kw)
              )?.[1] || selectedBanks[0] || 'vcb';

              const parsed = parseBankEmail(msg.body, matchedBankId);
              if (parsed) {
                regexSuccess++;
                allParsedTransactions.push({
                  user_id: userId,
                  amount: parsed.amount,
                  type: parsed.type,
                  category: 'other',
                  date: parsed.date || new Date().toISOString(),
                  note: parsed.note || msg.subject,
                  gmail_msg_id: msg.id
                });
              }
            }
          } catch (msgErr: any) {
            errors.push(`Filter failed for msg ${msg.id}: ${msgErr.message}`);
          }
        }
      } catch (connErr: any) {
        errors.push(`Connection ${connection.email_address} failed: ${connErr.message}`);
      }
    }

    // --- LỌC TRÙNG LẶP TRƯỚC KHI LƯU ---
    const { data: existing } = await supabaseAdmin
      .from('transactions')
      .select('gmail_msg_id, amount, date, note')
      .eq('user_id', userId);

    const filtered = allParsedTransactions.filter(tx => {
      if (!existing) return true;
      return !existing.some(e => 
        Number(e.amount) === Number(tx.amount) && 
        e.date === tx.date &&
        (e.note || '').includes(tx.note.substring(0, 10))
      );
    }).map(tx => {
      // Bỏ gmail_msg_id vì DB chưa có cột này
      const { gmail_msg_id, ...rest } = tx;
      return rest;
    });

    if (filtered.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('transactions')
        .insert(filtered);
      
      if (insertError) throw insertError;
    }

    // Cập nhật trạng thái sync
    await supabaseAdmin
      .from('data_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      processed: filtered.length,
      totalFound,
      aiSuccess,
      regexSuccess,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: any) {
    console.error('[Sync] Fatal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
