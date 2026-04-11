"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, 
  ShoppingBag, Zap, Utensils, Car, 
  TrendingUp, TrendingDown, X, HelpCircle, HeartPulse, Home, GraduationCap,
  Trash2, ShieldCheck, Briefcase, Crown, ArrowRight, Calendar, Plus, ChevronRight
} from 'lucide-react';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { ConfirmDeleteModal } from '@/components/ai/ConfirmDeleteModal';
import { AddTransactionModal } from '@/components/ai/AddTransactionModal';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import type { Transaction } from '@/types/database.types';

const CATEGORY_META: Record<string, { label: string; icon: any }> = {
  food:          { label: 'Ăn uống',   icon: Utensils },
  transport:     { label: 'Di chuyển', icon: Car },
  entertainment: { label: 'Giải trí',  icon: Zap },
  health:        { label: 'Sức khỏe',  icon: HeartPulse },
  education:     { label: 'Học tập',   icon: GraduationCap },
  shopping:      { label: 'Mua sắm',   icon: ShoppingBag },
  utilities:     { label: 'Tiện ích',  icon: Zap },
  rent:          { label: 'Nhà ở',     icon: Home },
  salary:        { label: 'Lương',     icon: Briefcase },
  investment:    { label: 'Đầu tư',    icon: TrendingUp },
  insurance:     { label: 'Bảo hiểm',  icon: ShieldCheck },
  other:         { label: 'Khác',      icon: HelpCircle },
};

function formatDateLabel(dateString: string) {
  try {
    const d = parseISO(dateString);
    if (isToday(d)) return `Hôm nay, ${format(d, 'dd/MM/yyyy')}`;
    if (isYesterday(d)) return `Hôm qua, ${format(d, 'dd/MM/yyyy')}`;
    return format(d, 'dd/MM/yyyy');
  } catch {
    return dateString;
  }
}

