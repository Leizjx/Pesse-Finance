/**
 * /api/sync-status
 * ─────────────────
 * Lightweight endpoint dùng để:
 *   GET  → Trả về trạng thái sync hiện tại (isSyncing, log, banks)
 *   POST → Cron Route gọi để cập nhật trạng thái (start / progress / finish)
 *
 * Sử dụng in-memory store đơn giản (phù hợp với single-instance dev).
 * Trên production nên chuyển sang Redis hoặc Supabase Realtime.
 */

let syncState = {
  isSyncing: false,
  syncingBanks: [] as string[],
  syncLog: "",
  lastSyncedAt: null as string | null,
};

export async function GET() {
  return Response.json(syncState);
}

export async function POST(request: Request) {
  // Bảo mật: Chỉ Cron Route nội bộ mới được phép ghi
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json() as {
    action: "start" | "progress" | "finish";
    banks?: string[];
    log?: string;
  };

  if (body.action === "start") {
    syncState = {
      isSyncing: true,
      syncingBanks: body.banks ?? [],
      syncLog: body.log ?? "Đang đồng bộ...",
      lastSyncedAt: syncState.lastSyncedAt,
    };
  } else if (body.action === "progress") {
    syncState = { ...syncState, syncLog: body.log ?? syncState.syncLog };
  } else if (body.action === "finish") {
    syncState = {
      isSyncing: false,
      syncingBanks: [],
      syncLog: "",
      lastSyncedAt: new Date().toISOString(),
    };
  }

  return Response.json({ ok: true, state: syncState });
}
