import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, ShoppingBag, Zap,
  Home, HeartPulse, GraduationCap, CarFront, Briefcase, TrendingUp, HelpCircle,
  MoreHorizontal,
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TransactionListProps {
  setActiveTab?: (tab: string) => void;
}

// Icon mapping directly derived from TransactionCategory in database.types.ts
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'food': return Coffee;
    case 'transport': return CarFront;
    case 'entertainment': return Zap;
    case 'health': return HeartPulse;
    case 'education': return GraduationCap;
    case 'shopping': return ShoppingBag;
    case 'utilities': return Zap;
    case 'rent': return Home;
    case 'salary': return Briefcase;
    case 'investment': return TrendingUp;
    default: return HelpCircle;
  }
};

const getCategoryName = (category: string) => {
  switch (category) {
    case 'food': return 'Ăn uống';
    case 'transport': return 'Di chuyển';
    case 'entertainment': return 'Giải trí';
    case 'health': return 'Sức khỏe';
    case 'education': return 'Học tập';
    case 'shopping': return 'Mua sắm';
    case 'utilities': return 'Tiện ích';
    case 'rent': return 'Nhà ở';
    case 'salary': return 'Lương';
    case 'investment': return 'Đầu tư';
    default: return 'Khác';
  }
};

export const TransactionList: React.FC<TransactionListProps> = ({ setActiveTab }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = useTransactions();
  // Get all transactions sorted by date descending (already done by backend via transactionService)
  const transactions = data?.all || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="neumorphic p-6 rounded-large h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg text-on-surface">Giao dịch gần đây</h2>
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2 rounded-full hover:bg-surface/50 transition-colors cursor-pointer"
          >
            <MoreHorizontal size={20} className="text-on-surface-variant" />
          </button>
          
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute top-full right-0 mt-2 w-40 bg-[var(--color-surface)] neumorphic p-2 rounded-2xl z-50 shadow-xl"
              >
                <div className="flex flex-col gap-1">
                  <button className="text-left px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] rounded-xl transition-colors cursor-pointer">Hôm nay</button>
                  <button className="text-left px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] rounded-xl transition-colors cursor-pointer">Theo ngày</button>
                  <button className="text-left px-4 py-2 text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] rounded-xl transition-colors cursor-pointer">Theo tháng</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2">
        {isLoading && (
          <div className="text-sm text-[var(--color-on-surface-variant)] text-center mt-4 animate-pulse">
            Đang tải dữ liệu...
          </div>
        )}
        
        {!isLoading && transactions.length === 0 && (
          <div className="text-sm text-[var(--color-on-surface-variant)] text-center mt-4">
            Chưa có giao dịch nào
          </div>
        )}

        {!isLoading && transactions.map((tx) => {
          const IconComponent = getCategoryIcon(tx.category);
          const displayTitle = tx.note || getCategoryName(tx.category);
          // Format date directly handling ISO strings
          const formattedDate = format(new Date(tx.date), 'dd/MM/yyyy', { locale: vi });
          
          return (
            <motion.div 
              key={tx.id}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-3 rounded-standard neumorphic-pressed gap-2"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0">
                  <IconComponent size={16} />
                </div>
                <div className="overflow-hidden min-w-0">
                  <h4 className="font-medium text-sm text-[var(--color-on-surface)] truncate">{displayTitle}</h4>
                  <p className="text-xs text-[var(--color-on-surface-variant)] truncate">{formattedDate}</p>
                </div>
              </div>
              <span className={`font-bold text-sm whitespace-nowrap shrink-0 ${tx.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-on-surface)]'}`}>
                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} VND
              </span>
            </motion.div>
          );
        })}
      </div>
      
      <button 
        onClick={() => setActiveTab && setActiveTab('transactions')}
        className="w-full mt-4 py-3 rounded-full neumorphic text-sm font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors shrink-0 cursor-pointer"
      >
        Xem tất cả
      </button>
    </div>
  );
};
