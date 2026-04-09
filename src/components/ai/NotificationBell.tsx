import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

const notifications = [
  {
    id: 1,
    type: 'info',
    title: 'Hệ thống bảo trì',
    message: 'Hệ thống sẽ bảo trì định kỳ vào lúc 00:00 đêm nay. Vui lòng hoàn tất các giao dịch trước thời gian này.',
    time: '10 phút trước',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Cảnh báo ngân sách',
    message: 'Bạn đã sử dụng vượt 80% ngân sách cho hạng mục "Ăn uống".',
    time: '2 giờ trước',
    read: false,
  },
  {
    id: 3,
    type: 'success',
    title: 'Cập nhật tính năng',
    message: 'Tính năng báo cáo nâng cao đã được cập nhật. Khám phá ngay!',
    time: '1 ngày trước',
    read: true,
  }
];

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={16} className="text-error" />;
      case 'success': return <CheckCircle2 size={16} className="text-success" />;
      default: return <Info size={16} className="text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full neumorphic flex items-center justify-center text-on-surface relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 md:top-3 md:right-3 w-2.5 h-2.5 bg-error rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-4 w-[320px] md:w-[380px] bg-surface rounded-[24px] shadow-2xl z-50 overflow-hidden border border-white/20"
          >
            <div className="p-4 md:p-6 border-b border-on-surface-variant/10 flex justify-between items-center bg-surface/50 backdrop-blur-md">
              <h3 className="font-bold text-lg text-on-surface">Thông báo</h3>
              <button className="text-xs font-bold text-primary hover:underline">Đánh dấu đã đọc</button>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto flex flex-col">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 md:p-6 border-b border-on-surface-variant/5 hover:bg-on-surface-variant/5 transition-colors cursor-pointer flex gap-4 ${!notif.read ? 'bg-primary/5' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full neumorphic-pressed flex items-center justify-center shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-bold ${!notif.read ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] font-bold text-on-surface-variant whitespace-nowrap ml-2">{notif.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 text-center bg-surface/50 backdrop-blur-md">
              <button className="text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors uppercase tracking-wider">
                Xem tất cả thông báo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
