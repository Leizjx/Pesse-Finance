"use client";

import React from 'react';
import { motion } from 'motion/react';
import { Check, Crown, ArrowRight, Sparkles, BellRing, Zap } from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { useAuth } from '@/hooks/useAuth';

const plans = [
  {
    id: 'basic',
    name: 'Cơ bản',
    price: 'Miễn phí',
    period: 'mãi mãi',
    description: 'Dành cho người mới bắt đầu quản lý tài chính cá nhân.',
    features: [
      'Ghi chép thu chi cơ bản',
      'Báo cáo tổng quan hàng tháng',
      'Tạo tối đa 3 ngân sách',
      'Đồng bộ 1 thiết bị'
    ],
    buttonText: 'Đang sử dụng',
    isPopular: false,
    className: 'neumorphic border-2 border-zinc-200/50 shadow-2xl',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '49.000',
    period: '/tháng',
    description: 'Trải nghiệm toàn bộ tính năng thông minh cao cấp.',
    features: [
      'Mọi tính năng của gói Cơ bản',
      'Cố vấn tài chính AI (Gemini)',
      'Thông báo đẩy & Nhắc lịch thông minh',
      'Quét hoá đơn Gmail tự động',
      'Không giới hạn ngân sách & hoá đơn',
      'Xuất dữ liệu Excel/PDF chuyên nghiệp'
    ],
    buttonText: 'Nâng cấp Premium ngay',
    isPopular: true,
    className: 'bg-[var(--color-primary)] text-black shadow-[0_40px_100px_rgba(var(--color-primary-rgb),0.3)]',
  }
];

