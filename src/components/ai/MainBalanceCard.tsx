import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, FileText } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useTransactions } from '@/hooks/useTransactions';

interface MainBalanceCardProps {
  setActiveTab: (tab: string) => void;
}

export const MainBalanceCard: React.FC<MainBalanceCardProps> = ({ setActiveTab }) => {
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
    <div className="neumorphic p-5 sm:p-8 rounded-[2.5rem] sm:rounded-large flex flex-col justify-between h-full w-full">
      <div className="space-y-1 sm:space-y-2">
        <p className="text-sm sm:text-base font-extrabold text-[var(--color-on-surface-variant)] uppercase tracking-widest opacity-80">Tổng số dư hiện tại</p>
        
        {isLoadingUser ? (
          <div className="h-[48px] w-64 bg-[var(--color-surface)] neumorphic-pressed rounded-xl animate-pulse mb-4"></div>
        ) : (
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--color-on-surface)] mb-4 sm:mb-6 tracking-tighter leading-tight truncate">
            {totalBalance.toLocaleString('vi-VN')} <span className="text-xl sm:text-2xl font-black opacity-50">VND</span>
          </h2>
        )}

        <div className="flex gap-4 text-base font-black h-8 items-center">
          {comparisonData ? (
            <span className={`px-4 py-1.5 rounded-full shadow-sm ${comparisonData.isPositive ? 'text-[var(--color-success)] bg-[var(--color-success)]/15 border border-[var(--color-success)]/20' : 'text-red-500 bg-red-500/15 border border-red-500/20'}`}>
              {comparisonData.text}
            </span>
          ) : (
            <span className="w-48 h-8 bg-black/5 animate-pulse rounded-full"></span>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-5 mt-10 sm:mt-12">
        <motion.button 
          onClick={() => setActiveTab('reports')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-[var(--color-primary)] text-[var(--color-on-surface)] px-8 py-4.5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl flex-1 cursor-pointer text-base sm:text-lg transition-transform"
        >
          <PieChart size={24} className="stroke-[2.5]" />
          <span>Xem báo cáo</span>
        </motion.button>
        
        <motion.button 
          onClick={() => setActiveTab('transactions')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="neumorphic text-[var(--color-on-surface)] px-8 py-4.5 rounded-[2rem] font-black flex items-center justify-center gap-3 flex-1 cursor-pointer hover:text-[var(--color-primary)] transition-all text-base sm:text-lg"
        >
          <FileText size={24} className="stroke-[2.5]" />
          <span>Giao dịch</span>
        </motion.button>
      </div>
    </div>
  );
};
