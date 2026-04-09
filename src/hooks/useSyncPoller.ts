/**
 * useSyncPoller.ts
 * ─────────────────
 * Hook polling nhẹ: gọi GET /api/sync-status mỗi 10 giây.
 * Khi nhận được state mới → cập nhật Zustand → SyncBanner tự render.
 *
 * Chỉ chạy khi người dùng đang mở Dashboard (mounted).
 */
"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

const POLL_INTERVAL_MS = 10_000; // 10 giây

export function useSyncPoller() {
  const { startSync, updateSyncLog, finishSync } = useAppStore();
  const prevIsSyncing = useRef(false);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/sync-status");
        if (!res.ok) return;

        const data = await res.json() as {
          isSyncing: boolean;
          syncingBanks: string[];
          syncLog: string;
          lastSyncedAt: string | null;
        };

        if (data.isSyncing && !prevIsSyncing.current) {
          // Cron vừa bắt đầu → kích hoạt Banner
          startSync(data.syncingBanks);
        } else if (data.isSyncing && prevIsSyncing.current) {
          // Đang chạy → cập nhật log text
          updateSyncLog(data.syncLog);
        } else if (!data.isSyncing && prevIsSyncing.current) {
          // Cron vừa xong → tắt Banner + cập nhật lastSyncedAt
          finishSync();
        }

        prevIsSyncing.current = data.isSyncing;
      } catch {
        // Silent fail – không crash app nếu polling lỗi
      }
    };

    poll(); // Gọi ngay khi mount
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [startSync, updateSyncLog, finishSync]);
}
