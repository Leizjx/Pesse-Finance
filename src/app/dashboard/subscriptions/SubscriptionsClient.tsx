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
          <h2 className="text-3xl font-bold text-[var(--color-on-surface)] flex items-center justify-center gap-3">
            Hóa Đơn Tài Chính <Crown className="text-yellow-500 fill-yellow-500" size={28} />
          </h2>
          <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed">
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
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 mt-2 mb-2">
        <div className="flex items-center justify-between w-full xl:w-auto">
          <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Hóa đơn tài chính</h1>
          <div className="flex xl:hidden items-center gap-4">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleSync}
            disabled={syncMutation.isPending}
            aria-label="Quét hóa đơn từ Email"
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-on-surface)] text-sm font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer disabled:opacity-50"
          >
            <RefreshCcw size={16} className={syncMutation.isPending ? 'animate-spin' : ''} />
            {syncMutation.isPending ? 'Đang quét...' : 'Quét hóa đơn từ Email'}
          </button>
          
          <div className="hidden xl:flex items-center gap-4 ml-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
        <div className="neumorphic p-8 rounded-large flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Chi phí trung bình tháng</span>
            <CreditCard size={24} className="text-[var(--color-primary)]/40" />
          </div>
          <h2 className="text-4xl font-bold text-[var(--color-on-surface)]">{formatCurrency(totalMonthly)}</h2>
        </div>
        
        <div className="neumorphic p-8 rounded-large flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Hóa đơn đang theo dõi</span>
            <Calendar size={24} className="text-[var(--color-primary)]/40" />
          </div>
          <h2 className="text-4xl font-bold text-[var(--color-on-surface)]">{subscriptions.length} <span className="text-lg font-medium text-[var(--color-on-surface-variant)]">dịch vụ</span></h2>
        </div>
      </div>

      <div className="neumorphic p-8 rounded-[2rem] flex-1 mb-10 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h3 className="font-bold text-xl text-[var(--color-on-surface)]">Danh sách hóa đơn</h3>
          <button 
            onClick={() => setIsManualModalOpen(true)}
            aria-label="Thêm thủ công"
            className="text-sm font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus size={16} /> Thêm thủ công
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
                  <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface)] neumorphic flex items-center justify-center text-[var(--color-on-surface)] shrink-0">
                        {sub.service_name.toLowerCase().includes('netflix') ? 'N' : 
                         sub.service_name.toLowerCase().includes('spotify') ? 'S' : 
                         sub.service_name.toLowerCase().includes('google') ? 'G' : sub.service_name[0]}
                     </div>
                     <div className="overflow-hidden">
                        <h4 className="font-bold text-lg text-[var(--color-on-surface)] truncate">{sub.service_name}</h4>
                        <p className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">{sub.billing_cycle === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}</p>
                     </div>
                  </div>

                  <div className="mt-2">
                     <p className="text-2xl font-bold text-[var(--color-on-surface)]">{formatCurrency(sub.amount)}</p>
                     <p className="text-xs text-[var(--color-on-surface-variant)] font-medium mt-1">Giao dịch gần nhất: 
                        <span className="font-medium"> {sub.last_billing_date ? formatDate(sub.last_billing_date) : 'N/A'}</span>
                     </p>
                     <p className="flex justify-between items-center bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 mt-1">
                        <span className="font-bold text-red-400">Ngày gia hạn tiếp:</span>
                        <span className="font-bold text-red-400">{formatDate(sub.next_billing_date)}</span>
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
