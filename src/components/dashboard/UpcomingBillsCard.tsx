"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, CreditCard, ChevronRight, CheckCircle2, Lock, Crown } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { format, differenceInDays, parseISO, addDays, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export const UpcomingBillsCard = () => {
  const { user } = useAuth();
  const { data: subscriptions = [], isLoading } = useSubscriptions();
  const router = useRouter();

  const upcomingBills = useMemo(() => {
    const today = startOfDay(new Date());
    const sevenDaysFromNow = addDays(today, 7);

    return subscriptions
      .filter(sub => {
        if (!sub.next_billing_date) return false;
        const billingDate = startOfDay(parseISO(sub.next_billing_date));
        // Show bills that are due today or within the next 7 days
        return (billingDate.getTime() >= today.getTime()) && 
               (billingDate.getTime() <= sevenDaysFromNow.getTime());
      })
      .sort((a, b) => {
        return new Date(a.next_billing_date!).getTime() - new Date(b.next_billing_date!).getTime();
      });
  }, [subscriptions]);

  if (isLoading) {
    return (
      <div className="neumorphic p-6 rounded-large h-full flex flex-col min-h-[250px] animate-pulse">
        <div className="h-6 bg-black/10 rounded w-1/2 mb-6"></div>
        <div className="space-y-4">
          <div className="h-16 bg-black/10 rounded-standard w-full"></div>
          <div className="h-16 bg-black/10 rounded-standard w-full"></div>
        </div>
      </div>
    );
  }

  // Premium Guard
  if (user?.plan_type !== 'premium') {
    return (
      <div className="neumorphic p-6 rounded-large h-full flex flex-col min-h-[250px] relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-[var(--color-on-surface)] flex items-center gap-2">
            <CalendarClock size={20} className="text-[var(--color-on-surface-variant)]" />
            Hóa đơn <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full flex items-center gap-1 mx-1"><Crown size={10} /> Premium</span>
          </h3>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4 text-[var(--color-primary)]">
            <Lock size={32} />
          </div>
          <p className="text-sm font-bold text-[var(--color-on-surface)]">Tính năng giới hạn</p>
          <p className="text-[10px] text-[var(--color-on-surface-variant)] mt-1 max-w-[200px]">
            Tự động quét và nhắc nhở hóa đơn từ Email dành riêng cho thành viên <strong>Premium</strong>.
          </p>
          <button 
            onClick={() => router.push('/dashboard/premium')}
            className="mt-4 px-6 py-2 bg-[var(--color-primary)] text-black font-bold text-xs rounded-full hover:scale-105 transition-transform flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Crown size={14} className="fill-black" />
            Nâng cấp ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="neumorphic p-6 rounded-large h-full flex flex-col min-h-[250px]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-[var(--color-on-surface)] flex items-center gap-2">
          <CalendarClock size={20} className="text-[var(--color-primary)]" />
          Hóa đơn sắp tới
        </h3>
        {upcomingBills.length > 0 && (
          <span className="text-[10px] font-bold bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-2 py-1 rounded-full uppercase tracking-wider">
            {upcomingBills.length} hóa đơn
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
        {upcomingBills.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 text-green-500">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-sm font-bold text-[var(--color-on-surface)]">Tuyệt vời!</p>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Bạn không có hóa đơn nào sắp đến hạn trong 7 ngày tới.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingBills.map((bill, index) => {
              const diff = differenceInDays(parseISO(bill.next_billing_date!), startOfDay(new Date()));
              let statusText = "";
              let statusColor = "text-[var(--color-on-surface-variant)]";

              if (diff === 0) {
                statusText = "Hết hạn hôm nay";
                statusColor = "text-red-500 font-bold";
              } else if (diff === 1) {
                statusText = "Ngày mai";
                statusColor = "text-orange-500 font-bold";
              } else {
                statusText = `Còn ${diff} ngày`;
                statusColor = "text-[var(--color-primary)] font-bold";
              }

              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={bill.id}
                  className="p-4 rounded-standard neumorphic-pressed flex items-center justify-between group hover:bg-[var(--color-primary)]/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] neumorphic flex items-center justify-center shrink-0">
                      <CreditCard size={18} className="text-[var(--color-on-surface-variant)]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-on-surface)] truncate max-w-[120px]">
                        {bill.service_name}
                      </h4>
                      <p className="text-[10px] text-[var(--color-on-surface-variant)] font-medium">
                        {format(parseISO(bill.next_billing_date!), 'dd MMMM', { locale: vi })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--color-on-surface)]">
                      {formatCurrency(bill.amount)}
                    </p>
                    <p className={`text-[10px] uppercase tracking-tighter ${statusColor}`}>
                      {statusText}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <button 
        onClick={() => window.location.href = '/dashboard/subscriptions'}
        className="mt-4 text-xs font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] flex items-center gap-1 transition-colors justify-center cursor-pointer"
      >
        Quản lý hóa đơn <ChevronRight size={14} />
      </button>
    </div>
  );
};
