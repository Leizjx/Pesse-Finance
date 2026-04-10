"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, ReceiptText, BarChart2, Wallet, Settings, LogOut, Database, Calendar, BotMessageSquare } from 'lucide-react';
import { logoutAction } from '@/app/actions/logout';

const menuItems = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutGrid, label: 'Tổng quan' },
  { id: 'transactions', path: '/dashboard/transactions', icon: ReceiptText, label: 'Giao dịch' },
  { id: 'reports', path: '/dashboard/reports', icon: BarChart2, label: 'Báo cáo' },
  { id: 'budget', path: '/dashboard/budgets', icon: Wallet, label: 'Ngân sách' },
  { id: 'subscriptions', path: '/dashboard/subscriptions', icon: Calendar, label: 'Đăng ký' },
  { id: 'chat', path: '/dashboard/chat', icon: BotMessageSquare, label: 'Chat AI' },
  { id: 'data-connection', path: '/dashboard/data-connection', icon: Database, label: 'Kết nối dữ liệu' },
  { id: 'account', path: '/dashboard/account', icon: Settings, label: 'Cài đặt' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full p-6 flex flex-col justify-between neumorphic rounded-large border border-transparent">
      <div>
        <div className="flex flex-col gap-1 mb-10 px-2">
          <h1 className="font-bold text-2xl text-[var(--color-on-surface)]">Pesse</h1>
          <p className="text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Trải nghiệm số</p>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.id} href={item.path}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-surface)] shadow-sm font-bold'
                      : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface)]/50 font-medium'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </motion.button>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        {/* Premium upgrade card */}
        <div className="neumorphic-pressed p-4 rounded-standard flex flex-col items-center text-center gap-3">
          <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase">Gói thành viên</span>
          <Link href="/dashboard/premium" className="w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full py-2 rounded-full font-bold text-sm shadow-sm transition-colors ${
                pathname === '/dashboard/premium'
                  ? 'bg-[var(--color-on-surface)] text-[var(--color-surface)]'
                  : 'bg-[var(--color-primary)] text-[var(--color-on-surface)]'
              }`}
            >
              Nâng cấp Premium
            </motion.button>
          </Link>
        </div>

        {/* Logout — Server Action for reliable session clearing */}
        <form action={logoutAction}>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 px-4 py-3 rounded-full text-[var(--color-on-surface-variant)] hover:text-red-500 hover:bg-red-500/10 transition-colors w-full cursor-pointer font-medium"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </motion.button>
        </form>
      </div>
    </div>
  );
}
