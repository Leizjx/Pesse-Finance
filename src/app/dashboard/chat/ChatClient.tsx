"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Lock, Crown, SendHorizonal } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export default function ChatClient() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial welcome message
  useEffect(() => {
    if (user?.plan_type === 'premium' && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: 'Chào bạn! Mình là Pesse AI, chuyên gia tài chính cá nhân của bạn. Hôm nay bạn muốn mình giúp gì về tình hình tài chính tháng này?',
        }
      ]);
    }
  }, [user, messages.length]);

  if (isLoadingUser || !user) {
    return (
      <div className="flex-1 flex flex-col gap-6 h-full p-4 animate-pulse pt-8 pr-4">
         <div className="h-20 bg-black/10 rounded-full w-full"></div>
         <div className="h-[60vh] bg-black/10 rounded-extra-large w-full mt-6"></div>
      </div>
    );
  }

  // Premium Guard
  if (user.plan_type !== 'premium') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full min-h-[500px]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neumorphic p-8 md:p-12 rounded-[2rem] max-w-xl text-center flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] text-black flex items-center justify-center mb-2 shadow-lg">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold lg:font-extrabold text-[var(--color-on-surface)] flex items-center justify-center gap-3">
            Tính Năng Giới Hạn <Crown className="text-yellow-500 fill-yellow-500" size={24} />
          </h2>
          <p className="text-[var(--color-on-surface-variant)] text-base lg:text-lg leading-relaxed">
            Pesse AI Advisor là trợ lý thông minh độc quyền, phân tích sâu dữ liệu thu chi để đưa ra lời khuyên cá nhân hoá. Chỉ dành riêng cho thành viên <strong>Premium</strong>.
          </p>
          <button
            onClick={() => router.push('/dashboard/premium')}
            className="mt-6 px-10 py-4 bg-[var(--color-primary)] text-black font-bold text-lg rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg hover:shadow-xl w-full sm:w-auto cursor-pointer"
          >
            <Crown size={22} className="fill-black" />
            Nâng Cấp Premium Ngay
          </button>
        </motion.div>
      </div>
    );
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.content,
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Lỗi: ${error.message || "Không thể kết nối với máy chủ AI. Vui lòng thử lại sau."}`,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptClick = (text: string) => {
    setInput(text);
  };

  const suggestedPrompts = [
    "Tháng này mình tiêu nhiều nhất vào khoản nào?",
    "Làm sao để tiết kiệm tiền?",
    "Phân tích hóa đơn định kỳ của mình",
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden md:pr-2 pb-0">
      {/* Header */}
      <header className="shrink-0 mb-3 md:mb-6 mt-1 md:mt-2 relative z-10 px-4 md:px-0">
        <h1 className="text-xl lg:text-2xl font-extrabold lg:font-bold text-[var(--color-on-surface)] tracking-tight mb-0.5 md:mb-1 flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl lg:rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
             <Bot size={20} className="lg:w-5 lg:h-5" />
          </div>
          Pesse <span className="text-[var(--color-primary)]">AI Advisor</span>
        </h1>
        <p className="hidden md:block text-sm text-[var(--color-on-surface-variant)] font-medium">
          Dựa vào dữ liệu tài chính thực tế của bạn, AI sẽ hoạt động như một cố vấn cá nhân.
        </p>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[var(--color-surface)]/30 backdrop-blur-3xl md:rounded-[2rem] md:border md:border-white/10 overflow-hidden relative md:shadow-2xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 md:p-6 flex flex-col gap-5 md:gap-6 relative z-10 scrollbar-hide">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex gap-2 md:gap-4 max-w-[92%] md:max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-[var(--color-surface)] border border-white/10' : 'bg-[var(--color-primary)] text-black'}`}>
                {msg.role === 'user' ? (
                  <Image src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.full_name || 'User'}`} width={40} height={40} alt="User" unoptimized className="rounded-lg md:rounded-xl" />
                ) : (
                  <Bot size={18} className="md:w-[22px] md:h-[22px]" />
                )}
              </div>
              <div className={`p-3.5 md:p-4 rounded-2xl md:rounded-3xl ${msg.role === 'user' ? 'bg-[var(--color-surface)] border border-white/10 text-[var(--color-on-surface)] rounded-tr-sm' : 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-on-surface)] rounded-tl-sm'}`}>
                <p className="text-sm md:text-[14px] leading-relaxed whitespace-pre-wrap font-medium">
                  {/* Basic markdown bold parser hack for simplicity */}
                  {msg.content.split('**').map((part, i) => i % 2 !== 0 ? <strong key={i} className="text-green-600 dark:text-green-400">{part}</strong> : part)}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 md:gap-4 max-w-[92%] md:max-w-[85%]"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl md:rounded-2xl bg-[var(--color-primary)] text-black flex items-center justify-center shadow-lg">
                <Bot size={18} className="md:w-[22px] md:h-[22px]" />
              </div>
              <div className="px-4 py-3 md:px-5 md:py-4 rounded-2xl md:rounded-3xl rounded-tl-sm bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[var(--color-primary)] animate-bounce"></div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 md:px-6 pb-3 md:pb-2 flex gap-2 overflow-x-auto relative z-10 scrollbar-hide shrink-0">
            {suggestedPrompts.map((prompt, i) => (
              <button 
                key={i}
                onClick={() => handlePromptClick(prompt)}
                className="whitespace-nowrap px-4 py-2 rounded-full bg-[var(--color-surface)] border border-white/5 text-[var(--color-on-surface-variant)] text-xs font-bold hover:text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 md:p-4 bg-[var(--color-background)]/80 backdrop-blur-xl border-t border-white/5 relative z-10 shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2 md:gap-3 bg-[var(--color-surface)] border border-white/10 rounded-full px-1.5 py-1.5 md:px-2 md:py-2 shadow-2xl focus-within:border-[var(--color-primary)]/40 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhắn gì đó..."
              className="flex-1 bg-transparent outline-none border-none text-[var(--color-on-surface)] font-medium px-4 text-sm"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shrink-0 rounded-full bg-[var(--color-primary)] text-black cursor-pointer disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]"
            >
              <SendHorizonal size={18} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
