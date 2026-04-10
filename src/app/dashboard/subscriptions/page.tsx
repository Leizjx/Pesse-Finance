"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions, useSyncSubscriptions } from '@/hooks/useSubscriptions';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Crown, RefreshCcw, Calendar, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Image from 'next/image';
import { SyncResultModal } from '@/components/ai/SyncResultModal';
import { AddManualSubscriptionModal } from '@/components/dashboard/AddManualSubscriptionModal';
import { Plus } from 'lucide-react';

export default function SubscriptionsPage() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const router = useRouter();
  
  const [showNoDataModal, setShowNoDataModal] = React.useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = React.useState(false);
  
  const { data: subscriptions = [], isLoading: isLoadingSubs } = useSubscriptions();
  const syncMutation = useSyncSubscriptions();

  // If loading user profile, show skeleton
  if (isLoadingUser || !user) {
    return (
      <div className="flex-1 flex flex-col gap-6 h-full p-4 animate-pulse pt-8 pr-4">
         <div className="h-20 bg-black/10 rounded-full w-full"></div>
         <div className="h-48 bg-black/10 rounded-extra-large w-full mt-6"></div>
         <div className="h-64 bg-black/10 rounded-extra-large w-full mt-6"></div>
      </div>
    );
  }

  // If not Premium, show locked state
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
            Tính Năng Giới Hạn <Crown className="text-yellow-500 fill-yellow-500" size={28} />
          </h2>
          <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed">
            Quản lý Đăng Ký (Subscriptions) tự động quét hóa đơn từ Gmail và quản lý chu kỳ gia hạn, tính năng này chỉ dành riêng cho thành viên <strong>Premium</strong>.
          </p>
          <button
            onClick={() => router.push('/dashboard/premium')}
            className="mt-6 px-10 py-4 bg-[var(--color-primary)] text-black font-bold text-lg rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg hover:shadow-xl w-full sm:w-auto cursor-pointer"
          >
            <Crown size={22} className="fill-black" />
            Nâng Cấp Premium Ngay
          </button>
        </motion.div>
      </div>
    );
  }

  // Premium View Logic
  const totalMonthly = subscriptions.reduce((acc, sub) => {
    let monthlyCost = sub.amount;
    if (sub.billing_cycle === 'yearly') {
      monthlyCost = sub.amount / 12;
    }
    // Very rough base conversion if not VND
    if (sub.currency === 'USD') monthlyCost *= 25000;
    
    return acc + monthlyCost;
  }, 0);

  const handleSync = () => {
    syncMutation.mutate(undefined, {
      onSuccess: (data) => {
        if (data.synced === 0) {
          setShowNoDataModal(true);
        }
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-32 lg:pb-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-start justify-between shrink-0 mb-10 mt-2 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-on-surface)] tracking-tight mb-2 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
               <Calendar size={24} />
            </div>
            Quản Lý <span className="text-[var(--color-primary)]">Gói Đăng Ký</span>
          </h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] font-medium">
            Theo dõi và tự động hoá phân tích các loại hoá đơn dịch vụ (Netflix, Spotify...) từ Gmail.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-start">
           <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3.5 bg-[var(--color-surface)] text-[var(--color-on-surface)] font-bold rounded-2xl neumorphic hover:bg-[var(--color-surface)]/80 transition-all cursor-pointer border border-white/5"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Thêm thủ công</span>
            <span className="sm:hidden text-xs">Thủ công</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSync}
            disabled={syncMutation.isPending}
            className="flex items-center gap-2 px-6 py-3.5 bg-[var(--color-primary)] text-black font-bold rounded-2xl shadow-lg hover:bg-[var(--color-primary)]/90 transition-all cursor-pointer disabled:opacity-70"
          >
            {syncMutation.isPending ? (
              <RefreshCcw size={18} className="animate-spin" />
            ) : (
              <RefreshCcw size={18} />
            )}
            <span>{syncMutation.isPending ? 'Đang quét...' : 'Đồng bộ'}</span>
          </motion.button>
        </div>
      </header>

      {syncMutation.isError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-standard font-medium flex items-center justify-center shrink-0 text-center"
        >
          {syncMutation.error.message}
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
         <div className="neumorphic rounded-standard p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <CreditCard size={32} />
            </div>
            <div>
              <p className="text-[var(--color-on-surface-variant)] font-medium text-sm">Tổng Chi Phí Thực Tế (Mỗi tháng)</p>
              <h2 className="text-3xl md:text-4xl font-bold font-sans mt-2 tracking-tight">
                {formatCurrency(totalMonthly)}
              </h2>
            </div>
         </div>
         <div className="neumorphic rounded-standard p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0">
               <span className="text-2xl font-bold font-sans">{subscriptions.length}</span>
            </div>
            <div>
              <p className="text-[var(--color-on-surface-variant)] font-medium text-sm">Dịch Vụ Đang Theo Dõi</p>
              <p className="text-2xl mt-2 font-medium">Hoạt động trơn tru</p>
            </div>
         </div>
      </div>

      {/* Detail List */}
      <div className="neumorphic rounded-[2rem] p-6 lg:p-8 flex-1 min-h-[400px]">
         <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            Danh sách Dịch vụ 
            <span className="text-sm font-normal px-3 py-1 bg-[var(--color-surface)] rounded-full text-[var(--color-on-surface-variant)]">{subscriptions.length} mục</span>
         </h3>
         
         {isLoadingSubs ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCcw size={32} className="animate-spin text-[var(--color-on-surface-variant)]" />
            </div>
         ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-64 border-2 border-dashed border-[var(--color-on-surface-variant)]/20 rounded-standard">
               <div className="w-20 h-20 bg-[var(--color-surface)] rounded-full flex items-center justify-center mb-6">
                 <Calendar size={36} className="text-[var(--color-on-surface-variant)]" />
               </div>
               <p className="text-[var(--color-on-surface)] text-xl font-bold">Chưa tìm thấy dịch vụ nào</p>
               <p className="text-[var(--color-on-surface-variant)] mt-2 max-w-sm">
                 Nhấn "Đồng bộ hoá đơn" ở trên để quét hòm thư Gmail và bắt đầu tự động hóa theo dõi dịch vụ.
               </p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {subscriptions.map((sub) => (
                <motion.div 
                  key={sub.id}
                  whileHover={{ y: -6 }}
                  className="p-6 rounded-standard bg-[var(--color-background)] border border-white/5 relative overflow-hidden flex flex-col justify-between shadow-md hover:shadow-lg transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      {sub.logo_url ? (
                        <div className="w-14 h-14 rounded-[1.2rem] overflow-hidden bg-white shrink-0 shadow-sm relative flex items-center justify-center p-2.5">
                           <Image src={sub.logo_url} alt={sub.service_name} fill className="object-contain p-2" unoptimized />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 shadow-sm">
                           <span className="font-bold text-2xl text-white">{sub.service_name[0]}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-xl">{sub.service_name}</h4>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block mt-1.5 ${sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-[var(--color-surface)] p-4 rounded-[1rem] border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-on-surface-variant)] text-sm">Mức phí</span>
                      <strong className="text-xl text-[var(--color-primary)]">
                        {sub.currency === 'VND' ? formatCurrency(sub.amount) : `${sub.currency} ${sub.amount}`}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--color-on-surface-variant)]">Chu kỳ lặp</span>
                      <span className="font-medium bg-black/20 px-2 py-0.5 rounded-md text-[var(--color-on-surface)]">
                        {sub.billing_cycle === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                      </span>
                   </div>
                  </div>

                  <div className="pt-5 border-t border-white/10 flex flex-col gap-2 text-sm">
                     <p className="flex justify-between items-center text-[var(--color-on-surface-variant)]">
                        <span>Lần thanh toán cuối:</span>
                        <span className="font-medium">{sub.last_billing_date ? formatDate(sub.last_billing_date) : 'N/A'}</span>
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
        isOpen={showNoDataModal} 
        onClose={() => setShowNoDataModal(false)}
        message="Không có hóa đơn đến hạn cần thanh toán trong hòm thư của bạn."
      />

      <AddManualSubscriptionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
}
