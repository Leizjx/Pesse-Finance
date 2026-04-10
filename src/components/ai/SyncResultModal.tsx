"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarX } from 'lucide-react';

interface SyncResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export const SyncResultModal: React.FC<SyncResultModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Thông báo đồng bộ",
  message 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[var(--color-background)] rounded-[2.5rem] p-8 z-[101] shadow-2xl border border-white/10 text-center"
          >
            <div className="flex justify-end absolute top-6 right-6">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-20 h-20 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
               <CalendarX size={40} />
            </div>

            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-4">{title}</h2>
            
            <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed mb-8">
              {message}
            </p>

            <button
              onClick={onClose}
              className="w-full py-4 bg-[var(--color-primary)] text-black font-bold rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Đã hiểu
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
