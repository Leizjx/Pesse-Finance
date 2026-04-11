import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coffee, ShoppingBag, Zap,
  Home, HeartPulse, GraduationCap, CarFront, Briefcase, TrendingUp, HelpCircle,
  MoreHorizontal
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { format, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';
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
  const [timeFilter, setTimeFilter] = useState<'Tất cả' | 'Hôm nay' | 'Theo ngày' | 'Theo tháng'>('Tất cả');
  const filterRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = useTransactions();
  const transactionsRaw = data?.all || [];

  const transactions = React.useMemo(() => {
    if (timeFilter === 'Tất cả') return transactionsRaw;
    return transactionsRaw.filter(tx => {
      try {
        const d = parseISO(tx.date);
        if (timeFilter === 'Hôm nay') return isToday(d);
        if (timeFilter === 'Theo ngày') return isThisWeek(d, { weekStartsOn: 1 });
        if (timeFilter === 'Theo tháng') return isThisMonth(d);
      } catch {
        return true;
      }
      return true;
    });
  }, [transactionsRaw, timeFilter]);

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
      <div className="flex justify-between items-center mb-10">
        <h2 className="font-black text-xl text-[var(--color-on-surface)] tracking-tight">
          Giao dịch {timeFilter !== 'Tất cả' ? `(${timeFilter})` : 'gần đây'}
        </h2>
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-3 rounded-full hover:bg-[var(--color-surface)]/50 transition-colors cursor-pointer neumorphic shadow-inner"
          >
            <MoreHorizontal size={24} className="text-[var(--color-on-surface-variant)]" />
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
                  {(['Tất cả', 'Hôm nay', 'Theo ngày', 'Theo tháng'] as const).map(option => (
                    <button 
                      key={option}
                      onClick={() => { setTimeFilter(option); setIsFilterOpen(false); }}
                      className={`text-left px-4 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                        timeFilter === option 
                          ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' 
                          : 'text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <motion.div 
        layout
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
        className="flex flex-col gap-4 overflow-y-auto flex-1 pr-2"
      >
        {isLoading && (
          <div className="text-sm text-[var(--color-on-surface-variant)] text-center mt-4 animate-pulse">
            Đang tải dữ liệu...
          </div>
        )}
        
        {!isLoading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] opacity-40">
              <HelpCircle size={32} />
            </div>
            <p className="text-sm text-[var(--color-on-surface-variant)] max-w-[200px]">
              Chưa có giao dịch nào trong khoảng thời gian này
            </p>
          </div>
        )}

        {!isLoading && transactions.map((tx) => {
          const IconComponent = getCategoryIcon(tx.category);
          const displayTitle = tx.note || getCategoryName(tx.category);
          const formattedDate = format(new Date(tx.date), 'dd/MM/yyyy', { locale: vi });
          
          return (
            <motion.div 
              key={tx.id}
              variants={{
                hidden: { opacity: 0, x: -10 },
                visible: { opacity: 1, x: 0 }
              }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-4 rounded-standard neumorphic-pressed gap-4 border border-transparent hover:border-[var(--color-primary)]/10 transition-all"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0 shadow-sm">
                  <IconComponent size={22} className="stroke-[2.5]" />
                </div>
                <div className="overflow-hidden min-w-0">
                  <h4 className="font-black text-base text-[var(--color-on-surface)] truncate tracking-tight mb-0.5">{displayTitle}</h4>
                  <p className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-70 uppercase tracking-widest">{formattedDate}</p>
                </div>
              </div>
              <span className={`font-black text-base whitespace-nowrap shrink-0 ${tx.type === 'income' ? 'text-[var(--color-success)]' : 'text-[var(--color-on-surface)]'}`}>
                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} <span className="text-[10px] opacity-50 uppercase">VND</span>
              </span>
            </motion.div>
          );
        })}
      </motion.div>
      
      <button 
        onClick={() => setActiveTab && setActiveTab('transactions')}
        className="w-full mt-6 py-4 rounded-full neumorphic text-base font-black text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-all shrink-0 cursor-pointer shadow-md uppercase tracking-widest"
      >
        Xem tất cả
      </button>
    </div>
  );
};
