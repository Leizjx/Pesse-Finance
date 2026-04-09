"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Coffee, ShoppingBag, Zap, Car, Utensils, HeartPulse,
  Home, GraduationCap, Briefcase, TrendingUp, HelpCircle,
  Loader2,
} from 'lucide-react';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { TRANSACTION_CATEGORIES } from '@/types/database.types';
import type { TransactionCategory } from '@/types/database.types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mapping category → icon & label (khớp với TRANSACTION_CATEGORIES)
const CATEGORY_META: Record<TransactionCategory, { label: string; icon: React.ElementType }> = {
  food:          { label: 'Ăn uống',   icon: Utensils },
  transport:     { label: 'Di chuyển', icon: Car },
  entertainment: { label: 'Giải trí',  icon: Zap },
  health:        { label: 'Sức khỏe',  icon: HeartPulse },
  education:     { label: 'Học tập',   icon: GraduationCap },
  shopping:      { label: 'Mua sắm',   icon: ShoppingBag },
  utilities:     { label: 'Tiện ích',  icon: Coffee },
  rent:          { label: 'Nhà ở',     icon: Home },
  salary:        { label: 'Lương',     icon: Briefcase },
  investment:    { label: 'Đầu tư',    icon: TrendingUp },
  other:         { label: 'Khác',      icon: HelpCircle },
};

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const createTransaction = useCreateTransaction();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setType('expense');
    setAmount('');
    setSelectedCategory('food');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = Number(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Vui lòng nhập số tiền hợp lệ (> 0).');
      return;
    }

    try {
      await createTransaction.mutateAsync({
        type,
        amount: parsed,
        category: selectedCategory,
        date,
        note: note.trim() || null,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const isPending = createTransaction.isPending;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--color-background)] rounded-[40px] p-6 md:p-8 z-50 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">Thêm giao dịch</h2>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Error */}
              {error && (
                <div className="px-4 py-3 rounded-2xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Type Switch */}
              <div className="flex p-1 neumorphic-pressed rounded-full">
                {(['expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-3 rounded-full text-sm font-bold transition-colors ${
                      type === t
                        ? t === 'expense'
                          ? 'bg-[var(--color-error)] text-white shadow-md'
                          : 'bg-[var(--color-success)] text-white shadow-md'
                        : 'text-[var(--color-on-surface-variant)]'
                    }`}
                  >
                    {t === 'expense' ? 'Chi tiêu' : 'Thu nhập'}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block ml-4">
                  Số tiền (VND)
                </label>
                <div className="neumorphic-pressed rounded-full px-6 py-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setError(null); }}
                    placeholder="0"
                    min={1}
                    required
                    className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-bold text-2xl placeholder:text-[var(--color-on-surface-variant)]/50"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block ml-4">
                  Danh mục
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {TRANSACTION_CATEGORIES.map((cat) => {
                    const meta = CATEGORY_META[cat];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl gap-2 transition-all ${
                          selectedCategory === cat
                            ? 'bg-[var(--color-primary)] text-[var(--color-on-surface)] shadow-md'
                            : 'neumorphic text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
                        }`}
                      >
                        <Icon size={20} />
                        <span className="text-[10px] font-bold text-center leading-tight">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block ml-4">
                  Ngày
                </label>
                <div className="neumorphic-pressed rounded-full px-6 py-4">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-medium"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block ml-4">
                  Ghi chú (tùy chọn)
                </label>
                <div className="neumorphic-pressed rounded-3xl px-6 py-4">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Thêm ghi chú cho giao dịch này..."
                    rows={2}
                    maxLength={500}
                    className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-medium placeholder:text-[var(--color-on-surface-variant)]/50 resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isPending}
                whileHover={isPending ? {} : { scale: 1.02 }}
                whileTap={isPending ? {} : { scale: 0.98 }}
                className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold py-4 rounded-full shadow-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu giao dịch'
                )}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
