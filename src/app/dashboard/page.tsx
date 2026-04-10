"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { MainBalanceCard } from '@/components/ai/MainBalanceCard';
import { BudgetCard } from '@/components/ai/BudgetCard';
import { ExpenseAnalysisCard } from '@/components/ai/ExpenseAnalysisCard';
import { FinancialTipsCard } from '@/components/ai/FinancialTipsCard';
import { UpcomingBillsCard } from '@/components/dashboard/UpcomingBillsCard';
import { TransactionList } from '@/components/ai/TransactionList';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { AddTransactionModal } from '@/components/ai/AddTransactionModal';
import { 
  Coffee, CarFront, HeartPulse, ShoppingBag, Home, 
  GraduationCap, Zap, HelpCircle, Plus 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useBudgets } from '@/hooks/useTransactions';
import { useDataConnections } from '@/hooks/useDataConnections';
import { RefreshCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CATEGORY_META: Record<string, { label: string; icon: LucideIcon }> = {
  food:          { label: 'Ăn uống',   icon: Coffee },
  transport:     { label: 'Di chuyển', icon: CarFront },
  health:        { label: 'Sức khỏe',  icon: HeartPulse },
  shopping:      { label: 'Mua sắm',   icon: ShoppingBag },
  rent:          { label: 'Nhà ở',     icon: Home },
  education:     { label: 'Học tập',   icon: GraduationCap },
  utilities:     { label: 'Tiện ích',  icon: Zap },
  entertainment: { label: 'Giải trí',  icon: Zap },
};

export default function DashboardPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [greeting, setGreeting] = useState('Chào buổi sáng');
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isLoadingUser } = useAuth();
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

  // If user profile is not ready or missing, do not render mock data or generic UI
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
    <div className="flex h-full w-full gap-6">
      {/* Center Column: Main Content */}
      <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-32 lg:pb-32 relative">

        {/* Header */}
        <header className="flex items-center justify-between neumorphic px-4 md:px-6 py-4 rounded-full shrink-0">
          <div className="flex items-center gap-2 overflow-hidden mr-2">
            <span className="text-[var(--color-on-surface-variant)] hidden sm:inline whitespace-nowrap">{greeting},</span>
            <span className="font-bold text-[var(--color-on-surface)] truncate">{user?.full_name || 'Người dùng'}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <NotificationBell />
            <button 
              onClick={() => setActiveTab('account')}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface)] shrink-0 cursor-pointer hover:border-[var(--color-primary)] transition-colors"
              title="Cài đặt tài khoản"
            >
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" unoptimized />
            </button>
          </div>
        </header>

        {isAnySyncing && (
           <div className="shrink-0 scale-95 md:scale-100 flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-[var(--color-primary)] text-black font-bold text-sm shadow-md animate-pulse">
             <RefreshCcw size={16} className="animate-spin" />
             <span className="tracking-wide uppercase">Đang đồng bộ dữ liệu ngân hàng...</span>
           </div>
        )}

        {/* Main Balance */}
        <div className="shrink-0">
          <MainBalanceCard setActiveTab={setActiveTab} onAddClick={() => setIsAddModalOpen(true)} />
        </div>

        {/* Budgets — Real Data */}
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

        {/* Bottom Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-[250px]">
          <ExpenseAnalysisCard />
          <UpcomingBillsCard />
          <FinancialTipsCard />
        </div>

        {/* FAB — Desktop */}
        <div className="absolute bottom-8 right-8 z-10 hidden lg:block">
          <motion.button 
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-4 bg-[var(--color-primary)] text-[var(--color-on-surface)] rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition-shadow cursor-pointer font-bold"
            title="Thêm chi tiêu thủ công"
          >
            <Plus size={24} />
            <span>Thêm Chi Tiêu</span>
          </motion.button>
        </div>

        {/* FAB — Mobile */}
        <div className="fixed bottom-24 right-4 z-40 lg:hidden">
          <motion.button 
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 bg-[var(--color-primary)] text-[var(--color-on-surface)] rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition-shadow cursor-pointer font-bold text-sm"
            title="Thêm chi tiêu thủ công"
          >
            <Plus size={20} />
            <span>Thêm Chi Tiêu</span>
          </motion.button>
        </div>
      </div>

      {/* Right Column: Transactions */}
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
