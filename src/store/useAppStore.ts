/**
 * useAppStore.ts
 * --------------
 * Zustand global state store for Pesse Finance.
 *
 * Holds:
 * - Current authenticated user profile
 * - Total balance (updated optimistically on transaction changes)
 *
 * This is the single source of truth for user state.
 * Synced with Supabase auth via useAuth hook.
 */

import { create } from "zustand";
import type { Profile } from "@/types/database.types";

interface AppState {
  // ── User ─────────────────────────────────
  user: Profile | null;
  isAuthenticated: boolean;
  isLoadingUser: boolean;
  isInitialized: boolean;

  // ── Balance ──────────────────────────────
  totalBalance: number;

  // ── UI State ─────────────────────────────
  sidebarOpen: boolean;

  // ── Gmail Sync State ─────────────────────
  isSyncing: boolean;          // true khi Cron đang chạy
  syncingBanks: string[];      // Danh sách bank đang quét VD: ['vcb', 'tcb']
  syncLog: string;             // Thông báo hiện tại: 'Đang quét VCB...'
  lastSyncedAt: Date | null;   // Thời điểm đồng bộ gần nhất

  // ── Actions ──────────────────────────────
  setUser: (user: Profile | null) => void;
  setLoadingUser: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  updateBalance: (delta: number) => void;
  setBalance: (balance: number) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  reset: () => void;
  // Sync actions
  startSync: (banks: string[]) => void;
  updateSyncLog: (log: string) => void;
  finishSync: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoadingUser: true,
  isInitialized: false,
  totalBalance: 0,
  sidebarOpen: true,
  isSyncing: false,
  syncingBanks: [] as string[],
  syncLog: '',
  lastSyncedAt: null as Date | null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      totalBalance: user?.total_balance ?? 0,
      isInitialized: true,
    }),

  setLoadingUser: (loading) => set({ isLoadingUser: loading }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),

  updateBalance: (delta) =>
    set((state) => ({ totalBalance: state.totalBalance + delta })),

  setBalance: (balance) => set({ totalBalance: balance }),

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  reset: () => set(initialState),

  // Gọi khi Cron bắt đầu – nhận danh sách bank sẽ quét
  startSync: (banks) =>
    set({
      isSyncing: true,
      syncingBanks: banks,
      syncLog: banks.length > 0 ? `Đang quét ${banks[0].toUpperCase()}...` : 'Đang đồng bộ...',
    }),

  // Cập nhật thông báo khi chuyển sang bank tiếp theo
  updateSyncLog: (log) => set({ syncLog: log }),

  // Gọi khi Cron hoàn thành
  finishSync: () =>
    set({
      isSyncing: false,
      syncingBanks: [],
      syncLog: '',
      lastSyncedAt: new Date(),
    }),
}));
