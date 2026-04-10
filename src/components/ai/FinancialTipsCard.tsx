import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, Loader2, MessageSquareText } from 'lucide-react';
import { useAIInsight } from '@/hooks/useAI';
import { useRouter } from 'next/navigation';

export const FinancialTipsCard = () => {
  const { data, isLoading } = useAIInsight();
  const router = useRouter();

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-[var(--color-primary)] p-6 rounded-large h-full flex flex-col justify-between relative overflow-hidden shadow-sm"
    >
      {/* Decorative background circle */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm shadow-sm">
            <Lightbulb size={24} className="text-[var(--color-on-surface)]" />
          </div>
          <span className="text-xs font-bold bg-white/40 px-3 py-1 rounded-full text-[var(--color-on-surface)]">AI Advisor</span>
        </div>
        <h3 className="font-bold text-xl text-[var(--color-on-surface)] mb-3">Cố vấn AI</h3>
        
        {isLoading ? (
          <div className="flex items-center gap-2 text-[var(--color-on-surface)]/70 text-sm py-4">
            <Loader2 size={16} className="animate-spin" />
            <span>Đang phân tích dữ liệu...</span>
          </div>
        ) : (
          <p className="text-[var(--color-on-surface)]/80 text-[13px] leading-[1.6] font-medium line-clamp-4 text-justify">
            {data?.insight || "Hãy bắt đầu ghi chép chi tiêu để mình có thể đưa ra lời khuyên cho bạn nhé!"}
          </p>
        )}
      </div>
      
      <button 
        onClick={() => router.push('/dashboard/chat')}
        className="mt-6 flex items-center gap-2 text-[15px] font-bold text-[var(--color-on-surface)] hover:translate-x-1 transition-all relative z-10 w-fit cursor-pointer group"
      >
        Trò chuyện với AI <MessageSquareText size={18} className="group-hover:scale-110 transition-transform" />
      </button>
    </motion.div>
  );
};
