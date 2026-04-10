import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, Loader2, MessageSquareText, RefreshCcw, Lock, Crown } from 'lucide-react';
import { useAIInsight } from '@/hooks/useAI';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

export const FinancialTipsCard = () => {
  const { user } = useAuth();
  const { data, isLoading, isFetching } = useAIInsight();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Premium Guard
  if (user?.plan_type !== 'premium') {
    return (
      <motion.div 
        whileHover={{ scale: 1.01 }}
        className="bg-[var(--color-primary)] p-6 rounded-large h-full flex flex-col justify-between relative overflow-hidden shadow-sm"
      >
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-20"></div>
        <div className="relative z-30 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm shadow-sm">
                <Lock size={24} className="text-[var(--color-on-surface)]" />
              </div>
              <span className="text-xs font-bold bg-yellow-500 text-black px-3 py-1 rounded-full flex items-center gap-1"><Crown size={12} /> Premium</span>
            </div>
            <h3 className="font-bold text-xl text-[var(--color-on-surface)] mb-2">Cố vấn AI</h3>
            <p className="text-[var(--color-on-surface)]/70 text-xs font-medium">
              Phân tích thói quen chi tiêu và đưa ra lời khuyên tài chính cá nhân hóa.
            </p>
          </div>
          
          <button 
            onClick={() => router.push('/dashboard/premium')}
            className="mt-6 w-full py-3 bg-white text-black font-bold text-sm rounded-full flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:bg-white/90 transition-colors"
          >
            Nâng cấp Premium <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    queryClient.invalidateQueries({ queryKey: ['ai-insight'] });
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="bg-[var(--color-primary)] p-6 rounded-large h-full flex flex-col justify-between relative overflow-hidden shadow-sm"
    >
      {/* Decorative background circle */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <button 
               onClick={handleRefresh}
               className={`w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-sm cursor-pointer hover:bg-white/40 transition-all ${isFetching ? 'animate-spin' : ''}`}
               title="Làm mới lời khuyên"
             >
               <RefreshCcw size={18} className="text-[var(--color-on-surface)]" />
             </button>
             <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm shadow-sm">
               <Lightbulb size={24} className="text-[var(--color-on-surface)]" />
             </div>
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
