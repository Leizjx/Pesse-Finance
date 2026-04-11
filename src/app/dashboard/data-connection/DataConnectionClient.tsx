"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AtSign, Landmark, Shield, Lock, Info, Plus, Mail, Loader2, Crown } from 'lucide-react';
import Image from 'next/image';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';
const DataConnectionModal = dynamic(() => import('@/components/dashboard/DataConnectionModal'), {
  loading: () => null,
});
import { useDataConnections } from '@/hooks/useDataConnections';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { DataConnection } from '@/types/database.types';

const banks = [
  { id: 'vcb', name: 'Vietcombank', logo: 'VCB', color: 'text-green-600', bg: 'bg-green-50', active: true },
  { id: 'tcb', name: 'Techcombank', logo: 'TCB', color: 'text-red-600', bg: 'bg-red-50', active: true },
  { id: 'mb', name: 'MB Bank', logo: 'MB', color: 'text-blue-600', bg: 'bg-blue-50', active: false },
  { id: 'tpb', name: 'TPBank', logo: 'TPB', color: 'text-purple-600', bg: 'bg-purple-50', active: false },
  { id: 'acb', name: 'ACB', logo: 'ACB', color: 'text-blue-500', bg: 'bg-blue-50', active: false },
  { id: 'vib', name: 'VIB', logo: 'VIB', color: 'text-orange-500', bg: 'bg-orange-50', active: false },
  { id: 'ctg', name: 'VietinBank', logo: 'CTG', color: 'text-blue-700', bg: 'bg-blue-50', active: false },
  { id: 'bidv', name: 'BIDV', logo: 'BIDV', color: 'text-teal-600', bg: 'bg-teal-50', active: false },
];

