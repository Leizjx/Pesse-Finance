"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, User, Settings, Crown, ChevronDown, 
  Sparkles, CreditCard 
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const isPremium = user?.plan_type === 'premium';

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 md:gap-3 p-1 pr-3 rounded-full neumorphic hover:bg-[var(--color-surface)] transition-all cursor-pointer group"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-[var(--color-surface)] shrink-0">
          <Image 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} 
            alt="Avatar" 
            width={40} 
            height={40} 
            className="w-full h-full object-cover" 
            unoptimized 
          />
        </div>
        <div className="hidden sm:flex flex-col items-start mr-1">
           <span className="text-[10px] font-extrabold text-[var(--color-on-surface-variant)] uppercase tracking-wider leading-none mb-1">Tài khoản</span>
           <div className="flex items-center gap-1">
             <span className="text-sm font-bold text-[var(--color-on-surface)] truncate max-w-[80px]">{user?.full_name?.split(' ')[0]}</span>
             <ChevronDown size={14} className={`text-[var(--color-on-surface-variant)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
           </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-64 bg-[var(--color-surface)]/90 backdrop-blur-xl rounded-3xl p-3 shadow-2xl border border-white/10 z-[100] origin-top-right overflow-hidden"
          >
            {/* Header / User Info */}
            <div className="p-4 mb-2 bg-black/5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--color-primary)]">
                  <Image 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} 
                    alt="Avatar" 
                    width={48} 
                    height={48} 
                    unoptimized 
                  />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-[var(--color-on-surface)] truncate">{user?.full_name}</span>
                  <span className="text-[10px] text-[var(--color-on-surface-variant)] truncate">{user?.email}</span>
                </div>
              </div>
              
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${isPremium ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/10'}`}>
                {isPremium ? <Crown size={12} className="fill-yellow-600" /> : <User size={12} />}
                {isPremium ? 'Thành viên Premium' : 'Gói Miễn Phí'}
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {!isPremium && (
                <button 
                  onClick={() => handleNavigate('/dashboard/premium')}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} />
                    <span className="text-sm">Nâng cấp Premium</span>
                  </div>
                  <ChevronRight size={14} />
                </button>
              )}

              <button 
                onClick={() => handleNavigate('/dashboard/account')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 text-[var(--color-on-surface)] font-medium transition-all cursor-pointer"
              >
                <Settings size={18} className="text-[var(--color-on-surface-variant)]" />
                <span className="text-sm">Cài đặt tài khoản</span>
              </button>

              <button 
                onClick={() => handleNavigate('/dashboard/subscriptions')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 text-[var(--color-on-surface)] font-medium transition-all cursor-pointer"
              >
                <CreditCard size={18} className="text-[var(--color-on-surface-variant)]" />
                <span className="text-sm">Hóa đơn tài chính</span>
              </button>
            </div>

            <div className="mt-2 pt-2 border-t border-black/5">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 font-bold transition-all cursor-pointer"
              >
                <LogOut size={18} />
                <span className="text-sm">Đăng xuất</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);
