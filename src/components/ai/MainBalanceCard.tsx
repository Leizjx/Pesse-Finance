import React from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useTransactions } from '@/hooks/useTransactions';

interface MainBalanceCardProps {
  setActiveTab: (tab: string) => void;
  onAddClick?: () => void;
}

export const MainBalanceCard: React.FC<MainBalanceCardProps> = ({ setActiveTab, onAddClick }) => {
  const { totalBalance, isLoadingUser } = useAppStore();
  const { data: transactionsData } = useTransactions();

  const comparisonData = React.useMemo(() => {
    if (!transactionsData || !transactionsData.all) return null;

    const now = new Date();
    const currMonth = now.getMonth();
    const currYear = now.getFullYear();
    const lastMonth = currMonth === 0 ? 11 : currMonth - 1;
    const lastMonthYear = currMonth === 0 ? currYear - 1 : currYear;

    let netThisMonth = 0;
    let netLastMonth = 0;

    transactionsData.all.forEach(t => {
      const d = new Date(t.date);
      const val = t.type === 'income' ? t.amount : -t.amount;
      if (d.getMonth() === currMonth && d.getFullYear() === currYear) {
        netThisMonth += val;
      } else if (d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
        netLastMonth += val;
      }
    });

    if (netLastMonth === 0) {
      // If no data last month, just show flat growth
      return { 
        percent: 100, 
        isPositive: netThisMonth >= 0,
        text: `Tháng này: ${netThisMonth >= 0 ? '+' : ''}${netThisMonth.toLocaleString('vi-VN')} đ` 
      };
    }

    const diff = netThisMonth - netLastMonth;
    const percent = (diff / Math.abs(netLastMonth)) * 100;
    const isPositive = diff >= 0;

    return {
      percent,
      isPositive,
      text: `${isPositive ? '+' : ''}${percent.toFixed(1)}% so với tháng trước`
    };
  }, [transactionsData]);

  return (
    <div className="neumorphic p-8 rounded-large flex flex-col justify-between h-full w-full">
      <div>
        <p className="text-[var(--color-on-surface-variant)] font-medium mb-2">Tổng số dư hiện tại</p>
        
        {isLoadingUser ? (
          <div className="h-[48px] w-64 bg-[var(--color-surface)] neumorphic-pressed rounded-xl animate-pulse mb-4"></div>
        ) : (
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-on-surface)] mb-4 truncate">
            {totalBalance.toLocaleString('vi-VN')} VND
          </h2>
        )}

        <div className="flex gap-4 text-sm font-medium h-7 items-center">
          {comparisonData ? (
            <span className={`px-3 py-1 rounded-full ${comparisonData.isPositive ? 'text-[var(--color-success)] bg-[var(--color-success)]/10' : 'text-red-500 bg-red-500/10'}`}>
              {comparisonData.text}
            </span>
          ) : (
             <span className="w-40 h-6 bg-black/5 animate-pulse rounded-full"></span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <motion.button 
          onClick={onAddClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[var(--color-primary)] text-[var(--color-on-surface)] px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 shadow-sm flex-1 cursor-pointer"
        >
          <Plus size={20} />
          Thêm chi tiêu
        </motion.button>
        
        <motion.button 
          onClick={() => setActiveTab('transactions')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="neumorphic text-[var(--color-on-surface)] px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 flex-1 cursor-pointer hover:text-[var(--color-primary)] transition-colors"
        >
          <FileText size={20} />
          Xem giao dịch
        </motion.button>
      </div>
    </div>
  );
};
