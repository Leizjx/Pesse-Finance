"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CarFront, Coffee, AlertTriangle, Plus, X, ShoppingBag, 
  Home, HeartPulse, GraduationCap, Zap, HelpCircle, Calendar as CalendarIcon, 
  Trash2, Crown, ArrowRight, Banknote, TrendingUp, ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/ai/NotificationBell';
import { UserMenu } from '@/components/dashboard/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { useBudgets, useCreateBudget, useDeleteBudget } from '@/hooks/useTransactions';
import type { TransactionCategory } from '@/types/database.types';
import { TRANSACTION_CATEGORIES } from '@/types/database.types';
import { formatCurrency } from '@/lib/utils';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

const CATEGORY_META: Record<string, { label: string; icon: any; color: string }> = {
  food:          { label: 'Ăn uống',   icon: Coffee, color: '#f59e0b' },
  transport:     { label: 'Di chuyển', icon: CarFront, color: '#3b82f6' },
  health:        { label: 'Sức khỏe',  icon: HeartPulse, color: '#ef4444' },
  shopping:      { label: 'Mua sắm',   icon: ShoppingBag, color: '#ec4899' },
  rent:          { label: 'Nhà ở',     icon: Home, color: '#8b5cf6' },
  education:     { label: 'Học tập',   icon: GraduationCap, color: '#10b981' },
  utilities:     { label: 'Tiện ích',  icon: Zap, color: '#eab308' },
  entertainment: { label: 'Giải trí',  icon: Zap, color: '#6366f1' },
  salary:        { label: 'Lương',     icon: Banknote, color: '#22c55e' },
  investment:    { label: 'Đầu tư',    icon: TrendingUp, color: '#f59e0b' },
  insurance:     { label: 'Bảo hiểm',  icon: ShieldCheck, color: '#6366f1' },
  other:         { label: 'Khác',      icon: HelpCircle, color: '#9ca3af' },
};