export default function DataConnectionClient() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const router = useRouter();
  const { data: connectedEmails, isLoading, deleteConnection, updateBanks } = useDataConnections();

  const [bankStates, setBankStates] = useState(banks);
  const [togglingBankId, setTogglingBankId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const [initialProvider, setInitialProvider] = useState('gmail');
  const [initialName, setInitialName] = useState('');
  const [initialSelectedBanks, setInitialSelectedBanks] = useState<string[]>([]);

  // Đồng bộ trạng thái toggle từ connection active đầu tiên trong DB
  useEffect(() => {
    if (!connectedEmails) return;
    const activeConn = connectedEmails.find(c => c.sync_status === 'active');
    if (activeConn?.selected_banks && activeConn.selected_banks.length > 0) {
      setBankStates(prev => prev.map(bank => ({
        ...bank,
        active: (activeConn.selected_banks as string[]).includes(bank.id),
      })));
    }
  }, [connectedEmails]);

  // If loading user profile, show skeleton
  if (isLoadingUser || !user) {
    return (
      <div className="flex-1 flex flex-col gap-6 h-full p-4 animate-pulse pt-8 pr-4">
        <div className="h-20 bg-black/10 rounded-full w-full"></div>
        <div className="h-48 bg-black/10 rounded-[2rem] w-full mt-6"></div>
        <div className="h-64 bg-black/10 rounded-[2rem] w-full mt-6"></div>
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
          className="neumorphic p-6 sm:p-8 md:p-12 rounded-[2rem] max-w-xl text-center flex flex-col items-center gap-6 mx-1"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center mb-2 shadow-lg">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold lg:font-extrabold text-[var(--color-on-surface)] flex items-center justify-center gap-3">
            Kết Nối Dữ Liệu <Crown className="text-yellow-500 fill-yellow-500" size={24} />
          </h2>
          <p className="text-[var(--color-on-surface-variant)] text-base lg:text-lg leading-relaxed">
            Tự động đồng bộ giao dịch từ hàng chục ngân hàng và ví điện tử, bảo mật tối đa với công nghệ mã hoá chuẩn quân đội. Tính năng này chỉ dành cho thành viên <strong>Premium</strong>.
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
  const openAddModal = () => {
    setModalMode('add');
    setInitialProvider('gmail');
    setInitialName('');
    setInitialSelectedBanks([]);
    setIsModalOpen(true);
  };

  const openEditModal = (conn: DataConnection) => {
    setModalMode('edit');
    setInitialProvider(conn.provider);
    setInitialName(conn.nickname || conn.email_address);
    setInitialSelectedBanks(conn.selected_banks || []);
    setIsModalOpen(true);
  };

  /**
   * Toggle ngân hàng – cập nhật local state NGAY LẬP TỨC (Optimistic UI),
   * sau đó lưu mảng selected_banks mới xuống Supabase.
   */
  const toggleBank = async (id: string) => {
    const activeConn = connectedEmails?.find(c => c.sync_status === 'active');
    const newStates = bankStates.map(bank =>
      bank.id === id ? { ...bank, active: !bank.active } : bank
    );
    setBankStates(newStates); // Optimistic update: UX phản hồi tức thì

    if (activeConn) {
      setTogglingBankId(id);
      const newSelectedBanks = newStates
        .filter(b => b.active)
        .map(b => b.id);
      try {
        await updateBanks({ connectionId: activeConn.id, selectedBanks: newSelectedBanks });
      } catch (err) {
        // Rollback nếu lỗi
        setBankStates(bankStates);
        console.error('Không thể cập nhật cài đặt ngân hàng:', err);
      } finally {
        setTogglingBankId(null);
      }
    }
  };

  const handleDisconnect = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn ngắt kết nối email này?')) {
      await deleteConnection(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pr-1 sm:pr-2 pb-24 lg:pb-10 relative">
      {/* Mobile Header */}
      <div className="flex xl:hidden items-center justify-between w-full mb-8 mt-1 sm:mt-2 px-1">
        <h1 className="text-2xl font-extrabold text-[var(--color-on-surface)] tracking-tighter">Kết nối dữ liệu</h1>
        <div className="flex items-center gap-5">
          <NotificationBell />
          <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center overflow-hidden border-2 border-[var(--color-surface)] shrink-0">
            <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.full_name || 'User'}`} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" unoptimized />
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 mt-2 xl:mt-8">
        {/* Left Column: Main Content */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="hidden xl:block">
            <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-on-surface)] tracking-tighter mb-4">
              Kết nối dữ liệu
            </h1>
            <p className="text-base text-[var(--color-on-surface-variant)] font-medium max-w-2xl">
              Tự động hóa việc theo dõi tài chính bằng cách kết nối an toàn với các tài khoản ngân hàng và email của bạn.
            </p>
          </div>

          <p className="xl:hidden text-base text-[var(--color-on-surface-variant)] font-bold opacity-80 mb-4 px-1">
            Tự động theo dõi tài chính an toàn qua Email & Ngân hàng.
          </p>

          {/* Email List */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <AtSign size={24} className="text-[var(--color-primary)] stroke-[2.5]" />
              <h2 className="text-xl font-black text-[var(--color-on-surface)] uppercase tracking-tight">Email kết nối</h2>
            </div>
            <div className="flex flex-col gap-4">
              {isLoading ? (
                <div className="text-center py-4 text-sm font-medium text-[var(--color-on-surface-variant)] animate-pulse">Đang tải danh sách kết nối...</div>
              ) : connectedEmails?.length === 0 ? (
                <div className="neumorphic p-6 rounded-large text-center text-sm font-medium text-[var(--color-on-surface-variant)]">
                  Chưa có kết nối nào. Hãy tạo một kết nối mới!
                </div>
              ) : (
                connectedEmails?.map((conn) => {
                  const isGmail = conn.provider === 'gmail';
                  return (
                    <div key={conn.id} onClick={() => openEditModal(conn)} className="neumorphic p-5 sm:p-6 rounded-large flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/5 cursor-pointer transition-colors relative group mx-1">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isGmail ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'} shadow-inner shrink-0`}>
                          <Mail size={20} />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors leading-tight">
                            {conn.nickname || conn.email_address}
                          </h3>
                          <p className="text-sm font-bold text-[var(--color-on-surface-variant)] mt-1 opacity-70">
                            {conn.email_address}
                            {conn.sync_status === 'syncing' ? ' • Đang đồng bộ...' :
                              conn.last_sync_at ? ` • ${formatDistanceToNow(new Date(conn.last_sync_at), { addSuffix: true, locale: vi })}` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDisconnect(e, conn.id)}
                        className="text-sm font-black text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest cursor-pointer mt-2 sm:mt-0"
                      >
                        Ngắt kết nối
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Bank Filters */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Landmark size={24} className="text-[var(--color-primary)] stroke-[2.5]" />
              <h2 className="text-xl font-black text-[var(--color-on-surface)] uppercase tracking-tight">Ngân hàng đã lọc</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bankStates.map((bank) => (
                <div key={bank.id} className="neumorphic p-6 sm:p-8 rounded-large flex flex-col items-center justify-center gap-6 mx-1">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${bank.bg} ${bank.color} shadow-inner font-black text-2xl border border-[var(--color-on-surface-variant)]/5`}>
                    {bank.logo}
                  </div>
                  <h3 className="font-black text-xl text-[var(--color-on-surface)]">{bank.name}</h3>

                  {/* Toggle Switch với loading state */}
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => toggleBank(bank.id)}
                      disabled={togglingBankId === bank.id}
                      className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed ${bank.active ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface)] neumorphic-pressed'
                        }`}
                    >
                      <motion.div
                        layout
                        className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center"
                        animate={{ x: bank.active ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </button>
                    {/* Micro-label: trạng thái đang lưu */}
                    {togglingBankId === bank.id ? (
                      <span className="flex items-center gap-2 text-sm font-black text-[var(--color-on-surface-variant)] animate-pulse">
                        <Loader2 size={12} className="animate-spin" />
                        Đang lưu...
                      </span>
                    ) : (
                      <span className={`text-sm font-black uppercase tracking-widest ${bank.active ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] opacity-50'
                        }`}>
                        {bank.active ? 'Đang QUÉT' : 'Tắt'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>


        <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
          {/* Security Card */}
          <div className="neumorphic p-6 sm:p-8 rounded-[32px] flex flex-col gap-6 mx-1">
            <div className="w-14 h-14 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-surface)] shadow-md">
              <Shield size={24} />
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-on-surface)] leading-tight">
              Chúng tôi bảo vệ tài chính của bạn
            </h3>
            <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
              Chúng tôi chỉ đọc email thông báo số dư từ ngân hàng thông qua bộ lọc thông minh. <span className="font-bold text-[var(--color-on-surface)]">Tuyệt đối</span> không yêu cầu hay lưu trữ mật khẩu ngân hàng của bạn.
            </p>
            <div className="mt-4 pt-6 border-t border-on-surface-variant/10 flex items-center gap-3">
              <Lock size={16} className="text-[var(--color-primary)] shrink-0" />
              <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Mã hóa AES-256 chuẩn quân đội</span>
            </div>
          </div>

          {/* Info Card */}
          <div className="neumorphic-pressed p-6 rounded-large flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[var(--color-on-surface)] text-[var(--color-surface)] flex items-center justify-center">
                <Info size={14} />
              </div>
              <h4 className="font-bold text-[var(--color-on-surface)]">Bạn có biết?</h4>
            </div>
            <p className="text-sm text-[var(--color-on-surface-variant)] italic leading-relaxed">
              Kết nối email giúp Pesse tự động phân loại đến 90% giao dịch hàng ngày của bạn mà không cần nhập liệu thủ công.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-32 right-4 xl:bottom-10 xl:right-10 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-lg flex items-center gap-2 hover:shadow-xl transition-shadow cursor-pointer text-sm sm:text-base"
        >
          <Plus size={20} />
          Thêm nguồn dữ liệu mới
        </motion.button>
      </div>
      <DataConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banks={banks}
        mode={modalMode}
        initialProvider={initialProvider}
        initialName={initialName}
        initialSelectedBanks={initialSelectedBanks}
      />
    </div>
  );
}
