/**
 * TopNav.tsx — Dashboard Top Navigation Bar
 * ------------------------------------------
 * Client Component: hamburger toggle, page title, notification area.
 */

"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tổng quan",
  "/dashboard/transactions": "Giao dịch",
  "/dashboard/budgets": "Ngân sách",
  "/dashboard/settings": "Cài đặt",
};

export function TopNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useAppStore();

  const title = PAGE_TITLES[pathname] ?? "Dashboard";

  return (
    <header
      className="flex items-center justify-between px-6 h-16 flex-shrink-0"
      style={{
        background: "var(--neu-surface)",
        borderBottom: "1px solid var(--neu-border)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] transition-all duration-200 cursor-pointer"
          style={{ boxShadow: "var(--shadow-flat)", background: "var(--neu-bg)" }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-float)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-flat)"; }}
          onMouseDown={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-pressed)"; }}
          onMouseUp={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-flat)"; }}
          aria-label="Toggle sidebar"
          id="topnav-toggle"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right: date + avatar placeholder */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--text-muted)] hidden sm:block">
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>

        {/* Notification bell */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] transition-all duration-200 cursor-pointer relative"
          style={{ boxShadow: "var(--shadow-flat)", background: "var(--neu-bg)" }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-float)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-flat)"; }}
          aria-label="Thông báo"
          id="topnav-notifications"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}