export default function BudgetClient() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const router = useRouter(); 
  const { data: budgets = [], isLoading } = useBudgets();
  const createBudgetInfo = useCreateBudget();
  const deleteBudgetInfo = useDeleteBudget();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [budgetLimit, setBudgetLimit] = useState('');
  
  const [budgetDate, setBudgetDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoadingUser || !user) {
    return (
      <div className="flex-1 flex flex-col gap-6 h-full p-4 animate-pulse pt-8">
         <div className="h-20 bg-black/10 rounded-full w-full"></div>
         <div className="h-48 bg-black/10 rounded-[2rem] w-full mt-6"></div>
         <div className="h-64 bg-black/10 rounded-[2rem] w-full mt-6"></div>
      </div>
    );
  }

  const openCreateModal = () => {
    if (user.plan_type !== 'premium' && budgets.length >= 3) {
      setIsPremiumModalOpen(true);
      return;
    }
    setModalMode('create');
    setCategory('food');
    setBudgetLimit('');
    setSelectedBudget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (budget: any) => {
    setModalMode('edit');
    setCategory(budget.category);
    setBudgetLimit(budget.limit_amount.toLocaleString('vi-VN'));
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const rawLimit = Number(budgetLimit.replace(/\D/g, ''));
    if (!rawLimit || rawLimit <= 0) return;

    if (modalMode === 'create') {
      createBudgetInfo.mutate({
        category,
        limit_amount: rawLimit,
        period: 'monthly'
      }, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleDelete = () => {
    if (selectedBudget) {
      deleteBudgetInfo.mutate(selectedBudget.id, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit_amount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent_amount, 0);
  const overalPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const clampedPercentage = Math.min(Math.max(overalPercentage, 0), 100);

  return (
    <div className="flex-1 flex flex-col gap-8 h-full overflow-y-auto pr-2 pb-24 relative">
      <header className="flex items-center justify-between shrink-0 mt-2 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-on-surface)] truncate">Ngân sách</h1>
          {user.plan_type !== 'premium' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--color-on-surface-variant)]">Sử dụng:</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full neumorphic text-[10px] font-black text-[var(--color-primary)] uppercase tracking-wider">
                {budgets.length}/3 Ngân sách
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <NotificationBell />
          <UserMenu />
        </div>
      </header>

      <motion.div 
        layout
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 shrink-0"
      >
        {isLoading ? (
          <div className="neumorphic rounded-large h-48 animate-pulse p-8 md:col-span-2" />
        ) : budgets.length === 0 ? (
          <div className="md:col-span-2 flex flex-col items-center justify-center py-20 text-center gap-4 neumorphic rounded-large">
            <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center text-[var(--color-on-surface-variant)]">
               <HelpCircle size={40} />
            </div>
            <div className="max-w-xs">
              <p className="font-bold text-[var(--color-on-surface)]">Chưa thiết lập ngân sách</p>
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Hãy tạo ngân sách đầu tiên để kiểm soát chi tiêu tốt hơn.</p>
            </div>
          </div>
        ) : (
          budgets.map(budget => {
            const catKey = (budget.category || '').toLowerCase();
            const meta = CATEGORY_META[catKey] || { label: 'Khác', icon: HelpCircle, color: '#9ca3af' };
            const Icon = meta.icon;
            const percentage = (budget.spent_amount / budget.limit_amount) * 100;
            const validPercentage = Math.min(Math.max(percentage, 0), 100);
            const isOver = budget.spent_amount > budget.limit_amount;
            
            return (
              <motion.div 
                key={budget.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.95 },
                  visible: { opacity: 1, scale: 1 }
                }}
                onClick={() => openEditModal(budget)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="neumorphic p-8 rounded-large flex flex-col gap-8 relative cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block">Tháng này</span>
                    <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">{meta.label}</h2>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: meta.color + '20', color: meta.color }}>
                    <Icon size={28} />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm font-medium text-[var(--color-on-surface-variant)] mb-4">
                    <span>Đã chi: {formatCurrency(budget.spent_amount)}</span>
                    <span>Ngân sách: {formatCurrency(budget.limit_amount)}</span>
                  </div>
                  <div className="h-4 w-full bg-[var(--color-surface)] rounded-full neumorphic-pressed overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${validPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: isOver ? 'var(--color-error)' : meta.color }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  {isOver ? (
                    <div className="flex items-center gap-2 text-[var(--color-error)]">
                      <AlertTriangle size={18} />
                      <span className="text-sm font-bold">Vượt mức</span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-[var(--color-on-surface-variant)]">Còn lại</span>
                  )}
                  <span className={`text-xl font-bold ${isOver ? 'text-[var(--color-error)]' : 'text-[#65a30d]'}`}>
                    {formatCurrency(Math.abs(budget.limit_amount - budget.spent_amount))}
                  </span>
                </div>
              </motion.div>
            )
          })
        )}
      </motion.div>

      <div className="neumorphic p-10 rounded-large flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-[var(--color-on-surface)] mb-4">Tình hình chi tiêu</h2>
          <p className="text-[var(--color-on-surface-variant)] leading-relaxed mb-10 max-w-lg text-lg">
            Bạn đã sử dụng {Math.round(clampedPercentage)}% tổng ngân sách tháng này. Hãy cân nhắc điều chỉnh các khoản chi không cần thiết để duy trì kế hoạch tài chính.
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <div>
              <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider block mb-2">Tổng ngân sách</span>
              <span className="text-2xl font-bold text-[var(--color-on-surface)]">{formatCurrency(totalLimit)}</span>
            </div>
            <div className="hidden sm:block w-px h-12 bg-on-surface-variant/20"></div>
            <div className="sm:hidden h-px w-full bg-on-surface-variant/20"></div>
            <div>
              <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider block mb-2">Đang khả dụng</span>
              <span className="text-2xl font-bold text-[#65a30d]">{formatCurrency(Math.max(0, totalLimit - totalSpent))}</span>
            </div>
          </div>
        </div>
        
        <div className="relative w-64 h-64 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="40" 
              fill="transparent" 
              stroke="var(--color-surface)" 
              strokeWidth="12" 
            />
            {totalLimit > 0 && (
              <motion.circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="var(--color-primary)" 
                strokeWidth="12" 
                strokeLinecap="round"
                strokeDasharray="251.2"
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * (clampedPercentage / 100)) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-[var(--color-on-surface)] mb-1">{Math.round(clampedPercentage)}%</span>
            <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">Sử dụng</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-32 left-0 right-0 flex justify-center pointer-events-none z-40 lg:absolute lg:bottom-4 lg:z-10">
        <motion.button 
          onClick={openCreateModal}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Thiết lập ngân sách mới"
          className="neumorphic px-8 py-5 rounded-full flex items-center gap-4 pointer-events-auto shadow-lg cursor-pointer bg-[var(--color-surface)]"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-surface)] shadow-sm">
            <Plus size={24} />
          </div>
          <span className="font-bold text-lg text-[var(--color-on-surface)]">Thiết lập ngân sách mới</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[450px] bg-[var(--color-surface)] rounded-[40px] p-8 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">
                  {modalMode === 'create' ? 'Thiết lập ngân sách' : 'Chỉnh sửa Ngân sách'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Đóng"
                  className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block">Danh mục</label>
                  <div className="neumorphic-pressed rounded-standard px-4 h-12 flex items-center">
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                      disabled={modalMode === 'edit'}
                      className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-medium appearance-none cursor-pointer disabled:opacity-50"
                    >
                      {TRANSACTION_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {CATEGORY_META[cat]?.label || cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block">Hạn mức</label>
                  <div className="neumorphic-pressed rounded-standard px-4 py-3 flex items-center">
                    <input 
                      type="text" 
                      inputMode="numeric"
                      value={budgetLimit}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '');
                        if (!rawValue) {
                          setBudgetLimit('');
                        } else {
                          setBudgetLimit(Number(rawValue).toLocaleString('vi-VN'));
                        }
                      }}
                      placeholder="0"
                      className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-medium"
                    />
                    <span className="text-[var(--color-on-surface-variant)] font-bold ml-2">VND</span>
                  </div>
                </div>

                <div className="relative" ref={calendarRef}>
                  <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block">Thời gian áp dụng</label>
                  <button 
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    aria-label="Chọn ngày áp dụng"
                    className="w-full neumorphic-pressed rounded-standard px-4 py-3 flex items-center justify-between text-[var(--color-on-surface)] font-medium cursor-pointer"
                  >
                    <span>{budgetDate ? format(budgetDate, 'dd/MM/yyyy') : 'Chọn ngày'}</span>
                    <CalendarIcon size={18} className="text-[var(--color-on-surface-variant)]" />
                  </button>
                  
                  <AnimatePresence>
                    {isCalendarOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 bg-[var(--color-surface)] neumorphic p-4 rounded-large z-50 shadow-xl"
                      >
                        <DayPicker 
                          mode="single"
                          selected={budgetDate}
                          onSelect={(date) => {
                            setBudgetDate(date);
                            setIsCalendarOpen(false);
                          }}
                          locale={vi}
                          modifiersClassNames={{
                            selected: 'bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold rounded-full',
                            today: 'font-bold text-[var(--color-primary)]',
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button 
                  onClick={handleSave}
                  disabled={createBudgetInfo.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold text-base py-4 rounded-full shadow-sm mt-4 cursor-pointer disabled:opacity-50"
                >
                  {createBudgetInfo.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </motion.button>

                {modalMode === 'edit' && (
                  <button 
                    onClick={handleDelete}
                    disabled={deleteBudgetInfo.isPending}
                    className="flex items-center justify-center gap-2 text-[var(--color-error)] text-sm font-bold mt-2 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    {deleteBudgetInfo.isPending ? 'Đang xóa...' : 'Xóa ngân sách này'}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPremiumModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPremiumModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[60]"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[var(--color-surface)] rounded-[40px] p-8 z-[70] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mb-6 shadow-inner">
                  <Crown size={40} className="fill-current" />
                </div>
                
                <h2 className="text-2xl font-black text-[var(--color-on-surface)] mb-3 tracking-tight">Giới hạn ngân sách</h2>
                <p className="text-[var(--color-on-surface-variant)] font-medium mb-8 leading-relaxed">
                  Gói <span className="text-[var(--color-on-surface)] font-bold">Cơ bản</span> giới hạn tối đa 3 ngân sách. Hãy nâng cấp lên Premium để quản lý không giới hạn!
                </p>
                
                <div className="flex flex-col w-full gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard/premium')}
                    className="w-full bg-[var(--color-primary)] text-black font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    Nâng cấp ngay <ArrowRight size={18} />
                  </motion.button>
                  
                  <button 
                    onClick={() => setIsPremiumModalOpen(false)}
                    className="w-full py-4 text-sm font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
                  >
                    Để sau
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
