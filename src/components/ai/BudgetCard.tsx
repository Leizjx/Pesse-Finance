import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface BudgetCardProps {
  title: string;
  spent: number;
  total: number;
  icon: LucideIcon;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ title, spent, total, icon: Icon }) => {
  const percentage = Math.min((spent / total) * 100, 100);
  const isOverBudget = spent > total;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="neumorphic p-5 rounded-standard flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full neumorphic text-on-surface">
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-on-surface">{title}</h3>
      </div>
      
      <div>
        <div className="flex justify-between items-end mb-2">
          <span className="font-bold text-lg">{spent.toLocaleString('vi-VN')} VND</span>
          <span className="text-xs text-on-surface-variant">/ {total.toLocaleString('vi-VN')} VND</span>
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