export default function PremiumClient() {
  const { user } = useAuth();
  
  // Logic to determine if a plan is "active"
  const isPlanActive = (planId: string) => {
    if (user?.plan_type === 'premium') return true; // Premium has everything
    return user?.plan_type === planId;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2 pb-24 lg:pb-10 relative">
      {/* Decorative Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between shrink-0 mb-16 mt-6 gap-8 relative z-10 px-6">
        <div className="flex items-center justify-between md:hidden w-full">
          <h1 className="text-4xl font-black text-[var(--color-on-surface)] tracking-tighter">
            Nâng cấp <span className="text-[var(--color-primary)]">Trải nghiệm</span>
          </h1>
          <div className="flex items-center gap-5">
            <NotificationBell />
            <div className="w-12 h-12 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-lg">
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" unoptimized />
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <span className="px-5 py-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full text-[10px] lg:text-xs font-black lg:font-extrabold uppercase tracking-widest border border-[var(--color-primary)]/30">Mở khoá sức mạnh AI</span>
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-black lg:font-extrabold text-[var(--color-on-surface)] tracking-tighter mb-4">
             Pesse <span className="text-[var(--color-primary)]">Premium</span>
          </h1>
          <p className="text-base lg:text-lg text-[var(--color-on-surface-variant)] font-black lg:font-bold max-w-2xl leading-relaxed opacity-80">
            Hệ sinh thái tài chính thông minh giúp bạn kiểm soát dòng tiền và nhận lời khuyên từ trí tuệ nhân tạo.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <NotificationBell />
          <div className="w-16 h-16 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-white/10 shrink-0 shadow-xl">
            <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" unoptimized />
          </div>
        </div>

        <p className="md:hidden text-xl text-[var(--color-on-surface-variant)] font-black opacity-80 leading-relaxed">
          Nâng cấp để mở khóa toàn bộ sức mạnh quản lý tài chính chuyên nghiệp.
        </p>
      </header>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto w-full mt-4 relative z-10 pt-6 px-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -8 }}
            className={`relative rounded-[32px] lg:rounded-large p-8 lg:p-10 flex flex-col ${plan.className} transition-all duration-300`}
          >
            {plan.isPopular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-[var(--color-primary)] px-6 py-2 rounded-full text-sm font-black flex items-center gap-2 shadow-2xl">
                <Crown size={18} fill="currentColor" />
                KHUYÊN DÙNG
              </div>
            )}
            
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-4xl font-black uppercase tracking-tighter">{plan.name}</h3>
                {plan.isPopular && <Sparkles size={28} className="text-black inline" />}
              </div>
              <p className={`text-base font-black opacity-80 leading-relaxed uppercase tracking-widest`}>
                {plan.description}
              </p>
            </div>
            
            <div className="mb-12 flex items-end gap-2">
              <span className="text-5xl lg:text-6xl font-black lg:font-extrabold tracking-tighter">{plan.price}</span>
              {plan.price !== 'Miễn phí' && <span className="text-base lg:text-lg font-black lg:font-extrabold mb-2 underline decoration-4 decoration-[var(--color-on-surface)]/20">VND</span>}
              <span className={`text-sm lg:text-base font-black lg:font-bold mb-2 opacity-70`}>
                {plan.period}
              </span>
            </div>
            
            <div className="flex-1 flex flex-col gap-6 mb-12">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-5">
                  <div className={`shrink-0 rounded-full p-2 ${plan.isPopular ? 'bg-black/30 text-black shadow-inner' : 'bg-[var(--color-primary)] text-black shadow-sm'}`}>
                    <Check size={16} strokeWidth={5} />
                  </div>
                  <span className={`text-base lg:text-lg font-black lg:font-extrabold tracking-tight ${plan.isPopular ? 'text-black' : 'text-[var(--color-on-surface)]'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            
            <motion.button
              whileHover={isPlanActive(plan.id) ? {} : { scale: 1.05 }}
              whileTap={isPlanActive(plan.id) ? {} : { scale: 0.95 }}
              disabled={isPlanActive(plan.id)}
              className={`w-full py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 transition-all shadow-2xl uppercase tracking-widest ${
                isPlanActive(plan.id)
                  ? plan.isPopular
                    ? 'bg-black/15 text-black/50 cursor-default'
                    : 'bg-white/10 text-white/30 cursor-default'
                  : plan.isPopular 
                    ? 'bg-black text-[var(--color-primary)] hover:bg-zinc-900 cursor-pointer border border-white/20' 
                    : 'bg-white/10 hover:bg-white/20 text-[var(--color-on-surface)] border border-white/20 cursor-pointer'
              }`}
            >
              {isPlanActive(plan.id) 
                ? 'Đang sử dụng' 
                : (plan.id === 'basic' ? 'Cơ bản' : plan.buttonText)}
              {plan.isPopular && !isPlanActive(plan.id) && <ArrowRight size={24} className="stroke-[3]" />}
            </motion.button>
          </motion.div>
        ))}
      </div>
      
      {/* Features Showcase */}
      <div className="mt-24 max-w-6xl mx-auto w-full px-4 mb-20">
        <h2 className="text-4xl sm:text-5xl font-black text-center mb-20 text-[var(--color-on-surface)] tracking-tighter">Công nghệ tài chính vượt trội</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div whileHover={{ y: -10 }} className="neumorphic p-10 sm:p-12 rounded-[3rem] flex flex-col items-center text-center shadow-2xl border border-white/5">
            <div className="w-20 h-20 rounded-[2rem] bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mb-8 shadow-inner">
              <Sparkles size={40} className="stroke-[2.5]" />
            </div>
            <h3 className="font-black text-2xl mb-4 text-[var(--color-on-surface)] tracking-tight">Cố vấn AI 24/7</h3>
            <p className="text-[var(--color-on-surface-variant)] text-lg font-black opacity-60 leading-relaxed uppercase tracking-widest text-xs">Sử dụng Gemini AI của Google để phân tích thói quen và đưa ra lời khuyên tài chính thực tế nhất.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="neumorphic p-10 sm:p-12 rounded-[3rem] flex flex-col items-center text-center shadow-2xl border border-[var(--color-primary)]/20">
            <div className="w-20 h-20 rounded-[2rem] bg-blue-500/20 text-blue-400 flex items-center justify-center mb-8 shadow-inner">
              <BellRing size={40} className="stroke-[2.5]" />
            </div>
            <h3 className="font-black text-2xl mb-4 text-[var(--color-on-surface)] tracking-tight">Thông báo đẩy</h3>
            <p className="text-[var(--color-on-surface-variant)] text-lg font-black opacity-60 leading-relaxed uppercase tracking-widest text-xs">Cảnh báo vượt ngân sách và nhắc lịch gia hạn dịch vụ tự động, giúp bạn kiểm soát dòng tiền tối ưu.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="neumorphic p-10 sm:p-12 rounded-[3rem] flex flex-col items-center text-center shadow-2xl border border-white/5">
            <div className="w-20 h-20 rounded-[2rem] bg-amber-500/20 text-amber-500 flex items-center justify-center mb-8 shadow-inner">
              <Zap size={40} className="stroke-[2.5]" />
            </div>
            <h3 className="font-black text-2xl mb-4 text-[var(--color-on-surface)] tracking-tight">Báo cáo tổng hợp</h3>
            <p className="text-[var(--color-on-surface-variant)] text-lg font-black opacity-60 leading-relaxed uppercase tracking-widest text-xs">Truy xuất dữ liệu nhanh chóng để biết chính xác tiền của mình đang đi đâu và lên kế hoạch tiết kiệm.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
