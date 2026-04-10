"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Upload, EyeOff, ShieldCheck, 
  RefreshCw, ChevronRight, Fingerprint, 
  Smartphone, Laptop
} from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { useAuth } from '@/hooks/useAuth';

const Toggle = ({ isActive, onToggle }: { isActive: boolean; onToggle: () => void }) => (
  <div 
    className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${isActive ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface)] neumorphic-pressed'}`}
    onClick={onToggle}
  >
    <motion.div 
      className="w-6 h-6 bg-white rounded-full shadow-sm"
      animate={{ x: isActive ? 24 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    />
  </div>
);

export default function AccountClient() {
  const { user } = useAuth();
  const [isPrivateMode, setIsPrivateMode] = useState(true);
  const [isBiometric, setIsBiometric] = useState(true);
  const [language, setLanguage] = useState('vi');

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2 pb-24 lg:pb-10 relative">
      <header className="flex flex-col md:flex-row md:items-start justify-between shrink-0 mb-10 mt-2 gap-4">
        <div className="flex items-center justify-between md:hidden w-full">
          <h1 className="text-3xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            Cài đặt <span className="text-[var(--color-primary)]">cá nhân</span>
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>

        <div className="hidden md:block">
          <h1 className="text-4xl font-extrabold text-[var(--color-on-surface)] tracking-tight mb-2">
            Cài đặt <span className="text-[var(--color-primary)]">cá nhân</span>
          </h1>
          <p className="text-base text-[var(--color-on-surface-variant)] font-medium">
            Quản lý tài khoản và thiết lập bảo mật hệ thống của bạn.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <NotificationBell />
          <UserMenu />
        </div>

        <p className="md:hidden text-sm text-[var(--color-on-surface-variant)] font-medium">
          Quản lý tài khoản và thiết lập bảo mật hệ thống của bạn.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="flex flex-col gap-8">
          <div className="neumorphic p-8 rounded-large">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Thông tin cơ bản</h2>
              <User size={20} className="text-[var(--color-primary)]" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full neumorphic-pressed p-2">
                  <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Profile" width={128} height={128} className="w-full h-full rounded-full object-cover" unoptimized />
                </div>
                <button aria-label="Tải ảnh đại diện" className="absolute bottom-0 right-0 w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-[var(--color-on-surface)] shadow-sm hover:scale-105 transition-transform cursor-pointer">
                  <Upload size={18} />
                </button>
              </div>
              
              <div className="flex-1 w-full flex flex-col gap-6">
                <div>
                  <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block">Họ và tên</label>
                  <div className="neumorphic-pressed rounded-standard px-4 py-3">
                    <input 
                      type="text" 
                      defaultValue={user?.full_name || ''} 
                      className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block">Email</label>
                  <div className="neumorphic flex items-center rounded-standard px-4 py-3 opacity-70">
                    <input 
                      type="text" 
                      defaultValue={user?.email || ''} 
                      disabled
                      className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-medium"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block">Ngôn ngữ</label>
                  <div className="neumorphic-pressed rounded-standard p-1 flex relative">
                    <div 
                      className="flex-1 py-2 text-center text-sm font-bold cursor-pointer relative z-10 transition-colors"
                      onClick={() => setLanguage('vi')}
                    >
                      Tiếng Việt
                    </div>
                    <div 
                      className="flex-1 py-2 text-center text-sm font-bold text-[var(--color-on-surface-variant)] cursor-pointer relative z-10 transition-colors"
                      onClick={() => setLanguage('en')}
                    >
                      English
                    </div>
                    <motion.div 
                      className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--color-primary)] rounded-full shadow-sm z-0"
                      initial={false}
                      animate={{ left: language === 'vi' ? '4px' : 'calc(50%)' }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="neumorphic p-8 rounded-large">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-primary)]">
                <EyeOff size={18} />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Quyền riêng tư</h2>
            </div>
            
            <div className="neumorphic-pressed rounded-standard p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--color-on-surface)] mb-1">Chế độ riêng tư</h3>
                <p className="text-sm text-[var(--color-on-surface-variant)]">Ẩn số dư trên màn hình chính</p>
              </div>
              <Toggle isActive={isPrivateMode} onToggle={() => setIsPrivateMode(!isPrivateMode)} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="neumorphic p-8 rounded-large flex-1 flex flex-col">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[#22c55e]">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl font-bold text-[var(--color-on-surface)]">Bảo mật</h2>
            </div>
            
            <div className="flex flex-col gap-6 flex-1">
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="neumorphic p-4 rounded-standard flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <RefreshCw size={18} className="text-[var(--color-on-surface-variant)]" />
                  <span className="font-bold text-[var(--color-on-surface)]">Đổi mã PIN</span>
                </div>
                <ChevronRight size={18} className="text-[var(--color-on-surface-variant)]" />
              </motion.button>
              
              <div className="neumorphic p-4 rounded-standard flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Fingerprint size={24} className="text-[var(--color-on-surface-variant)]" />
                  <div>
                    <h3 className="font-bold text-[var(--color-on-surface)] mb-1">Bảo mật sinh trắc học</h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)]">Vân tay/FaceID</p>
                  </div>
                </div>
                <Toggle isActive={isBiometric} onToggle={() => setIsBiometric(!isBiometric)} />
              </div>
              
              <div className="neumorphic-pressed p-6 rounded-standard mt-2 flex-1">
                <h3 className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-6">Thiết bị đang kết nối</h3>
                
                <div className="flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <Smartphone size={20} className="text-[var(--color-on-surface-variant)] mt-1" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[var(--color-on-surface)]">iPhone 15 Pro Max</h4>
                      <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">Đang hoạt động</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2 shadow-[0_0_8px_rgba(212,239,63,0.8)]"></div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Laptop size={20} className="text-[var(--color-on-surface-variant)] mt-1" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[var(--color-on-surface-variant)]">MacBook Pro 14&quot;</h4>
                      <span className="text-[10px] text-[var(--color-on-surface-variant)]">Đăng nhập 2 ngày trước</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-full border border-red-500/20 text-red-500 font-bold text-sm hover:bg-red-500/5 transition-colors shadow-[0_4px_10px_rgba(239,68,68,0.1)] bg-[var(--color-surface)] cursor-pointer"
              >
                Xóa tài khoản vĩnh viễn
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-12 flex flex-col items-center gap-4 shrink-0">
        <div className="flex items-center gap-8 text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest">
          <span>Hỗ trợ 24/7</span>
          <span>Bảo mật AES-256</span>
          <span>Pesse V2.4.0</span>
        </div>
        <p className="text-xs text-[var(--color-on-surface-variant)] font-medium">
          © {new Date().getFullYear()} Pesse Digital. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
