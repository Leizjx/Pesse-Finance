"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

export interface Bank {
  id: string;
  name: string;
  logo: string;
  color: string;
  bg: string;
}

interface DataConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  banks: Bank[];
  initialProvider?: string;
  initialName?: string;
  initialSelectedBanks?: string[];
  mode?: 'add' | 'edit';
}

// === TÁCH RIÊNG PHẦN LOGIC (CUSTOM HOOK) ===
function useDataConnectionLogic({ onClose, initialProvider, initialName, initialSelectedBanks }: DataConnectionModalProps) {
  const [nickname, setNickname] = useState(initialName || '');
  const [selectedProvider, setSelectedProvider] = useState(initialProvider || 'gmail');
  const [selectedBanks, setSelectedBanks] = useState<string[]>(initialSelectedBanks || []);

  const toggleBank = (bankId: string) => {
    setSelectedBanks(prev => 
      prev.includes(bankId) 
        ? prev.filter(id => id !== bankId) 
        : [...prev, bankId]
    );
  };

  const handleContinue = async () => {
    // 1. Lưu tạm vào Cookies để Server-side chặn được ở callback
    const tempConfig = JSON.stringify({
      nickname,
      selectedBanks,
      provider: selectedProvider
    });
    document.cookie = `pesse_temp_connection=${encodeURIComponent(tempConfig)}; path=/; max-age=3600; SameSite=Lax`;

    // 2. Gọi Supabase Auth để xác thực OAuth
    const supabase = createClient();
    
    if (selectedProvider === 'gmail') {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          },
          scopes: 'https://www.googleapis.com/auth/gmail.readonly',
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
    } else {
      console.log('Chưa hỗ trợ OAuth config cho provider:', selectedProvider);
    }
  };

  return {
    nickname, setNickname,
    selectedProvider, setSelectedProvider,
    selectedBanks, toggleBank,
    handleContinue
  };
}

// === LỚP VIEW (COMPONENT) ===
export default function DataConnectionModal(props: DataConnectionModalProps) {
  const { isOpen, onClose, banks, mode = 'add' } = props;
  const logic = useDataConnectionLogic(props);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          {/* Main Modal Box: Trắng sứ, bo góc lớn 2rem */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-8 rounded-[32px] w-full max-w-md flex flex-col gap-6 relative shadow-[20px_20px_60px_#d9d9d9,-20px_-20px_60px_#ffffff]"
          >
            {/* Nút đóng (X) dùng lucide-react */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 transition-colors shadow-[inset_2px_2px_5px_#e6e6e6,inset_-2px_-2px_5px_#ffffff] cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="pr-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {mode === 'edit' ? 'Chỉnh sửa kết nối' : 'Thêm dữ liệu mới'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Kết nối nguồn dữ liệu để tự động hóa Pesse
              </p>
            </div>

            {/* Select Nhà cung cấp: Dập lõm (inset shadow) */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">Nhà cung cấp Email</label>
              <div className="p-1 rounded-xl relative shadow-[inset_4px_4px_8px_#e6e6e6,inset_-4px_-4px_8px_#ffffff] bg-gray-50">
                <select 
                  value={logic.selectedProvider}
                  onChange={(e) => logic.setSelectedProvider(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 appearance-none text-gray-800 font-medium outline-none cursor-pointer relative z-10 focus:ring-0"
                >
                  <option value="gmail">Google (Gmail)</option>
                  <option value="outlook">Microsoft (Outlook)</option>
                  <option value="yahoo">Yahoo Mail</option>
                </select>
                <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-0" />
              </div>
            </div>

            {/* Input Tên gợi nhớ: Dập lõm khi focus */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">Tên gợi nhớ (tùy chọn)</label>
              <input 
                type="text"
                placeholder="VD: Thẻ chi tiêu chính"
                value={logic.nickname}
                onChange={(e) => logic.setNickname(e.target.value)}
                className="px-5 py-4 rounded-xl w-full text-gray-800 font-medium placeholder:text-gray-400 outline-none transition-shadow bg-gray-50 shadow-[inset_4px_4px_8px_#e6e6e6,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff]"
              />
            </div>

            {/* Bank Grid */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-600">Ngân hàng cần nhận diện (có thể chọn nhiều)</label>
              <div className="grid grid-cols-4 gap-3 max-h-[220px] overflow-y-auto px-1 py-1">
                {banks.map(bank => {
                  const isSelected = logic.selectedBanks.includes(bank.id);
                  return (
                    <button
                      key={bank.id}
                      onClick={() => logic.toggleBank(bank.id)}
                      title={bank.name}
                      className={`relative aspect-square rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer bg-white border-2 ${
                        isSelected 
                          ? `shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] border-[#D4F03D] text-black select-none` // Trạng thái ĐÃ CHỌN: dập lõm sâu, viền vàng chanh, chữ đen đậm
                          : `shadow-[4px_4px_8px_#e6e6e6,-4px_-4px_8px_#ffffff] border-transparent ${bank.color} hover:shadow-[2px_2px_4px_#e6e6e6,-2px_-2px_4px_#ffffff]` // Trạng thái CHƯA CHỌN: nổi, viền trong suốt
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 size={16} className="absolute top-1.5 right-1.5 text-black fill-[#D4F03D]" />
                      )}
                      <span className="z-10">{bank.logo}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nút Tiếp tục: Màu Vàng chanh (#D4F03D), hiệu ứng nảy */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={logic.handleContinue}
              className="mt-2 text-black font-extrabold py-4 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer select-none"
              style={{ backgroundColor: '#D4F03D' }}
            >
              {mode === 'edit' ? 'Cập nhật kết nối' : 'Tiếp tục kết nối'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
