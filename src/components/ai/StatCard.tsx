import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="neumorphic p-6 rounded-large flex flex-col gap-4"
    >
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-full bg-primary text-on-surface neumorphic">
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-error'}`}>
            {trend.isPositive ? '+' : '-'}{trend.value}
          </span>
        )}
      </div>
      <div>
        <p className="text-on-surface-variant text-sm mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-on-surface">{value}</h3>
      </div>
    </motion.div>
  );
};
