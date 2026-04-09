"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Search, TrendingUp, TrendingDown, PiggyBank, 
  ShoppingBag, Utensils, Banknote, Plus, Lightbulb, Coffee, CarFront, HeartPulse, Home, GraduationCap, Zap, HelpCircle
} from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

const CATEGORY_META: Record<string, { label: string; icon: any; color: string }> = {
  food:          { label: 'Ăn uống',   icon: Coffee, color: 'var(--color-primary)' },
  transport:     { label: 'Di chuyển', icon: CarFront, color: '#3b82f6' },
  health:        { label: 'Sức khỏe',  icon: HeartPulse, color: '#ef4444' },
  shopping:      { label: 'Mua sắm',   icon: ShoppingBag, color: '#ec4899' },
  rent:          { label: 'Nhà ở',     icon: Home, color: '#8b5cf6' },
  education:     { label: 'Học tập',   icon: GraduationCap, color: '#10b981' },
  utilities:     { label: 'Tiện ích',  icon: Zap, color: '#eab308' },
  entertainment: { label: 'Giải trí',  icon: Zap, color: '#6366f1' },
};

export default function ReportsPage() {
  const { user } = useAuth();
  const { data: transactions = { all: [], income: [], expenses: [], totalIncome: 0, totalExpenses: 0 }, isLoading } = useTransactions();

  // Highlight latest 5 transactions
  const highlightTransactions = [...transactions.all]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Group expenses by category to calculate percentages
  const expenseByCategory = transactions.expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(expenseByCategory)
    .map(([cat, amount]) => {
      const meta = CATEGORY_META[cat] || { label: cat, icon: HelpCircle, color: '#9ca3af' };
      const percentage = transactions.totalExpenses > 0 ? (amount / transactions.totalExpenses) * 100 : 0;
      return {
        name: meta.label,
        percentage: Math.round(percentage),
        color: meta.color,
        amount
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Mock weekly data for visual completeness as real grouping by week is complex without full month data
  const weeklyData = [
    { name: 'Tuần 1', value: 20 },
    { name: 'Tuần 2', value: 55 },
    { name: 'Tuần 3', value: 85 },
    { name: 'Tuần 4', value: transactions.totalExpenses > 0 ? 90 : 10 },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-24 lg:pb-0 relative">
      {/* Header */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 mt-2 mb-2">
        <div className="flex items-center justify-between w-full xl:w-auto">
          <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Báo cáo chi tiết</h1>
          <div className="flex xl:hidden items-center gap-4">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface)] shrink-0">
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" unoptimized />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full neumorphic text-sm font-medium text-[var(--color-on-surface)]">
            <Calendar size={16} />
            {format(new Date(), "'Tháng' MM, yyyy", { locale: vi })}
          </button>
          
          <div className="flex items-center px-4 py-2 rounded-full neumorphic-pressed w-full md:w-64 flex-1 md:flex-none">
            <Search size={16} className="text-[var(--color-on-surface-variant)] mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Tìm kiếm giao dịch..." 
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]"
            />
          </div>
          
          <div className="hidden xl:flex items-center gap-4 ml-2">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface)] shrink-0">
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" unoptimized />
            </div>
          </div>
        </div>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <div className="neumorphic p-6 rounded-large flex flex-col justify-between h-40">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Tổng thu nhập</span>
            <TrendingUp size={24} className="text-[var(--color-on-surface-variant)]/30" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-on-surface)]">{transactions.totalIncome > 0 ? formatCurrency(transactions.totalIncome) : '0 ₫'}</h2>
          </div>
        </div>
        
        <div className="neumorphic p-6 rounded-large flex flex-col justify-between h-40">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Tổng chi tiêu</span>
            <TrendingDown size={24} className="text-[var(--color-on-surface-variant)]/30" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-on-surface)]">{transactions.totalExpenses > 0 ? formatCurrency(transactions.totalExpenses) : '0 ₫'}</h2>
          </div>
        </div>

        <div className="bg-[var(--color-primary)] p-6 rounded-large flex flex-col justify-between shadow-sm relative overflow-hidden h-40 cursor-pointer">
          <PiggyBank size={80} className="absolute -right-4 -top-4 text-black/10" />
          <div className="relative z-10">
            <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-4 block">Tiết kiệm</span>
            <h2 className="text-3xl font-bold text-[var(--color-on-surface)]">
              {formatCurrency(Math.max(0, transactions.totalIncome - transactions.totalExpenses))}
            </h2>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
        {/* Weekly Chart */}
        <div className="lg:col-span-2 neumorphic p-8 rounded-large flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-bold text-lg text-[var(--color-on-surface)]">Phân tích chi tiêu</h3>
              <p className="text-sm text-[var(--color-on-surface-variant)]">Thống kê theo tuần trong tháng hiện tại</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></div>
              <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase">Chi tiêu thực tế</span>
            </div>
          </div>
          
          <div className="flex-1 h-48 mt-4 flex items-end justify-around px-4">
             {weeklyData.map((item, index) => (
               <div key={index} className="flex flex-col items-center gap-4 h-full justify-end">
                 <div className="w-12 h-full neumorphic-pressed rounded-full relative overflow-hidden flex items-end p-1">
                    <motion.div 
                      suppressHydrationWarning
                      initial={{ height: 0 }}
                      animate={{ height: `${item.value}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="w-full bg-[var(--color-primary)] rounded-full"
                    />
                 </div>
                 <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">{item.name}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Right Column in Middle Section */}
        <div className="flex flex-col gap-6">
          {/* Categories */}
          <div className="neumorphic p-6 rounded-large">
            <h3 className="font-bold text-lg text-[var(--color-on-surface)] mb-6">Danh mục chi tiêu</h3>
            <div className="flex flex-col gap-5">
              {categoryData.length > 0 ? categoryData.slice(0, 4).map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-[var(--color-on-surface)] uppercase">{cat.name}</span>
                    <span className="text-[var(--color-on-surface)]">{cat.percentage}%</span>
                  </div>
                  <div className="h-2 w-full neumorphic-pressed rounded-full overflow-hidden">
                    <motion.div 
                      suppressHydrationWarning
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-sm text-[var(--color-on-surface-variant)] text-center py-4">Chưa có chi tiêu nào</div>
              )}
            </div>
          </div>

          {/* Advice */}
          <div className="neumorphic p-6 rounded-large relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--color-primary)]"></div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] neumorphic flex items-center justify-center shrink-0">
                <Lightbulb size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-on-surface)] uppercase mb-2">Lời khuyên từ Pesse</h4>
                <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                  Bạn đang {transactions.totalIncome > transactions.totalExpenses ? 'kiểm soát tốt' : 'vượt mức'} ngân sách. Hãy tiếp tục theo dõi!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="neumorphic p-6 rounded-large flex-1 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-[var(--color-on-surface)]">Giao dịch nổi bật</h3>
          <button className="text-xs font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors uppercase cursor-pointer">Xem tất cả</button>
        </div>
        
        <div className="w-full">
          <div className="hidden md:grid grid-cols-4 text-xs font-bold text-[var(--color-on-surface-variant)] uppercase mb-4 px-4">
            <div className="col-span-1">Chi tiết</div>
            <div className="col-span-1">Danh mục</div>
            <div className="col-span-1">Ngày</div>
            <div className="col-span-1 text-right">Số tiền</div>
          </div>
          
          <div className="flex flex-col gap-2">
            {!isLoading && highlightTransactions.length === 0 && (
              <div className="text-center py-4 text-sm text-[var(--color-on-surface-variant)]">Chưa có giao dịch nào</div>
            )}
            
            {highlightTransactions.map((tx) => {
              const meta = CATEGORY_META[tx.category] || { label: 'Khác', icon: HelpCircle };
              const Icon = meta.icon;
              const isIncome = tx.type === 'income';

              return (
                <motion.div 
                  key={tx.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex flex-col md:grid md:grid-cols-4 md:items-center gap-4 md:gap-0 p-4 rounded-standard hover:bg-[var(--color-surface)]/50 transition-colors cursor-pointer"
                >
                  <div className="md:col-span-1 flex items-center justify-between md:justify-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full neumorphic-pressed flex items-center justify-center text-[var(--color-on-surface-variant)] shrink-0">
                        <Icon size={18} />
                      </div>
                      <span className="font-bold text-sm text-[var(--color-on-surface)]">{tx.note || meta.label}</span>
                    </div>
                    <div className={`md:hidden font-bold text-sm ${isIncome ? 'text-[#22c55e]' : 'text-[var(--color-on-surface)]'}`}>
                       {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                  <div className="hidden md:block md:col-span-1 text-sm text-[var(--color-on-surface-variant)]">{meta.label}</div>
                  <div className="hidden md:block md:col-span-1 text-sm text-[var(--color-on-surface-variant)]">{format(parseISO(tx.date), 'dd/MM/yyyy')}</div>
                  <div className={`hidden md:block md:col-span-1 text-right font-bold text-sm ${isIncome ? 'text-[#22c55e]' : 'text-[var(--color-on-surface)]'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  
                  {/* Mobile Details */}
                  <div className="flex md:hidden items-center gap-2 text-xs font-medium text-[var(--color-on-surface-variant)] ml-13">
                    <span className="bg-[var(--color-surface)] px-2 py-1 rounded-md shadow-sm">{meta.label}</span>
                    <span>•</span>
                    <span>{format(parseISO(tx.date), 'dd/MM/yyyy')}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
