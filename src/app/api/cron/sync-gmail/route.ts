import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { parseBankEmail } from '@/lib/parsers/bankRegex';

// =========================================================================
// HELPER: Gọi /api/sync-status để cập nhật trạng thái Banner trên UI
// =========================================================================
async function updateStatus(
  action: 'start' | 'progress' | 'finish',
  payload?: { banks?: string[]; log?: string }
) {
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
  } catch {
    // Non-blocking – không để lỗi này crash Cron
  }
}

// =========================================================================
// KHỞI TẠO CLIENTS
// =========================================================================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Map bank ID → tên hiển thị tiếng Việt
const BANK_DISPLAY_NAME: Record<string, string> = {
  vcb: 'Vietcombank',
  tcb: 'Techcombank',
  mb: 'MB Bank',
  tpb: 'TPBank',
  acb: 'ACB',
};

// Map bank ID → Gmail query
const BANK_QUERY_MAP: Record<string, string> = {
  vcb: '(from:vietcombank.com.vn ("biến động số dư" OR "Biên lai chuyển tiền"))',
  tcb: '(from:techcombank.com.vn ("biến động số dư" OR "thông báo giao dịch"))',
  mb:  '(from:mbbank.com.vn ("thông báo biến động số dư"))',
  tpb: '(from:tpbank.vn ("biến động tài khoản"))',
  acb: '(from:acb.com.vn ("thông báo giao dịch ACB"))',
};

// Map From header keyword → bank ID (để nhận diện sau khi fetch)
const FROM_BANK_MAP: Record<string, string> = {
  vietcombank: 'vcb',
  techcombank: 'tcb',
  mbbank:      'mb',
  tpbank:      'tpb',
  'acb.com':   'acb',
};

export async function GET(request: Request) {
  // Bảo mật: Vercel Cron / gọi thủ công cần Authorization header
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // ── Bước 1: Thông báo UI bắt đầu sync ─────────────────────────────────
  await updateStatus('start', { banks: [], log: 'Đang chuẩn bị đồng bộ...' });

  try {
    // ── Bước 2: Lấy danh sách kết nối active từ DB ─────────────────────
    const { data: connections, error } = await supabaseAdmin
      .from('data_connections')
      .select('id, user_id, email_address, selected_banks, provider_refresh_token')
      .eq('sync_status', 'active');

    if (error) throw error;
    if (!connections || connections.length === 0) {
      await updateStatus('finish');
      return NextResponse.json({ message: 'Không có kết nối active nào' });
    }

    const allNewTransactions: object[] = [];

    for (const connection of connections) {
      const selectedBanks = (connection.selected_banks as string[]) ?? [];
      if (selectedBanks.length === 0) continue;

      // ── Bước 3: Cập nhật Banner với danh sách ngân hàng sẽ quét ───────
      await updateStatus('start', {
        banks: selectedBanks,
        log:   `Đang quét ${(BANK_DISPLAY_NAME[selectedBanks[0]] ?? selectedBanks[0].toUpperCase())}...`,
      });

      // ── Bước 4: Xây dựng Dynamic Gmail Query ──────────────────────────
      const queryParts = selectedBanks
        .filter(id => BANK_QUERY_MAP[id])
        .map(id => BANK_QUERY_MAP[id]);

      if (queryParts.length === 0) continue;
      const gmailQuery = `{ ${queryParts.join(' ')} }`;

      // ── Bước 5: Kết nối Gmail API ──────────────────────────────────────
      oauth2Client.setCredentials({ refresh_token: connection.provider_refresh_token });
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const listRes = await gmail.users.messages.list({
        userId: 'me',
        q: gmailQuery,
        maxResults: 50,
      });

      const messages = listRes.data.messages ?? [];
      if (messages.length === 0) continue;

      // ── Bước 6: Fetch và Parse từng email ─────────────────────────────
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (!msg.id) continue;

        // Lấy chi tiết email
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full',
        });

        const payload = detail.data.payload;
        let body = '';
        if (payload?.parts) {
          const part = payload.parts.find(
            p => p.mimeType === 'text/plain' || p.mimeType === 'text/html'
          );
          if (part?.body?.data) body = Buffer.from(part.body.data, 'base64').toString('utf8');
        } else if (payload?.body?.data) {
          body = Buffer.from(payload.body.data, 'base64').toString('utf8');
        }

        // Xác định ngân hàng từ From header
        const fromHeader = (payload?.headers ?? []).find(h => h.name === 'From')?.value ?? '';
        const matchedBankId = Object.entries(FROM_BANK_MAP).find(([keyword]) =>
          fromHeader.toLowerCase().includes(keyword)
        )?.[1];

        if (!matchedBankId || !selectedBanks.includes(matchedBankId)) continue;

        // Cập nhật log khi chuyển sang bank khác trong batch
        if (i > 0 && i % 5 === 0) {
          const bankName = BANK_DISPLAY_NAME[matchedBankId] ?? matchedBankId.toUpperCase();
          await updateStatus('progress', { log: `Đang phân tích email ${bankName} (${i + 1}/${messages.length})...` });
        }

        // Parse bằng Regex
        const parsed = parseBankEmail(body, matchedBankId);
        if (parsed && parsed.amount && parsed.type) {
          allNewTransactions.push({
            user_id:  connection.user_id,
            amount:   parsed.amount,
            type:     parsed.type,
            category: parsed.category ?? 'other',
            note:     parsed.note ?? null,
            date:     new Date().toISOString().split('T')[0], // YYYY-MM-DD
          });
        }
      }
    }

    // ── Bước 7: Bulk insert vào Supabase ──────────────────────────────────
    if (allNewTransactions.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('transactions')
        .insert(allNewTransactions);
      if (insertError) console.error('Insert error:', insertError);
      // Supabase Realtime sẽ tự động push event xuống Frontend
    }

    // ── Bước 8: Thông báo UI hoàn tất ────────────────────────────────────
    await updateStatus('finish');

    return NextResponse.json({ success: true, processed: allNewTransactions.length });

  } catch (error) {
    console.error('Cron sync-gmail error:', error);
    await updateStatus('finish'); // Luôn tắt Banner dù có lỗi
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
