"use client";

import React, { useState } from 'react';
import { MainBalanceCard } from '@/components/ai/MainBalanceCard';
import { BudgetCard } from '@/components/ai/BudgetCard';
import { ExpenseAnalysisCard } from '@/components/ai/ExpenseAnalysisCard';
import { FinancialTipsCard } from '@/components/ai/FinancialTipsCard';
import { UpcomingBillsCard } from '@/components/dashboard/UpcomingBillsCard';
import { TransactionList } from '@/components/ai/TransactionList';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { UserMenu } from '@/components/dashboard/UserMenu';
import dynamic from 'next/dynamic';
const AddTransactionModal = dynamic(() => import('@/components/ai/AddTransactionModal').then(mod => mod.AddTransactionModal), {
  loading: () => null,
});
import { 
  GraduationCap, Zap, HelpCircle, Plus, ShieldCheck, Briefcase, Utensils, Car, TrendingUp,
  HeartPulse, ShoppingBag, Home, RefreshCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBudgets } from '@/hooks/useTransactions';
import { useDataConnections } from '@/hooks/useDataConnections';
import type { LucideIcon } from 'lucide-react';

const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
  food:          { label: 'Ăn uống',   icon: Utensils },
  transport:     { label: 'Di chuyển', icon: Car },
  health:        { label: 'Sức khỏe',  icon: HeartPulse },
  shopping:      { label: 'Mua sắm',   icon: ShoppingBag },
  rent:          { label: 'Nhà ở',     icon: Home },
  education:     { label: 'Học tập',   icon: GraduationCap },
  utilities:     { label: 'Tiện ích',  icon: Zap },
  entertainment: { label: 'Giải trí',  icon: Zap },
  salary:        { label: 'Lương',     icon: Briefcase },
  investment:    { label: 'Đầu tư',    icon: TrendingUp },
  insurance:     { label: 'Bảo hiểm',  icon: ShieldCheck },
  other:         { label: 'Khác',      icon: HelpCircle },
};

export default function DashboardClient() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [greeting, setGreeting] = useState('Chào buổi sáng');
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useAuth();
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
  const { data: connections = [] } = useDataConnections();

  const isAnySyncing = connections.some(c => c.sync_status === 'syncing');

  const setActiveTab = (tab: string) => {
    if (tab === 'dashboard') router.push('/dashboard');
    else router.push(`/dashboard/${tab}`);
  };

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 3 && hour < 11) setGreeting('Chào buổi sáng');
    else if (hour >= 11 && hour < 13) setGreeting('Chào buổi trưa');
    else if (hour >= 13 && hour < 19) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  if (isLoadingUser || !user) {
    return (
      <div className="flex h-full w-full gap-6 p-4">
        <div className="flex-1 space-y-6">
          <div className="h-20 bg-black/10 animate-pulse rounded-full w-full"></div>
          <div className="h-48 bg-black/10 animate-pulse rounded-extra-large w-full"></div>
          <div className="flex gap-6">
            <div className="h-64 bg-black/10 animate-pulse rounded-extra-large flex-1"></div>
            <div className="h-64 bg-black/10 animate-pulse rounded-extra-large flex-1"></div>
          </div>
        </div>
        <div className="w-80 hidden xl:block bg-black/10 animate-pulse rounded-[2rem] h-full"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 md:gap-6">
      <div className="flex-1 flex flex-col gap-4 h-full overflow-y-auto pr-1 sm:pr-2 pb-24 sm:pb-12 relative">
        <header className="flex items-center justify-between neumorphic px-4 sm:px-6 py-3 sm:py-4 rounded-full shrink-0 mx-1">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <span className="text-[var(--color-on-surface-variant)] hidden sm:inline whitespace-nowrap">{greeting},</span>
            <span className="font-bold text-[var(--color-on-surface)] truncate">{user?.full_name || 'Người dùng'}</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>

        {isAnySyncing && (
           <div className="shrink-0 scale-95 md:scale-100 flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-[var(--color-primary)] text-black font-bold text-sm shadow-md animate-pulse">
             <RefreshCcw size={16} className="animate-spin" />
             <span className="tracking-wide uppercase">Đang đồng bộ dữ liệu ngân hàng...</span>
           </div>
        )}

        <div className="shrink-0">
          <MainBalanceCard setActiveTab={setActiveTab} />
        </div>

        {budgetsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
            <div className="neumorphic rounded-standard h-28 animate-pulse" />
            <div className="neumorphic rounded-standard h-28 animate-pulse" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="neumorphic rounded-standard p-6 text-center text-sm text-[var(--color-on-surface-variant)] shrink-0">
            Chưa có ngân sách nào.{' '}
            <button
              onClick={() => router.push('/dashboard/budgets')}
              className="text-[var(--color-primary)] font-semibold underline underline-offset-2 cursor-pointer"
            >
              Tạo ngân sách ngay
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
            {budgets.map((budget) => {
              const meta = CATEGORY_META[budget.category] ?? { label: 'Khác', icon: HelpCircle };
              return (
                <BudgetCard
                  key={budget.id}
                  title={meta.label}
                  spent={budget.spent_amount}
                  total={budget.limit_amount}
                  icon={meta.icon}
                  onClick={() => setActiveTab('budgets')}
                />
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 shrink-0 p-1">
          <ExpenseAnalysisCard />
          <UpcomingBillsCard />
          <div className="flex flex-col gap-3">
            <FinancialTipsCard />
            <motion.button 
              onClick={() => setIsAddModalOpen(true)}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] py-3.5 sm:py-4 rounded-[2rem] shadow-xl flex items-center justify-center gap-2 hover:shadow-[0_15px_30px_rgba(var(--color-primary-rgb),0.2)] transition-all cursor-pointer font-extrabold text-sm sm:text-base"
            >
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Plus size={16} className="stroke-[3]" />
              </div>
              <span>Thêm Chi Tiêu</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="hidden xl:block w-80 shrink-0 h-full">
        <TransactionList setActiveTab={setActiveTab} />
      </div>

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
