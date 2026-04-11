import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface BudgetCardProps {
  title: string;
  spent: number;
  total: number;
  icon: LucideIcon;
  onClick?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ title, spent, total, icon: Icon, onClick }) => {
  const percentage = Math.min((spent / total) * 100, 100);
  const isOverBudget = spent > total;

  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`neumorphic p-5 rounded-standard flex flex-col gap-3 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full neumorphic text-on-surface">
          <Icon size={24} className="stroke-[2.5]" />
        </div>
        <h3 className="font-black text-lg text-on-surface tracking-tight">{title}</h3>
      </div>
      
      <div>
        <div className="flex justify-between items-end mb-3">
          <span className="font-black lg:font-extrabold text-xl lg:text-lg text-[var(--color-on-surface)]">{spent.toLocaleString('vi-VN')} <span className="text-[10px] lg:text-xs opacity-50">VND</span></span>
          <span className="text-xs lg:text-[11px] font-bold text-on-surface-variant opacity-70">/ {total.toLocaleString('vi-VN')}</span>
        </div>
        <div className="h-3 w-full bg-surface rounded-full neumorphic-pressed overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${isOverBudget ? 'bg-error' : 'bg-primary'}`}
          />
        </div>
      </div>
    </motion.div>
  );
};
