"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, TrendingUp, TrendingDown, PiggyBank, 
  ShoppingBag, Banknote, Lightbulb, Coffee, CarFront, HeartPulse, Home, GraduationCap, Zap, HelpCircle,
  Download, ChevronLeft, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
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
  salary:        { label: 'Lương',     icon: Banknote, color: '#22c55e' },
  investment:    { label: 'Đầu tư',    icon: TrendingUp, color: '#f59e0b' },
  insurance:     { label: 'Bảo hiểm',  icon: ShieldCheck, color: '#6366f1' },
  other:         { label: 'Khác',      icon: HelpCircle, color: '#9ca3af' },
};

export default function ReportsClient() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const router = useRouter();
  const { data: transactions = { all: [], income: [], expenses: [], totalIncome: 0, totalExpenses: 0 } } = useTransactions();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const filteredTransactionsByDate = useMemo(() => {
    if (!transactions.all) return [];
    return transactions.all.filter(tx => {
      const txDate = parseISO(tx.date);
      return txDate.getMonth() === selectedDate.getMonth() && 
             txDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [transactions.all, selectedDate]);

  const highlightTransactions = useMemo(() => {
    return [...filteredTransactionsByDate]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredTransactionsByDate]);

  const currentMonthStats = useMemo(() => {
    const expenses = filteredTransactionsByDate.filter(tx => tx.type === 'expense');
    const income = filteredTransactionsByDate.filter(tx => tx.type === 'income');
    const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0);

    const expenseByCategory = expenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(expenseByCategory)
      .map(([cat, amount]) => {
        const catKey = cat.toLowerCase();
        const meta = CATEGORY_META[catKey] || { label: cat, icon: HelpCircle, color: '#9ca3af' };
        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
        return {
          name: meta.label,
          percentage: Math.round(percentage),
          color: meta.color,
          amount
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    return { totalExpenses, totalIncome, categoryData, expenses };
  }, [filteredTransactionsByDate]);

  const weeklyData = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const totalDays = end.getDate();
    const weekSize = Math.ceil(totalDays / 4);
    const weeks = [0, 0, 0, 0];
    
    currentMonthStats.expenses.forEach(tx => {
      const txDate = parseISO(tx.date);
      if (isWithinInterval(txDate, { start, end })) {
        const day = txDate.getDate();
        const weekIndex = Math.min(Math.floor((day - 1) / weekSize), 3);
        weeks[weekIndex] += tx.amount;
      }
    });
    
    const maxVal = Math.max(...weeks, 1);
    
    return weeks.map((total, i) => ({
      name: `Tuần ${i + 1}`,
      value: (total / maxVal) * 100,
      amount: total
    }));
  }, [currentMonthStats.expenses, selectedDate]);

  if (isLoadingUser || !user) {
    return (
      <div className="flex-1 flex flex-col gap-6 h-full p-4 animate-pulse pt-8 pr-4">
         <div className="h-20 bg-black/10 rounded-full w-full"></div>
         <div className="h-48 bg-black/10 rounded-[2rem] w-full mt-6"></div>
         <div className="h-64 bg-black/10 rounded-[2rem] w-full mt-6"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto pr-1 sm:pr-2 pb-28 lg:pb-10 relative">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 mt-1 sm:mt-2 mb-2 px-1">
        <div className="flex items-center justify-between w-full xl:w-auto">
          <h1 className="text-xl lg:text-3xl font-black lg:font-extrabold text-[var(--color-on-surface)] tracking-tighter">Báo cáo chi tiết</h1>
          <div className="flex xl:hidden items-center gap-5">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button 
            onClick={() => setIsDatePickerOpen(true)}
            aria-label="Chọn tháng năm báo cáo"
            className="flex items-center gap-3 px-6 lg:px-6 py-3.5 lg:py-3 rounded-full neumorphic text-sm lg:text-base font-black lg:font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-all cursor-pointer shadow-md"
          >
            <Calendar size={20} className="text-[var(--color-primary)]" />
            {format(selectedDate, "'Tháng' MM, yyyy", { locale: vi })}
          </button>
          
          <motion.button 
            onClick={() => {
              if (user?.plan_type !== 'premium') {
                setIsPremiumModalOpen(true);
                return;
              }
              if (!filteredTransactionsByDate.length) return;
              
              const end = endOfMonth(selectedDate);
              const totalDays = end.getDate();
              const weekSize = Math.ceil(totalDays / 4);
              const weeks: any[][] = [[], [], [], []];
              filteredTransactionsByDate.forEach(tx => {
                const day = parseISO(tx.date).getDate();
                const weekIdx = Math.min(Math.floor((day - 1) / weekSize), 3);
                weeks[weekIdx].push(tx);
              });

              const csvRows = ["\ufeffNgày,Loại,Hạng mục,Số tiền (VND),Ghi chú"];
              weeks.forEach((weekTransactions, i) => {
                if (weekTransactions.length === 0) return;
                csvRows.push(`\nTUẦN ${i + 1},,,,`);
                let weekTotal = 0;
                weekTransactions.forEach(tx => {
                  const catKey = (tx.category || '').toLowerCase();
                  const meta = CATEGORY_META[catKey] || { label: 'Khác' };
                  const isIncome = tx.type === 'income';
                  weekTotal += isIncome ? tx.amount : -tx.amount;
                  csvRows.push([
                    format(parseISO(tx.date), 'dd/MM/yyyy'),
                    isIncome ? 'Thu nhập' : 'Chi tiêu',
                    meta.label,
                    tx.amount.toLocaleString('vi-VN'),
                    (tx.note || '').replace(/,/g, ';')
                  ].join(','));
                });
                csvRows.push(`TỔNG TUẦN ${i + 1},,,${weekTotal.toLocaleString('vi-VN')},`);
              });
              
              const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `PesseFinance_BaoCao_Tuan_${format(selectedDate, 'MM_yyyy')}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Tải báo cáo CSV"
            className="w-10 h-10 md:w-12 md:h-12 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0 cursor-pointer"
          >
            <Download size={18} />
          </motion.button>
        </div>
        
        <div className="hidden xl:flex items-center gap-4 ml-2">
          <NotificationBell />
          <UserMenu />
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 shrink-0 px-1">
        <div className="neumorphic p-6 lg:p-7 rounded-large flex flex-col justify-between h-36 lg:h-40">
          <div className="flex justify-between items-start mb-2 lg:mb-4">
            <span className="text-[10px] lg:text-xs font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest opacity-80">Tổng thu nhập</span>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/15 text-green-600 text-[10px] font-black border border-green-500/20">
              <TrendingUp size={10} /> 8%
            </div>
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black lg:font-extrabold text-[var(--color-on-surface)] tracking-tight">{currentMonthStats.totalIncome > 0 ? formatCurrency(currentMonthStats.totalIncome) : '0 ₫'}</h2>
          </div>
        </div>
        
        <div className="neumorphic p-6 lg:p-7 rounded-large flex flex-col justify-between h-36 lg:h-40">
          <div className="flex justify-between items-start mb-2 lg:mb-4">
            <span className="text-[10px] lg:text-xs font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest opacity-80">Tổng chi tiết</span>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 text-red-600 text-[10px] font-black border border-red-500/20">
              <TrendingDown size={10} /> 12%
            </div>
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-black lg:font-extrabold text-[var(--color-on-surface)] tracking-tight">{currentMonthStats.totalExpenses > 0 ? formatCurrency(currentMonthStats.totalExpenses) : '0 ₫'}</h2>
          </div>
        </div>
 
        <div className="bg-[var(--color-primary)] p-6 lg:p-7 rounded-large flex flex-col justify-between shadow-xl relative overflow-hidden h-36 lg:h-40 cursor-pointer">
          <PiggyBank size={80} className="absolute -right-4 -top-4 text-black/10" />
          <div className="relative z-10 w-full">
            <div className="flex justify-between items-start mb-2 lg:mb-4">
               <span className="text-[10px] lg:text-xs font-black text-[var(--color-on-surface)] uppercase tracking-widest block opacity-70">Tiết kiệm</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black lg:font-extrabold text-[var(--color-on-surface)] tracking-tight">
              {formatCurrency(Math.max(0, currentMonthStats.totalIncome - currentMonthStats.totalExpenses))}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
        <div className="lg:col-span-2 neumorphic p-5 sm:p-8 rounded-large flex flex-col mx-1">
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[var(--color-on-surface)]">Phân tích chi tiêu</h3>
              <p className="text-xs sm:text-sm text-[var(--color-on-surface-variant)]">Thống kê theo tuần trong tháng hiện tại</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--color-primary)]"></div>
              <span className="text-[10px] sm:text-xs font-bold text-[var(--color-on-surface-variant)] uppercase">Chi tiêu thực tế</span>
            </div>
          </div>
          
          <div className="flex-1 h-48 mt-4 flex items-end justify-around px-4">
             {weeklyData.map((item, index) => (
               <div key={index} className="flex flex-col items-center gap-4 h-full justify-end group">
                 <div className="w-12 h-full neumorphic-pressed rounded-full relative overflow-hidden flex items-end p-1 cursor-help">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                       {formatCurrency(item.amount)}
                    </div>
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

        <div className="flex flex-col gap-6">
          <div className="neumorphic p-6 rounded-large">
            <h3 className="font-bold text-lg text-[var(--color-on-surface)] mb-6">Danh mục chi tiêu</h3>
            <div className="flex flex-col gap-6">
              {currentMonthStats.categoryData.length > 0 ? currentMonthStats.categoryData.slice(0, 4).map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end text-sm font-black mb-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[var(--color-on-surface)] uppercase tracking-tight">{cat.name}</span>
                      <span className="text-[var(--color-on-surface-variant)] text-xs font-bold opacity-60">{formatCurrency(cat.amount)}</span>
                    </div>
                    <span className="text-[var(--color-on-surface)] text-base">{cat.percentage}%</span>
                  </div>
                  <div className="h-3 w-full neumorphic-pressed rounded-full overflow-hidden">
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

          <div className="neumorphic p-6 rounded-large relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[var(--color-primary)]"></div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] neumorphic flex items-center justify-center shrink-0">
                <Lightbulb size={20} className="text-[var(--color-primary)]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[var(--color-on-surface)] uppercase mb-2">Lời khuyên từ Pesse</h4>
                <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
                  {currentMonthStats.totalExpenses > currentMonthStats.totalIncome 
                    ? `Bạn đang chi tiêu vượt mức thu nhập (${Math.round((currentMonthStats.totalExpenses/currentMonthStats.totalIncome)*100)}%). Hãy cân nhắc giảm bớt các khoản không cần thiết.`
                    : currentMonthStats.totalExpenses > 0 && currentMonthStats.categoryData.length > 0
                      ? `Bạn đang kiểm soát tốt tài chính. Khoản chi lớn nhất là ${currentMonthStats.categoryData[0].name} (${formatCurrency(currentMonthStats.categoryData[0].amount)}).`
                      : 'Bắt đầu ghi chép các giao dịch để nhận được những phân tích tài chính thông minh từ Pesse AI.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="neumorphic p-6 rounded-large flex-1 mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-[var(--color-on-surface)]">Giao dịch nổi bật</h3>
          <button 
            onClick={() => router.push('/dashboard/transactions')}
            className="text-xs font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors uppercase cursor-pointer"
          >
            Xem tất cả
          </button>
        </div>
        
        <div className="w-full">
          <div className="hidden md:grid grid-cols-4 text-xs font-bold text-[var(--color-on-surface-variant)] uppercase mb-4 px-4">
            <div className="col-span-1">Chi tiết</div>
            <div className="col-span-1">Danh mục</div>
            <div className="col-span-1">Ngày</div>
            <div className="col-span-1 text-right">Số tiền</div>
          </div>
          
          <div className="flex flex-col gap-2">
            {highlightTransactions.length === 0 && (
              <div className="text-center py-4 text-sm text-[var(--color-on-surface-variant)]">Chưa có giao dịch nào</div>
            )}
            
            {highlightTransactions.map((tx) => {
              const catKey = (tx.category || '').toLowerCase();
              const meta = CATEGORY_META[catKey] || { label: 'Khác', icon: HelpCircle };
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

      <AnimatePresence>
        {isPremiumModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPremiumModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[var(--color-surface)] rounded-[40px] p-8 z-[70] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <h2 className="text-2xl font-black text-[var(--color-on-surface)] mb-3 tracking-tight">Tính năng Premium</h2>
                <p className="text-[var(--color-on-surface-variant)] font-medium mb-8 leading-relaxed">
                  Tính năng <span className="text-[var(--color-on-surface)] font-bold">Xuất báo cáo chuyên nghiệp</span> chỉ dành cho thành viên Premium. Hãy nâng cấp để tận hưởng trọn vẹn sức mạnh Pesse.
                </p>
                <div className="flex flex-col w-full gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/premium')}
                    className="w-full bg-[var(--color-primary)] text-black font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    Nâng cấp ngay
                  </motion.button>
                  <button 
                    onClick={() => setIsPremiumModalOpen(false)}
                    className="w-full py-4 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
                  >
                    Để sau
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDatePickerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDatePickerOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-sm bg-[var(--color-background)] rounded-[40px] p-8 z-[70] shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-10">
                <button 
                  onClick={() => setSelectedDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth()))}
                  className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-2xl font-black text-[var(--color-on-surface)]">{selectedDate.getFullYear()}</h2>
                <button 
                  onClick={() => setSelectedDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth()))}
                  className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date(selectedDate.getFullYear(), i);
                  const isSelected = selectedDate.getMonth() === i;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedDate(date);
                        setIsDatePickerOpen(false);
                      }}
                      className={`py-4 rounded-2xl text-sm font-bold transition-all ${
                        isSelected 
                          ? 'bg-[var(--color-primary)] text-black shadow-lg scale-105' 
                          : 'neumorphic text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10'
                      }`}
                    >
                      Tháng {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-center">
                 <button 
                  onClick={() => {
                    setSelectedDate(new Date());
                    setIsDatePickerOpen(false);
                  }}
                  className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors"
                 >
                   Về tháng hiện tại
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
