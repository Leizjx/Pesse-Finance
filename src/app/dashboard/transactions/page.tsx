"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, 
  Coffee, ShoppingBag, Zap, ArrowDownLeft, Utensils, CarFront, Smartphone,
  TrendingUp, TrendingDown, X, Banknote, Landmark, HelpCircle, HeartPulse, Home, GraduationCap,
  Trash2
} from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { ConfirmDeleteModal } from '@/components/ai/ConfirmDeleteModal';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { vi } from 'date-fns/locale';

const CATEGORY_META: Record<string, { label: string; icon: any }> = {
  food:          { label: 'Ăn uống',   icon: Coffee },
  transport:     { label: 'Di chuyển', icon: CarFront },
  health:        { label: 'Sức khỏe',  icon: HeartPulse },
  shopping:      { label: 'Mua sắm',   icon: ShoppingBag },
  rent:          { label: 'Nhà ở',     icon: Home },
  education:     { label: 'Học tập',   icon: GraduationCap },
  utilities:     { label: 'Tiện ích',  icon: Zap },
  entertainment: { label: 'Giải trí',  icon: Zap },
  salary:        { label: 'Lương',     icon: ArrowDownLeft },
  investment:    { label: 'Đầu tư',    icon: ArrowDownLeft },
};

function formatDateLabel(dateString: string) {
  try {
    const d = parseISO(dateString);
    if (isToday(d)) return `Hôm nay, ${format(d, 'dd/MM/yyyy')}`;
    if (isYesterday(d)) return `Hôm qua, ${format(d, 'dd/MM/yyyy')}`;
    return format(d, 'dd/MM/yyyy');
  } catch (e) {
    return dateString;
  }
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const { data: transactions = { all: [], totalIncome: 0, totalExpenses: 0 }, isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState<{id: string, amount: number, type: "income" | "expense"} | null>(null);

  const timeOptions = ['Hôm nay', 'Tuần này', 'Tháng này'];
  const categoryOptions = Array.from(new Set(Object.values(CATEGORY_META).map(m => m.label)));

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (!transactions.all) return [];
    
    let filtered = [...transactions.all];

    // Apply Time filter
    if (timeFilter) {
      filtered = filtered.filter(tx => {
        try {
          const d = parseISO(tx.date);
          if (timeFilter === 'Hôm nay') return isToday(d);
          if (timeFilter === 'Tuần này') return isThisWeek(d, { weekStartsOn: 1 });
          if (timeFilter === 'Tháng này') return isThisMonth(d);
        } catch(e) {}
        return true;
      });
    }

    // Apply Category filter
    if (categoryFilter) {
      filtered = filtered.filter(tx => {
         const meta = CATEGORY_META[tx.category] || { label: 'Khác' };
         return meta.label === categoryFilter;
      });
    }
    
    // Sort by date descending globally
    const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const groups: { dateKey: string; displayDate: string; items: any[] }[] = [];
    sorted.forEach((tx) => {
      // Supabase date strings are YYYY-MM-DD
      const dateKey = tx.date; 
      let group = groups.find(g => g.dateKey === dateKey);
      if (!group) {
         group = { dateKey, displayDate: formatDateLabel(dateKey), items: [] };
         groups.push(group);
      }
      group.items.push(tx);
    });
    return groups;
  }, [transactions.all, timeFilter, categoryFilter, sourceFilter]);

  return (
    <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-24 lg:pb-10 relative">
      {/* Header & Actions */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 mt-2">
        <div className="flex items-center justify-between w-full xl:w-auto">
          <h1 className="text-3xl font-bold text-[var(--color-on-surface)]">Giao dịch</h1>
          <div className="flex xl:hidden items-center gap-4">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface)] shrink-0">
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" unoptimized />
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center px-4 py-3 rounded-full neumorphic-pressed w-full md:w-72 flex-1 md:flex-none">
            <Search size={18} className="text-[var(--color-on-surface-variant)] mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Tìm kiếm giao dịch..." 
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]"
            />
          </div>
          
          <motion.button 
            onClick={() => setIsFilterOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0 cursor-pointer"
          >
            <Filter size={18} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0 cursor-pointer"
          >
            <Download size={18} />
          </motion.button>

          <div className="hidden xl:flex items-center gap-4 ml-2">
            <NotificationBell />
            <div className="w-12 h-12 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface)] shrink-0">
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" unoptimized />
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        <div className="neumorphic p-6 rounded-large flex items-center gap-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider block mb-1">Thu nhập tổng cộng</span>
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">{formatCurrency(transactions.totalIncome)}</h2>
          </div>
        </div>
        
        <div className="neumorphic p-6 rounded-large flex items-center gap-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: '#ef444420', color: '#ef4444' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider block mb-1">Chi tiêu tổng cộng</span>
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">{formatCurrency(transactions.totalExpenses)}</h2>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex flex-col gap-8 mt-4">
        {isLoading ? (
           <div className="text-center text-sm font-medium text-[var(--color-on-surface-variant)]">Đang tải...</div>
        ) : groupedTransactions.length === 0 ? (
           <div className="text-center py-10 text-sm font-medium text-[var(--color-on-surface-variant)]">Chưa có giao dịch nào.</div>
        ) : (
          groupedTransactions.map((group, index) => (
            <div key={index} className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider pl-2">
                {group.displayDate}
              </h3>
              
              <div className="neumorphic p-2 rounded-large flex flex-col gap-2">
                {group.items.map((tx) => {
                  const meta = CATEGORY_META[tx.category] || { label: 'Khác', icon: HelpCircle };
                  const Icon = meta.icon;
                  const isIncome = tx.type === 'income';

                  return (
                    <div key={tx.id} className="relative rounded-standard overflow-hidden mb-2">
                       <div className="absolute inset-y-0 right-0 w-full bg-[var(--color-error)] rounded-standard flex items-center justify-end px-6 text-white h-full z-0">
                          <Trash2 size={24} />
                       </div>
                       <motion.div 
                         drag="x"
                         dragConstraints={{ left: 0, right: 0 }}
                         dragElastic={{ left: 0.3, right: 0 }}
                         onDragEnd={(e, info) => {
                           if (info.offset.x < -80) {
                             setDeleteTarget({ id: tx.id, amount: tx.amount, type: tx.type });
                           }
                         }}
                         whileHover={{ scale: 1.01 }}
                         className="flex items-center justify-between p-4 rounded-standard bg-[var(--color-background)] hover:bg-[var(--color-surface)]/80 transition-colors cursor-grab active:cursor-grabbing relative z-10"
                       >
                         <div className="flex items-center gap-4 pointer-events-none">
                           <div className="w-12 h-12 rounded-full neumorphic-pressed flex items-center justify-center text-[var(--color-on-surface-variant)] shrink-0">
                             <Icon size={20} />
                           </div>
                           <div>
                             <h4 className="font-bold text-[var(--color-on-surface)] text-base mb-1">{tx.note || meta.label}</h4>
                             <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-on-surface-variant)]">
                               <span className="bg-[var(--color-surface)] px-2 py-1 rounded-md shadow-sm">{meta.label}</span>
                             </div>
                           </div>
                         </div>
                         
                         <div className={`font-bold text-lg whitespace-nowrap pointer-events-none ${isIncome ? 'text-[#22c55e]' : 'text-[var(--color-on-surface)]'}`}>
                           {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                         </div>
                       </motion.div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && groupedTransactions.length > 0 && (
        <div className="flex justify-center mt-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="neumorphic px-6 py-3 rounded-full text-sm font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          >
            Tải thêm giao dịch
          </motion.button>
        </div>
      )}

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[500px] bg-[var(--color-background)] rounded-[40px] p-8 z-50 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">Bộ lọc Giao dịch</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-4">Theo thời gian</h3>
                  <div className="flex flex-wrap gap-3">
                    {timeOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => setTimeFilter(option)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all cursor-pointer ${
                          timeFilter === option 
                            ? 'bg-[var(--color-primary)] text-[var(--color-on-surface)] shadow-sm' 
                            : 'neumorphic text-[var(--color-on-surface)] hover:bg-[var(--color-surface)]/80'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-4">Theo hạng mục</h3>
                  <div className="flex flex-wrap gap-3">
                    {categoryOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => setCategoryFilter(option)}
                        className={`px-6 py-3 rounded-full text-sm font-bold transition-all cursor-pointer ${
                          categoryFilter === option 
                            ? 'bg-[var(--color-primary)] text-[var(--color-on-surface)] shadow-sm' 
                            : 'neumorphic text-[var(--color-on-surface)] hover:bg-[var(--color-surface)]/80'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-4">Theo nguồn tiền</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSourceFilter('Tiền mặt')}
                      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-bold transition-all cursor-pointer ${
                        sourceFilter === 'Tiền mặt'
                          ? 'bg-[var(--color-primary)] text-[var(--color-on-surface)] shadow-sm'
                          : 'neumorphic text-[var(--color-on-surface)] hover:bg-[var(--color-surface)]/80'
                      }`}
                    >
                      <Banknote size={18} />
                      Tiền mặt
                    </button>
                    <button
                      onClick={() => setSourceFilter('Ngân hàng')}
                      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-bold transition-all cursor-pointer ${
                        sourceFilter === 'Ngân hàng'
                          ? 'bg-[var(--color-primary)] text-[var(--color-on-surface)] shadow-sm'
                          : 'neumorphic text-[var(--color-on-surface)] hover:bg-[var(--color-surface)]/80'
                      }`}
                    >
                      <Landmark size={18} />
                      Ngân hàng
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-4">
                <button 
                  onClick={() => { setTimeFilter(''); setCategoryFilter(''); setSourceFilter(''); }}
                  className="text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors px-4 py-2 order-2 sm:order-1 cursor-pointer"
                >
                  Xóa tất cả
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFilterOpen(false)}
                  className="bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold text-base px-10 py-4 rounded-full shadow-sm w-full sm:w-auto order-1 sm:order-2 cursor-pointer"
                >
                  Áp dụng bộ lọc
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget, {
              onSettled: () => setDeleteTarget(null)
            });
          }
        }}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
