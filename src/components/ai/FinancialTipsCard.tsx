import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';

export const FinancialTipsCard = () => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-primary p-6 rounded-large h-full flex flex-col justify-between relative overflow-hidden shadow-sm"
    >
      {/* Decorative background circle */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm shadow-sm">
            <Lightbulb size={24} className="text-on-surface" />
          </div>
          <span className="text-xs font-bold bg-white/40 px-3 py-1 rounded-full text-on-surface">Mới</span>
        </div>
        <h3 className="font-bold text-xl text-on-surface mb-2">Mẹo tài chính</h3>
        <p className="text-on-surface/80 text-sm leading-relaxed font-medium">
          Bạn đã tiết kiệm được <span className="font-bold text-on-surface">15%</span> so với tháng trước. Hãy tiếp tục duy trì thói quen này để đạt mục tiêu mua xe vào cuối năm nhé!
        </p>
      </div>
      
      <button className="mt-6 flex items-center gap-2 text-sm font-bold text-on-surface hover:gap-3 transition-all relative z-10 w-fit">
        Xem thêm mẹo <ArrowRight size={16} />
      </button>
    </motion.div>
  );
};
