"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions, useSyncSubscriptions } from '@/hooks/useSubscriptions';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Crown, RefreshCcw, Calendar, CreditCard, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SyncResultModal } from '@/components/ai/SyncResultModal';
import { AddManualSubscriptionModal } from '@/components/dashboard/AddManualSubscriptionModal';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { AddTransactionModal } from '@/components/ai/AddTransactionModal';
import { NotificationBell } from '@/components/ai/NotificationBell';

export default function SubscriptionsClient() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const router = useRouter();
  
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  
  const { data: subscriptions = [], isLoading: isLoadingSubs } = useSubscriptions();
  const syncMutation = useSyncSubscriptions();

  if (isLoadingUser || !user) {
    return (
      <div className="flex-1 flex flex-col gap-6 h-full p-4 animate-pulse pt-8 pr-4">
         <div className="h-20 bg-black/10 rounded-full w-full"></div>
         <div className="h-48 bg-black/10 rounded-[2rem] w-full mt-6"></div>
         <div className="h-64 bg-black/10 rounded-[2rem] w-full mt-6"></div>
      </div>
    );
  }

  if (user.plan_type !== 'premium') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full min-h-[500px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neumorphic p-8 md:p-12 rounded-[2rem] max-w-xl text-center flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center mb-2 shadow-lg">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold lg:font-extrabold text-[var(--color-on-surface)] flex items-center justify-center gap-3">
            Hóa Đơn Tài Chính <Crown className="text-yellow-500 fill-yellow-500" size={24} />
          </h2>
          <p className="text-[var(--color-on-surface-variant)] text-base lg:text-lg leading-relaxed">
            Tự động theo dõi các dịch vụ đăng ký, nhận thông báo ngày hết hạn và quản lý chi phí định kỳ chuyên nghiệp dành cho thành viên <strong>Premium</strong>.
          </p>
          <button
            onClick={() => router.push('/dashboard/premium')}
            aria-label="Nâng Cấp Premium Ngay"
            className="mt-6 px-10 py-4 bg-[var(--color-primary)] text-black font-bold text-lg rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg hover:shadow-xl w-full sm:w-auto cursor-pointer"
          >
            <Crown size={22} className="fill-black" />
            Nâng Cấp Premium Ngay
          </button>
        </motion.div>
      </div>
    );
  }

  const handleSync = () => {
    syncMutation.mutate();
  };

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    let monthlyCost = sub.amount;
    if (sub.billing_cycle === 'yearly') {
      monthlyCost = sub.amount / 12;
    }
    if (sub.currency === 'USD') monthlyCost *= 25000;
    return acc + monthlyCost;
  }, 0);

  return (
    <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-28 lg:pb-10 relative">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 shrink-0 mt-4 sm:mt-6 mb-4 px-1">
        <div className="flex items-center justify-between w-full xl:w-auto">
          <h1 className="text-2xl lg:text-3xl font-black lg:font-extrabold text-[var(--color-on-surface)] tracking-tighter">Hóa đơn tài chính</h1>
          <div className="flex xl:hidden items-center gap-5">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleSync}
            disabled={syncMutation.isPending}
            aria-label="Quét hóa đơn từ Email"
            className="flex items-center gap-3 px-6 lg:px-8 py-3.5 lg:py-3 rounded-full bg-[var(--color-primary)] text-black text-xs lg:text-sm font-black lg:font-extrabold shadow-xl hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
          >
            <RefreshCcw size={18} className={`stroke-[3] ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Đang quét...' : 'Quét hóa đơn từ Email'}
          </button>
          
          <div className="hidden xl:flex items-center gap-4 ml-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        <div className="neumorphic p-8 lg:p-10 rounded-large flex flex-col justify-between h-44 lg:h-40 border border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-xs lg:text-sm font-black lg:font-extrabold text-[var(--color-on-surface-variant)] uppercase tracking-widest opacity-60">Chi phí trung bình tháng</span>
            <CreditCard size={24} className="text-[var(--color-primary)]/40 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black lg:font-extrabold text-[var(--color-on-surface)] tracking-tighter">{formatCurrency(totalMonthly)}</h2>
        </div>
        
        <div className="neumorphic p-8 lg:p-10 rounded-large flex flex-col justify-between h-44 lg:h-40 border border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-xs lg:text-sm font-black lg:font-extrabold text-[var(--color-on-surface-variant)] uppercase tracking-widest opacity-60">Đang theo dõi</span>
            <Calendar size={24} className="text-[var(--color-primary)]/40 stroke-[2.5]" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black lg:font-extrabold text-[var(--color-on-surface)] tracking-tighter">{subscriptions.length} <span className="text-lg lg:text-xl font-bold lg:font-semibold text-[var(--color-on-surface-variant)] opacity-60 ml-2">DỊCH VỤ</span></h2>
        </div>
      </div>

      <div className="neumorphic p-8 rounded-[2rem] flex-1 mb-10 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-10 shrink-0">
          <h3 className="font-black lg:font-extrabold text-xl lg:text-lg text-[var(--color-on-surface)] tracking-tight">Danh sách hóa đơn</h3>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            aria-label="Thêm thủ công"
            className="text-xs lg:text-sm font-black lg:font-extrabold text-[var(--color-primary)] hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer uppercase tracking-widest"
          >
            <Plus size={18} className="stroke-[3]" /> Thêm thủ công
          </button>
        </div>
        
        {isLoadingSubs ? (
           <div className="flex-1 flex items-center justify-center py-20 text-[var(--color-on-surface-variant)]">Đang tải hóa đơn...</div>
        ) : subscriptions.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center text-[var(--color-on-surface-variant)]">
                 <Calendar size={40} />
              </div>
              <div className="max-w-xs">
                <p className="font-bold text-[var(--color-on-surface)]">Chưa có dữ liệu hóa đơn</p>
                <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Kết nối Gmail hoặc thêm thủ công để bắt đầu theo dõi các dịch vụ định kỳ.</p>
              </div>
           </div>
        ) : (
            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              {subscriptions.map((sub) => (
                <motion.div 
                  key={sub.id}
                  layout
                  className="neumorphic p-6 rounded-3xl flex flex-col gap-4 border border-transparent hover:border-[var(--color-primary)]/20 transition-all group relative overflow-hidden h-fit"
                >
                  <div className="flex items-center gap-5">
                      <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[var(--color-surface)] neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0 font-black text-xl lg:text-2xl shadow-inner border border-white/10">
                         {sub.service_name.toLowerCase().includes('netflix') ? 'N' : 
                          sub.service_name.toLowerCase().includes('spotify') ? 'S' : 
                          sub.service_name.toLowerCase().includes('google') ? 'G' : sub.service_name[0]}
                      </div>
                      <div className="overflow-hidden">
                         <h4 className="font-black lg:font-bold text-lg lg:text-base text-[var(--color-on-surface)] truncate tracking-tight mb-1">{sub.service_name}</h4>
                         <p className="text-[10px] font-black font-extrabold text-[var(--color-on-surface-variant)] uppercase tracking-[0.15em] opacity-60 px-2 py-0.5 rounded-md bg-white/5 w-fit">{sub.billing_cycle === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}</p>
                      </div>
                  </div>

                  <div className="mt-4">
                     <p className="text-2xl lg:text-3xl font-black lg:font-extrabold text-[var(--color-on-surface)] tracking-tighter mb-2">{formatCurrency(sub.amount)}</p>
                     <p className="text-[10px] lg:text-[11px] text-[var(--color-on-surface-variant)] font-extrabold mb-4 opacity-50 uppercase tracking-widest">Giao dịch gần nhất: 
                        <span className="font-black lg:font-bold text-[var(--color-on-surface)] ml-1"> {sub.last_billing_date ? formatDate(sub.last_billing_date) : 'N/A'}</span>
                     </p>
                     <p className="flex justify-between items-center bg-red-500/15 p-3.5 lg:p-4 rounded-2xl border border-red-500/20 shadow-inner">
                        <span className="font-black text-red-500 text-[10px] lg:text-xs uppercase tracking-tight">Hết hạn tiếp:</span>
                        <span className="font-black lg:font-extrabold text-red-500 text-base lg:text-lg tracking-tight">{formatDate(sub.next_billing_date)}</span>
                     </p>
                  </div>
                </motion.div>
              ))}
            </div>
         )}
      </div>

      <SyncResultModal 
        isOpen={syncMutation.isSuccess} 
        onClose={() => syncMutation.reset()} 
        message={`Đã đồng bộ thành công ${syncMutation.data?.synced || 0} hóa đơn tài chính mới từ hòm thư của bạn.`}
      />

      <AddManualSubscriptionModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
