"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, ReceiptText, Wallet, Database, BotMessageSquare } from 'lucide-react';

const mobileMenuItems = [
  { id: 'dashboard',    path: '/dashboard',                icon: LayoutGrid,  label: 'Tổng quan' },
  { id: 'transactions', path: '/dashboard/transactions',   icon: ReceiptText, label: 'Giao dịch' },
  { id: 'chat',         path: '/dashboard/chat',           icon: BotMessageSquare, label: 'Chat AI' },
  { id: 'budget',       path: '/dashboard/budgets',        icon: Wallet,      label: 'Ngân sách' },
  { id: 'account',      path: '/dashboard/account',        icon: Database,    label: 'Cài đặt'   },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)]/80 backdrop-blur-lg border-t border-white/20 p-4 pb-safe z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto relative">
        {mobileMenuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.id} href={item.path} className="relative flex flex-col items-center justify-center w-14 h-14 cursor-pointer">
              {isActive && (
                <motion.div
                  layoutId="mobile-active-tab"
                  className="absolute inset-0 bg-[var(--color-primary)] rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <div className={`relative z-10 flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                <item.icon size={isActive ? 22 : 24} className={isActive ? 'mb-0.5' : ''} />
                {isActive && <span className="text-[10px] font-bold">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
