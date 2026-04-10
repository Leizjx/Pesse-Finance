import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useAI';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Notification } from '@/types/database.types';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications();

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        body: JSON.stringify({ id }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

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

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'budget_alert': return <AlertTriangle size={16} className="text-[var(--color-error)]" />;
      case 'subscription_reminder': return <CheckCircle2 size={16} className="text-[var(--color-success)]" />;
      case 'ai_insight': return <Info size={16} className="text-[var(--color-primary)]" />;
      default: return <Info size={16} className="text-[var(--color-primary)]" />;
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.is_read) {
      markReadMutation.mutate(notif.id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button 
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Thông báo, ${unreadCount} tin nhắn chưa đọc`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="w-10 h-10 md:w-12 md:h-12 rounded-full neumorphic flex items-center justify-center text-[var(--color-on-surface)] relative cursor-pointer"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 md:top-3 md:right-3 w-2.5 h-2.5 bg-[var(--color-error)] rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-4 w-[320px] md:w-[380px] bg-[var(--color-surface)] rounded-[24px] shadow-2xl z-50 overflow-hidden border border-white/20"
          >
            <div className="p-4 md:p-6 border-b border-[var(--color-on-surface-variant)]/10 flex justify-between items-center bg-[var(--color-surface)]/50 backdrop-blur-md">
              <h3 className="font-bold text-lg text-[var(--color-on-surface)]">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold text-[var(--color-on-surface-variant)]">{unreadCount} mới</span>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto flex flex-col">
              {isLoading ? (
                <div className="p-10 flex flex-col items-center justify-center gap-2 text-[var(--color-on-surface-variant)]">
                   <Loader2 size={24} className="animate-spin" />
                   <span className="text-xs font-medium">Đang tải thông báo...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center text-[var(--color-on-surface-variant)]">
                   <p className="text-sm font-medium italic">Hiện chưa có thông báo mới.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 md:p-6 border-b border-[var(--color-on-surface-variant)]/5 hover:bg-[var(--color-on-surface-variant)]/5 transition-colors cursor-pointer flex gap-4 ${!notif.is_read ? 'bg-[var(--color-primary)]/5' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full neumorphic-pressed flex items-center justify-center shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold ${!notif.is_read ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)] whitespace-nowrap ml-2">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: vi })}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${!notif.is_read ? 'text-[var(--color-on-surface)] font-medium' : 'text-[var(--color-on-surface-variant)]'}`}>
                        {notif.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 text-center bg-[var(--color-surface)]/50 backdrop-blur-md">
              <button className="text-xs font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors uppercase tracking-wider cursor-pointer">
                Đóng
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
