"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Cpu, Shield, ArrowRight, BarChart3, Lock } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    title: "Tự động hoàn toàn",
    description: "Pesse tự động cập nhật chi tiêu thông minh dành cho bạn từ email và tin nhắn.",
    illustration: (
      <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-[var(--color-surface)] rounded-full shadow-[10px_10px_25px_rgba(0,0,0,0.05),-10px_-10px_25px_rgba(255,255,255,0.8)]" />
        <div className="relative w-40 h-40">
          <Image 
            src="/images/intro-automation.png" 
            alt="AI Automation" 
            fill 
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>
    ),
    placeholder: (
      <div className="w-full neumorphic-pressed rounded-2xl p-4 flex items-center gap-4 mb-8 animate-shimmer">
        <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.8)] flex items-center justify-center">
          <Shield size={20} className="text-[var(--color-on-surface-variant)]" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-2.5 bg-[var(--color-on-surface-variant)]/20 rounded-full w-3/4"></div>
          <div className="h-2.5 bg-[var(--color-on-surface-variant)]/20 rounded-full w-full"></div>
          <div className="h-2.5 bg-[var(--color-on-surface-variant)]/20 rounded-full w-1/2"></div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Phân tích thông minh",
    description: "Biểu đồ trực quan giúp bạn nắm bắt xu hướng chi tiêu và tối ưu hóa ngân sách.",
    illustration: (
      <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-[var(--color-surface)] rounded-full shadow-[10px_10px_25px_rgba(0,0,0,0.05),-10px_-10px_25px_rgba(255,255,255,0.8)]" />
        <div className="relative w-40 h-40">
          <Image 
            src="/images/intro-insights.png" 
            alt="Smart Insights" 
            fill 
            sizes="(max-width: 768px) 160px, 160px"
            quality={80}
            loading="lazy"
            className="object-contain drop-shadow-xl"
          />
        </div>
      </div>
    ),
    placeholder: (
      <div className="w-full flex justify-between gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex-1 neumorphic rounded-xl p-3 flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-[var(--color-primary)]" />
            </div>
            <div className="h-2 bg-[var(--color-on-surface-variant)]/20 rounded-full w-full"></div>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 3,
    title: "Bảo mật tuyệt đối",
    description: "Dữ liệu tài chính của bạn được mã hóa 256-bit và bảo vệ an toàn tối đa.",
    illustration: (
      <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-[var(--color-surface)] rounded-full shadow-[10px_10px_25px_rgba(0,0,0,0.05),-10px_-10px_25px_rgba(255,255,255,0.8)]" />
        <div className="relative w-40 h-40">
          <Image 
            src="/images/intro-security.png" 
            alt="Security & Privacy" 
            fill 
            sizes="(max-width: 768px) 160px, 160px"
            quality={80}
            loading="lazy"
            className="object-contain drop-shadow-xl"
          />
        </div>
      </div>
    ),
    placeholder: (
      <div className="w-full neumorphic rounded-2xl p-6 flex flex-col items-center gap-3 mb-8">
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 rounded-full bg-[var(--color-primary)]" />)}
        </div>
        <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Mã hóa chuẩn AES-256</span>
      </div>
    )
  }
];

export default function LandingClient() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 relative z-10 bg-[var(--color-background)] overflow-hidden">
      <header className="flex justify-between items-center w-full max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface flex items-center gap-2">
          Pesse <span className="text-[var(--color-primary)] hidden md:inline">- Quản lý tài chính cá nhân tự động bằng AI</span>
        </h1>
        <Link href="/login" className="text-[var(--color-on-surface-variant)] font-medium hover:text-[var(--color-on-surface)] transition-colors">
          Bỏ qua
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="neumorphic p-10 rounded-[40px] w-full max-w-md flex flex-col items-center text-center"
          >
            {SLIDES[currentSlide].illustration}

            <h2 className="text-2xl font-extrabold mb-3 text-on-surface">
              {SLIDES[currentSlide].title}
            </h2>
            <p className="text-[var(--color-on-surface-variant)] text-sm font-medium mb-8 px-4 h-10">
              {SLIDES[currentSlide].description}
            </p>

            {SLIDES[currentSlide].placeholder}

            {/* Pagination Dots */}
            <div className="flex gap-2 mb-8">
              {SLIDES.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? "w-8 bg-[var(--color-primary)]" 
                      : "w-2 bg-[var(--color-on-surface-variant)]/20"
                  }`}
                />
              ))}
            </div>

            <div className="w-full flex flex-col gap-4">
              {currentSlide < SLIDES.length - 1 ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextSlide}
                  className="w-full bg-[var(--color-on-surface)] text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-sm"
                >
                  Tiếp tục <ArrowRight size={20} />
                </motion.button>
              ) : (
                <Link href="/login" className="w-full">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-sm"
                  >
                    Bắt đầu ngay <ArrowRight size={20} />
                  </motion.button>
                </Link>
              )}
              
              <Link href="/login" className="text-xs font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">
                ĐÃ CÓ TÀI KHOẢN? ĐĂNG NHẬP
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-6 flex flex-col items-center gap-4">
        <div className="flex gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all">
          <Shield size={16} />
          <Lock size={16} />
          <Cpu size={16} />
        </div>
        <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest">
          Bảo mật & Cá nhân hóa theo tiêu chuẩn ngân hàng
        </span>
      </footer>
    </div>
  );
}