export default function TransactionsClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: transactions = { all: [], totalIncome: 0, totalExpenses: 0 }, isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{id: string, amount: number, type: "income" | "expense"} | null>(null);

  const timeOptions = ['Hôm nay', 'Tuần này', 'Tháng này'];
  const categoryOptions = Array.from(new Set(Object.values(CATEGORY_META).map(m => m.label)));

  const groupedTransactions = useMemo(() => {
    if (!transactions.all) return { groups: [], totalCount: 0 };
    
    let filtered = [...transactions.all];

    if (timeFilter) {
      filtered = filtered.filter(tx => {
        try {
          const d = parseISO(tx.date);
          if (timeFilter === 'Hôm nay') return isToday(d);
          if (timeFilter === 'Tuần này') return isThisWeek(d, { weekStartsOn: 1 });
          if (timeFilter === 'Tháng này') return isThisMonth(d);
        } catch {}
        return true;
      });
    }

    if (categoryFilter) {
      filtered = filtered.filter(tx => {
         const catKey = (tx.category || '').toLowerCase();
         const meta = CATEGORY_META[catKey] || { label: 'Khác' };
         return meta.label === categoryFilter;
      });
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => {
        const catKey = (tx.category || '').toLowerCase();
        const noteMatch = (tx.note || '').toLowerCase().includes(q);
        const categoryMatch = (CATEGORY_META[catKey]?.label || '').toLowerCase().includes(q);
        return noteMatch || categoryMatch;
      });
    }
    
    const sorted = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const paginated = sorted.slice(0, visibleCount);
    
    const groups: { dateKey: string; displayDate: string; items: Transaction[] }[] = [];
    paginated.forEach((tx) => {
      const dateKey = tx.date; 
      let group = groups.find(g => g.dateKey === dateKey);
      if (!group) {
         group = { dateKey, displayDate: formatDateLabel(dateKey), items: [] };
         groups.push(group);
      }
      group.items.push(tx);
    });
    return { groups, totalCount: sorted.length };
  }, [transactions.all, timeFilter, categoryFilter, searchQuery, visibleCount]);

  const { groups: groupedTransactionsList, totalCount } = groupedTransactions;

  return (
    <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-28 lg:pb-10 relative">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 mt-2">
        <div className="flex items-center justify-between w-full xl:w-auto px-1 mt-4 sm:mt-6">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-on-surface)] tracking-tighter">Giao dịch</h1>
          <div className="flex xl:hidden items-center gap-5">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 px-1">
          <div className="flex items-center px-6 py-4 rounded-full neumorphic-pressed w-full md:w-80 flex-1 md:flex-none shadow-inner">
            <Search size={22} className="text-[var(--color-on-surface-variant)] mr-4 shrink-0 stroke-[2.5]" />
            <input 
              type="text" 
              placeholder="Tìm kiếm giao dịch..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-base font-bold w-full text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] placeholder:opacity-50"
            />
          </div>
          
          <motion.button 
            onClick={() => setIsFilterOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Lọc giao dịch"
            className="w-14 h-14 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0 cursor-pointer shadow-md"
          >
            <Filter size={22} className="stroke-[2.5]" />
          </motion.button>

          <motion.button 
            onClick={() => {
              if (user?.plan_type !== 'premium') {
                setIsPremiumModalOpen(true);
                return;
              }
              if (!transactions.all || transactions.all.length === 0) return;
              
              const headers = ["Ngày", "Loại", "Hạng mục", "Số tiền (VND)", "Ghi chú"];
              const rows = transactions.all.map(tx => {
                const catKey = (tx.category || '').toLowerCase();
                const meta = CATEGORY_META[catKey] || { label: 'Khác' };
                return [
                  tx.date,
                  tx.type === 'income' ? 'Thu nhập' : 'Chi tiêu',
                  meta.label,
                  tx.amount.toLocaleString('vi-VN'),
                  (tx.note || '').replace(/,/g, ';') 
                ].join(',');
              });
              
              const csvContent = "\ufeff" + [headers.join(','), ...rows].join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `PesseFinance_GiaoDich_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Tải về CSV"
            className="w-14 h-14 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0 cursor-pointer shadow-md"
          >
            <Download size={22} className="stroke-[2.5]" />
          </motion.button>

          <div className="hidden xl:flex items-center gap-4 ml-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0 px-1 mt-6">
        <div className="neumorphic p-8 rounded-large flex items-center gap-8 border border-white/5 shadow-lg">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: '#22c55e25', color: '#22c55e' }}>
            <TrendingUp size={32} className="stroke-[3]" />
          </div>
          <div>
            <span className="text-xs font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest block mb-2 opacity-60">THU NHẬP TỔNG</span>
            <h2 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">{formatCurrency(transactions.totalIncome)}</h2>
          </div>
        </div>
        
        <div className="neumorphic p-8 rounded-large flex items-center gap-8 border border-white/5 shadow-lg">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: '#ef444425', color: '#ef4444' }}>
            <TrendingDown size={32} className="stroke-[3]" />
          </div>
          <div>
            <span className="text-xs font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest block mb-2 opacity-60">CHI TIÊU TỔNG</span>
            <h2 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">{formatCurrency(transactions.totalExpenses)}</h2>
          </div>
        </div>
      </div>
      </div>

      <motion.div 
        layout
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="flex flex-col gap-8 mt-4"
      >
        {isLoading ? (
           <div className="text-center text-sm font-medium text-[var(--color-on-surface-variant)] animate-pulse">Đang tải...</div>
        ) : groupedTransactionsList.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center gap-4 neumorphic rounded-large">
              <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center text-[var(--color-on-surface-variant)]">
                 <Search size={40} />
              </div>
              <div className="max-w-xs">
                <p className="font-bold text-[var(--color-on-surface)]">Không tìm thấy giao dịch</p>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Hệ thống không tìm thấy giao dịch nào khớp với bộ lọc của bạn.</p>
              </div>
           </div>
        ) : (
          groupedTransactionsList.map((group, index) => (
            <motion.div 
              key={index} 
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 }
              }}
              className="flex flex-col gap-4"
            >
              <h3 className="text-sm font-black text-[var(--color-on-surface-variant)] uppercase tracking-[0.2em] pl-4 opacity-50 mb-4">
                {group.displayDate}
              </h3>
              
              <div className="neumorphic p-2 rounded-large flex flex-col gap-2">
                {group.items.map((tx) => {
                  const catKey = (tx.category || '').toLowerCase();
                  const meta = CATEGORY_META[catKey] || { label: 'Khác', icon: HelpCircle };
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
                         onDragEnd={(_e, info) => {
                           if (info.offset.x < -100) {
                             setDeleteTarget({ id: tx.id, amount: tx.amount, type: tx.type });
                           }
                         }}
                         onTap={() => setSelectedTransaction(tx)}
                         whileHover={{ scale: 1.005, backgroundColor: 'var(--color-surface)' }}
                         className="flex items-center justify-between p-5 sm:p-6 rounded-3xl bg-[var(--color-background)] transition-colors cursor-pointer relative z-10 border border-white/5"
                       >
                         <div className="flex items-center gap-5 pointer-events-none">
                           <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0 shadow-inner">
                             <Icon size={28} className="stroke-[3]" />
                           </div>
                           <div>
                             <h4 className="font-black text-lg sm:text-xl text-[var(--color-on-surface)] tracking-tight mb-1">{tx.note || meta.label}</h4>
                             <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest opacity-60">
                               <span className="bg-[var(--color-surface)] px-2.5 py-1 rounded-md shadow-sm border border-white/5">{meta.label}</span>
                             </div>
                           </div>
                         </div>
                         
                         <div className={`font-black text-xl sm:text-2xl tracking-tighter whitespace-nowrap pointer-events-none ${isIncome ? 'text-[#22c55e]' : 'text-[var(--color-on-surface)]'}`}>
                           {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                         </div>
                       </motion.div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {!isLoading && totalCount > visibleCount && (
        <div className="flex justify-center mt-4 mb-20">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setVisibleCount(prev => prev + 10)}
            className="neumorphic px-8 py-4 rounded-full text-sm font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          >
            Tải thêm giao dịch
          </motion.button>
        </div>
      )}

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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[500px] bg-[var(--color-background)] rounded-[40px] p-8 sm:p-10 z-50 shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-[var(--color-on-surface)] tracking-tighter">Bộ lọc Giao dịch</h2>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Đóng bộ lọc"
                  className="w-12 h-12 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
                >
                  <X size={24} className="stroke-[3]" />
                </button>
              </div>

              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="text-[10px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-[0.2em] mb-6 opacity-60">Theo thời gian</h3>
                  <div className="flex flex-wrap gap-4">
                    {timeOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => setTimeFilter(option)}
                        className={`px-8 py-4 rounded-full text-base font-black transition-all cursor-pointer shadow-sm ${
                          timeFilter === option 
                            ? 'bg-[var(--color-primary)] text-black' 
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
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-6">
                <button 
                  onClick={() => { setTimeFilter(''); setCategoryFilter(''); }}
                  className="text-base font-black text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors px-6 py-3 order-2 sm:order-1 cursor-pointer uppercase tracking-widest opacity-60"
                >
                  Xóa tất cả
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFilterOpen(false)}
                  className="bg-[var(--color-primary)] text-black font-black text-lg px-12 py-5 rounded-full shadow-xl w-full sm:w-auto order-1 sm:order-2 cursor-pointer uppercase tracking-widest border border-white/20"
                >
                  Áp dụng
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <div className="fixed bottom-10 right-10 z-50 hidden lg:block">
        <motion.button 
          onClick={() => setIsAddModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-5 bg-[var(--color-primary)] text-black rounded-full shadow-2xl flex items-center gap-3 hover:shadow-[0_20px_40px_rgba(var(--color-primary-rgb),0.4)] transition-all cursor-pointer font-black text-lg uppercase tracking-widest border border-white/20"
        >
          <Plus size={28} className="stroke-[4]" />
          <span>Thêm Giao Dịch</span>
        </motion.button>
      </div>

      <div className="fixed bottom-32 right-6 z-50 lg:hidden">
        <motion.button 
          onClick={() => setIsAddModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-[var(--color-primary)] text-[var(--color-on-surface)] rounded-2xl shadow-2xl flex items-center justify-center hover:shadow-xl transition-all cursor-pointer"
        >
          <Plus size={28} className="stroke-[3]" />
        </motion.button>
      </div>

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
                <div className="w-20 h-20 rounded-3xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mb-6 shadow-inner">
                  <Crown size={40} className="fill-current" />
                </div>
                
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
                    Nâng cấp ngay <ArrowRight size={18} />
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
        {selectedTransaction && (() => {
          const catKey = (selectedTransaction.category || '').toLowerCase();
          const meta = CATEGORY_META[catKey] || { label: 'Khác', icon: HelpCircle };
          const Icon = meta.icon;
          const isIncome = selectedTransaction.type === 'income';
          const fullDateTime = format(parseISO(selectedTransaction.created_at), "HH:mm, 'Ngày' dd 'Tháng' MM 'Năm' yyyy", { locale: vi });
          
          return (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTransaction(null)}
                className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
              />
              <motion.div 
                initial={{ opacity: 0, y: 60, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 60, scale: 0.97 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[90%] sm:max-w-md bg-[var(--color-surface)] rounded-t-[40px] sm:rounded-[40px] p-8 z-[70] shadow-2xl border-t sm:border border-white/10"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-1.5 bg-black/5 rounded-full mb-8 md:hidden" />
                  
                  <div className="w-20 h-20 rounded-3xl neumorphic flex items-center justify-center mb-6 text-[var(--color-on-surface-variant)]">
                    <Icon size={40} />
                  </div>
                  
                  <span className="text-xs font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-2">
                    {meta.label}
                  </span>
                  
                  <h2 className={`text-4xl font-black mb-8 ${isIncome ? 'text-[#22c55e]' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                  </h2>
                  
                  <div className="w-full space-y-6 mb-10">
                    <div className="flex items-start gap-4 p-4 rounded-2xl neumorphic-pressed">
                      <Calendar size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-wider block mb-1">Thời gian</span>
                        <p className="text-sm font-bold text-[var(--color-on-surface)]">{fullDateTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 rounded-2xl neumorphic-pressed">
                      <HelpCircle size={18} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-[10px] font-black text-[var(--color-on-surface-variant)] uppercase tracking-wider block mb-1">Ghi chú</span>
                        <p className="text-sm font-bold text-[var(--color-on-surface)] leading-relaxed">
                          {selectedTransaction.note || "Không có ghi chú"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTransaction(null)}
                    className="w-full py-4 bg-black/5 hover:bg-black/10 text-[var(--color-on-surface)] font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    Đóng
                  </motion.button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
