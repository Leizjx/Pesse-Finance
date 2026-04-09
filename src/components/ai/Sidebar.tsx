import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, ReceiptText, BarChart2, Wallet, Settings, LogOut, Database } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutGrid, label: 'Tổng quan' },
  { id: 'transactions', icon: ReceiptText, label: 'Giao dịch' },
  { id: 'reports', icon: BarChart2, label: 'Báo cáo' },
  { id: 'budget', icon: Wallet, label: 'Ngân sách' },
  { id: 'data-connection', icon: Database, label: 'Kết nối dữ liệu' },
  { id: 'account', icon: Settings, label: 'Cài đặt' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { signOut } = useAuth();
  
  return (
    <div className="h-full p-6 flex flex-col justify-between neumorphic rounded-large">
      <div>
        <div className="flex flex-col gap-1 mb-10 px-2">
          <h1 className="font-bold text-2xl text-on-surface">Pesse</h1>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Trải nghiệm số</p>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary text-on-surface shadow-sm font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50 font-medium'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <div className="neumorphic-pressed p-4 rounded-standard flex flex-col items-center text-center gap-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase">Gói thành viên</span>
          <motion.button 
            onClick={() => setActiveTab('premium')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full py-2 rounded-full font-bold text-sm shadow-sm transition-colors ${
              activeTab === 'premium' 
                ? 'bg-on-surface text-surface' 
                : 'bg-primary text-on-surface'
            }`}
          >
            Nâng cấp Premium
          </motion.button>
        </div>

        <motion.button
          onClick={() => {
            signOut();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 px-4 py-3 rounded-full text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Đăng xuất</span>
        </motion.button>
      </div>
    </div>
  );
};
