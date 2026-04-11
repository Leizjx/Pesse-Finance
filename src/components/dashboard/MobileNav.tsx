"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, ReceiptText, Wallet, Database, BotMessageSquare, BarChart2 } from 'lucide-react';

const mobileMenuItems = [
  { id: 'dashboard',       path: '/dashboard',                icon: LayoutGrid,       label: 'Tổng quan' },
  { id: 'transactions',    path: '/dashboard/transactions',   icon: ReceiptText,      label: 'Giao dịch' },
  { id: 'reports',         path: '/dashboard/reports',        icon: BarChart2,        label: 'Báo cáo'   },
  { id: 'chat',            path: '/dashboard/chat',           icon: BotMessageSquare, label: 'Chat AI'   },
  { id: 'budget',          path: '/dashboard/budgets',        icon: Wallet,           label: 'Ngân sách' },
  { id: 'data-connection', path: '/dashboard/data-connection',icon: Database,         label: 'Dữ liệu'   },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)]/80 backdrop-blur-lg border-t border-white/20 p-4 pb-safe z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center w-full relative">
        {mobileMenuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.id} href={item.path} className="relative flex flex-col items-center justify-center flex-1 h-12 cursor-pointer transition-all">
              {isActive && (
                <motion.div
                  layoutId="mobile-active-tab"
                  className="absolute inset-x-1 inset-y-0.5 bg-[var(--color-primary)] rounded-2xl shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className={`relative z-10 flex flex-col items-center gap-0.5 transition-colors ${isActive ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                <item.icon size={isActive ? 18 : 20} />
                <span className={`text-[8px] sm:text-[9px] font-bold ${isActive ? 'opacity-100' : 'opacity-80'}`}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
