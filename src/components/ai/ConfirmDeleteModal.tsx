"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isPending
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isPending ? onClose : undefined}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] rounded-[32px] p-8 w-full max-w-md shadow-2xl neumorphic flex flex-col items-center text-center relative"
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                disabled={isPending}
                className="absolute top-6 right-6 w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 rounded-full neumorphic-pressed flex items-center justify-center text-[var(--color-error)] mb-6 mt-4">
                <AlertTriangle size={36} />
              </div>
              
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-4">Xóa giao dịch?</h2>
              
              <p className="text-[var(--color-on-surface-variant)] text-base font-medium mb-8">
                Bạn có chắc chắn muốn xóa giao dịch này không? Hành động này không thể hoàn tác và số dư của bạn sẽ được cập nhật lại.
              </p>
              
              <div className="flex w-full gap-4">
                <motion.button 
                  whileHover={!isPending ? { scale: 1.02 } : {}}
                  whileTap={!isPending ? { scale: 0.98 } : {}}
                  onClick={onClose}
                  disabled={isPending}
                  className="flex-1 neumorphic text-[var(--color-on-surface)] font-bold py-4 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                >
                  Bỏ qua
                </motion.button>
                <motion.button 
                  whileHover={!isPending ? { scale: 1.02 } : {}}
                  whileTap={!isPending ? { scale: 0.98 } : {}}
                  onClick={onConfirm}
                  disabled={isPending}
                  className="flex-1 bg-[var(--color-error)] text-white font-bold py-4 rounded-full shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isPending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      <span>Xóa ngay</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
