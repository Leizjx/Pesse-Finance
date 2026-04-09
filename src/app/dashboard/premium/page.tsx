"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Shield, Crown, ArrowRight } from 'lucide-react';
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
    color: 'bg-[var(--color-surface)] neumorphic',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '49.000',
    period: '/tháng',
    description: 'Trải nghiệm toàn bộ tính năng cao cấp, không giới hạn.',
    features: [
      'Mọi tính năng của gói Cơ bản',
      'Báo cáo chi tiết & Phân tích sâu',
      'Không giới hạn số lượng ngân sách',
      'Đồng bộ đa thiết bị',
      'Xuất dữ liệu ra Excel/PDF',
      'Không quảng cáo'
    ],
    buttonText: 'Nâng cấp ngay',
    isPopular: true,
    color: 'bg-[var(--color-primary)] text-[var(--color-on-surface)] shadow-lg',
  }
];

export default function PremiumPage() {
  const { user } = useAuth();
  
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2 pb-24 lg:pb-10 relative">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between shrink-0 mb-10 mt-2 gap-4">
        <div className="flex items-center justify-between md:hidden w-full">
          <h1 className="text-3xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            Gói <span className="text-[var(--color-primary)]">thành viên</span>
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <NotificationBell />
            <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface)] shrink-0">
              <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" unoptimized />
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <h1 className="text-4xl font-extrabold text-[var(--color-on-surface)] tracking-tight mb-2">
            Gói <span className="text-[var(--color-primary)]">thành viên</span>
          </h1>
          <p className="text-base text-[var(--color-on-surface-variant)] font-medium">
            Nâng cấp để mở khóa toàn bộ sức mạnh quản lý tài chính của Pesse.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <NotificationBell />
          <div className="w-12 h-12 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface)] shrink-0">
            <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={48} height={48} className="w-full h-full object-cover" unoptimized />
          </div>
        </div>

        <p className="md:hidden text-sm text-[var(--color-on-surface-variant)] font-medium">
          Nâng cấp để mở khóa toàn bộ sức mạnh quản lý tài chính của Pesse.
        </p>
      </header>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full mt-4">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -5 }}
            className={`relative rounded-[32px] p-8 flex flex-col ${plan.color} ${!plan.isPopular ? 'border-2 border-transparent' : ''}`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--color-on-surface)] text-[var(--color-surface)] px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                <Crown size={14} className="text-[var(--color-primary)]" />
                PHỔ BIẾN NHẤT
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={`text-sm ${plan.isPopular ? 'text-[var(--color-on-surface)]/80' : 'text-[var(--color-on-surface-variant)]'}`}>
                {plan.description}
              </p>
            </div>
            
            <div className="mb-8 flex items-end gap-1">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              {plan.price !== 'Miễn phí' && <span className="text-sm font-bold mb-1">VND</span>}
              <span className={`text-sm font-medium mb-1 ${plan.isPopular ? 'text-[var(--color-on-surface)]/80' : 'text-[var(--color-on-surface-variant)]'}`}>
                {plan.period}
              </span>
            </div>
            
            <div className="flex-1 flex flex-col gap-4 mb-8">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-1 ${plan.isPopular ? 'bg-[var(--color-on-surface)] text-[var(--color-surface)]' : 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'}`}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className={`text-sm font-medium ${plan.isPopular ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-full font-bold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                plan.isPopular 
                  ? 'bg-[var(--color-on-surface)] text-[var(--color-surface)] hover:bg-[var(--color-on-surface)]/90 shadow-lg' 
                  : 'neumorphic-pressed text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
              }`}
            >
              {plan.buttonText}
              {plan.isPopular && <ArrowRight size={18} />}
            </motion.button>
          </motion.div>
        ))}
      </div>
      
      {/* Features Grid */}
      <div className="mt-16 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-bold text-center mb-10 text-[var(--color-on-surface)]">Tại sao nên chọn Premium?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="neumorphic p-6 rounded-large flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-on-surface)] flex items-center justify-center mb-4">
              <Star size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-[var(--color-on-surface)]">Trải nghiệm tối ưu</h3>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Không quảng cáo, giao diện mượt mà, tập trung hoàn toàn vào tài chính của bạn.</p>
          </div>
          <div className="neumorphic p-6 rounded-large flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-on-surface)] flex items-center justify-center mb-4">
              <Zap size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-[var(--color-on-surface)]">Phân tích chuyên sâu</h3>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Báo cáo chi tiết giúp bạn hiểu rõ thói quen chi tiêu và tìm ra cách tiết kiệm hiệu quả.</p>
          </div>
          <div className="neumorphic p-6 rounded-large flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-on-surface)] flex items-center justify-center mb-4">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-[var(--color-on-surface)]">Bảo mật tuyệt đối</h3>
            <p className="text-sm text-[var(--color-on-surface-variant)]">Dữ liệu được mã hóa và đồng bộ an toàn trên tất cả các thiết bị của bạn.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
