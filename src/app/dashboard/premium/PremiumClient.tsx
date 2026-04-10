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
      <header className="flex flex-col md:flex-row md:items-start justify-between shrink-0 mb-12 mt-4 gap-6 relative z-10 px-4">
        <div className="flex items-center justify-between md:hidden w-full">
          <h1 className="text-3xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            Nâng cấp <span className="text-[var(--color-primary)]">Trải nghiệm</span>
          </h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-white/10">
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" unoptimized />
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-3"
          >
            <span className="px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary)] rounded-full text-xs font-bold uppercase tracking-wider border border-[var(--color-primary)]/30">Mở khoá sức mạnh AI</span>
          </motion.div>
          <h1 className="text-5xl font-extrabold text-[var(--color-on-surface)] tracking-tight mb-3">
             Pesse <span className="text-[var(--color-primary)]">Premium</span>
          </h1>
          <p className="text-lg text-[var(--color-on-surface-variant)] font-medium max-w-xl leading-relaxed">
            Hệ sinh thái tài chính thông minh giúp bạn kiểm soát dòng tiền và nhận lời khuyên từ trí tuệ nhân tạo.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-5">
          <NotificationBell />
          <div className="w-14 h-14 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-white/10 shrink-0">
            <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={56} height={56} className="w-full h-full object-cover" unoptimized />
          </div>
        </div>

        <p className="md:hidden text-lg text-[var(--color-on-surface-variant)] font-medium">
          Nâng cấp để mở khóa toàn bộ sức mạnh quản lý tài chính của Pesse.
        </p>
      </header>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto w-full mt-4 relative z-10 pt-6 px-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -8 }}
            className={`relative rounded-[48px] p-8 md:p-10 flex flex-col ${plan.className} transition-all duration-300`}
          >
            {plan.isPopular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-[var(--color-primary)] px-6 py-2 rounded-full text-sm font-black flex items-center gap-2 shadow-2xl">
                <Crown size={18} fill="currentColor" />
                KHUYÊN DÙNG
              </div>
            )}
            
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-3xl font-black uppercase tracking-tight">{plan.name}</h3>
                {plan.isPopular && <Sparkles size={24} className="text-black inline" />}
              </div>
              <p className={`text-sm font-semibold opacity-80`}>
                {plan.description}
              </p>
            </div>
            
            <div className="mb-10 flex items-end gap-1">
              <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
              {plan.price !== 'Miễn phí' && <span className="text-lg font-bold mb-2">VND</span>}
              <span className={`text-base font-bold mb-2 opacity-70`}>
                {plan.period}
              </span>
            </div>
            
            <div className="flex-1 flex flex-col gap-5 mb-10">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`shrink-0 rounded-full p-1.5 ${plan.isPopular ? 'bg-black/20 text-black' : 'bg-[var(--color-primary)] text-black'}`}>
                    <Check size={16} strokeWidth={4} />
                  </div>
                  <span className={`text-base font-bold ${plan.isPopular ? 'text-black' : 'text-[var(--color-on-surface)]'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            
            <motion.button
              whileHover={isPlanActive(plan.id) ? {} : { scale: 1.02 }}
              whileTap={isPlanActive(plan.id) ? {} : { scale: 0.98 }}
              disabled={isPlanActive(plan.id)}
              className={`w-full py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 transition-all ${
                isPlanActive(plan.id)
                  ? plan.isPopular
                    ? 'bg-black/10 text-black/60 cursor-default'
                    : 'bg-black/20 text-black/40 cursor-default'
                  : plan.isPopular 
                    ? 'bg-black text-[var(--color-primary)] hover:bg-zinc-900 shadow-2xl cursor-pointer' 
                    : 'bg-white/10 hover:bg-white/20 text-[var(--color-on-surface)] border border-white/10 cursor-pointer'
              }`}
            >
              {isPlanActive(plan.id) 
                ? 'Đang sử dụng' 
                : (plan.id === 'basic' ? 'Gói Cơ bản' : plan.buttonText)}
              {plan.isPopular && !isPlanActive(plan.id) && <ArrowRight size={22} />}
            </motion.button>
          </motion.div>
        ))}
      </div>
      
      {/* Features Showcase */}
      <div className="mt-24 max-w-6xl mx-auto w-full px-4 mb-20">
        <h2 className="text-4xl font-extrabold text-center mb-16 text-[var(--color-on-surface)] tracking-tight">Công nghệ tài chính vượt trội</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div whileHover={{ y: -5 }} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[40px] flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mb-6">
              <Sparkles size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-[var(--color-on-surface)]">Cố vấn AI 24/7</h3>
            <p className="text-[var(--color-on-surface-variant)] font-medium leading-relaxed">Sử dụng công nghệ Gemini AI của Google để phân tích thói quen và đưa ra lời khuyên thực tế nhất.</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[40px] flex flex-col items-center text-center shadow-inner">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6">
              <BellRing size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-[var(--color-on-surface)]">Thông báo thông minh</h3>
            <p className="text-[var(--color-on-surface-variant)] font-medium leading-relaxed">Cảnh báo vượt ngân sách và nhắc lịch gia hạn dịch vụ tự động, giúp bạn không bao giờ mất tiền oan.</p>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[40px] flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
              <Zap size={32} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-[var(--color-on-surface)]">Tình hình tài chính</h3>
            <p className="text-[var(--color-on-surface-variant)] font-medium leading-relaxed">Xem nhanh báo cáo tổng hợp để biết chính xác tiền của mình đang đi đâu và về đâu.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
