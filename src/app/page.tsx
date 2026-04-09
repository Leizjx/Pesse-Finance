"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wallet, Cpu, Shield, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col p-6 relative z-10 bg-[var(--color-background)]">
      <header className="flex justify-between items-center w-full max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Pesse</h1>
        <Link href="/login" className="text-[var(--color-on-surface-variant)] font-medium hover:text-[var(--color-on-surface)] transition-colors">
          Bỏ qua
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="neumorphic p-10 rounded-[40px] w-full max-w-md flex flex-col items-center text-center"
        >
          {/* 3D Wallet Illustration Placeholder */}
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-[var(--color-surface)] rounded-3xl shadow-[10px_10px_20px_rgba(0,0,0,0.05),-10px_-10px_20px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <Wallet size={48} className="text-[var(--color-on-surface-variant)] opacity-50" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="bg-[var(--color-surface)] p-3 rounded-2xl shadow-[5px_5px_10px_rgba(0,0,0,0.05),-5px_-5px_10px_rgba(255,255,255,0.8)] border border-[var(--color-primary)]/20">
                 <Cpu size={32} className="text-[var(--color-primary)]" />
               </div>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold mb-3 text-on-surface">Tự động hoàn toàn</h2>
          <p className="text-[var(--color-on-surface-variant)] text-sm font-medium mb-8 px-4">
            Pesse tự động cập nhật chi tiêu thông minh dành cho bạn.
          </p>

          {/* Toggle Switch Placeholder */}
          <div className="flex gap-2 mb-8">
            <div className="w-12 h-6 rounded-full bg-[var(--color-primary)] shadow-inner"></div>
            <div className="w-12 h-6 rounded-full neumorphic-pressed"></div>
          </div>

          {/* Skeleton UI Placeholder */}
          <div className="w-full neumorphic-pressed rounded-2xl p-4 flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] shadow-[2px_2px_5px_rgba(0,0,0,0.05),-2px_-2px_5px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <Shield size={20} className="text-[var(--color-on-surface-variant)]" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-2.5 bg-[var(--color-on-surface-variant)]/20 rounded-full w-3/4"></div>
              <div className="h-2.5 bg-[var(--color-on-surface-variant)]/20 rounded-full w-full"></div>
              <div className="h-2.5 bg-[var(--color-on-surface-variant)]/20 rounded-full w-1/2"></div>
            </div>
          </div>

          <Link href="/login" className="w-full">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-sm mb-6"
            >
              Bắt đầu ngay <ArrowRight size={20} />
            </motion.button>
          </Link>

          <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest">
            Bảo mật & Cá nhân hóa
          </span>
        </motion.div>
      </div>
    </div>
  );
}
