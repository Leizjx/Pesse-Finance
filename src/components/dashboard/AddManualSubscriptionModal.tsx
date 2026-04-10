"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, DollarSign, Tag, Loader2, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface AddManualSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddManualSubscriptionModal: React.FC<AddManualSubscriptionModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    service_name: '',
    amount: '',
    currency: 'VND',
    billing_cycle: 'monthly',
    next_billing_date: new Date().toISOString().split('T')[0],
  });

  const mutation = useMutation({
    mutationFn: async (newData: any) => {
      const res = await fetch('/api/subscriptions/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error('Failed to create subscription');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      onClose();
      resetForm();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    },
    onSettled: () => setIsSubmitting(false)
  });

  const resetForm = () => {
    setFormData({
      service_name: '',
      amount: '',
      currency: 'VND',
      billing_cycle: 'monthly',
      next_billing_date: new Date().toISOString().split('T')[0],
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    mutation.mutate(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-[var(--color-background)] rounded-[32px] p-8 z-[101] shadow-2xl border border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">Thêm hóa đơn</h2>
              <button onClick={onClose} className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <p className="text-xs text-[var(--color-error)] font-bold px-4">{error}</p>}

              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase mb-2 block ml-4">Tên dịch vụ</label>
                <div className="neumorphic-pressed rounded-full px-5 py-3 flex items-center gap-3">
                  <Tag size={18} className="text-[var(--color-primary)]" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Tiền nhà, Spotify..."
                    className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-bold"
                    value={formData.service_name}
                    onChange={e => setFormData({...formData, service_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase mb-2 block ml-4">Số tiền</label>
                  <div className="neumorphic-pressed rounded-full px-5 py-3 flex items-center gap-3">
                    <DollarSign size={18} className="text-[var(--color-primary)]" />
                    <input
                      type="number"
                      required
                      placeholder="0"
                      className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-bold"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase mb-2 block ml-4">Đơn vị</label>
                  <select 
                    className="neumorphic rounded-full px-5 py-3 w-full text-[var(--color-on-surface)] font-bold outline-none cursor-pointer bg-transparent"
                    value={formData.currency}
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                  >
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase mb-2 block ml-4">Chu kỳ</label>
                <div className="flex p-1 neumorphic-pressed rounded-full">
                  {['monthly', 'yearly'].map(cycle => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setFormData({...formData, billing_cycle: cycle})}
                      className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${formData.billing_cycle === cycle ? 'bg-[var(--color-primary)] text-black shadow-md' : 'text-[var(--color-on-surface-variant)]'}`}
                    >
                      {cycle === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase mb-2 block ml-4">Ngày thanh toán tiếp theo</label>
                <div className="neumorphic-pressed rounded-full px-5 py-3 flex items-center gap-3">
                  <Calendar size={18} className="text-[var(--color-primary)]" />
                  <input
                    type="date"
                    required
                    className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-bold"
                    value={formData.next_billing_date}
                    onChange={e => setFormData({...formData, next_billing_date: e.target.value})}
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[var(--color-primary)] text-black font-bold py-4 rounded-full shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Lưu hóa đơn
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
