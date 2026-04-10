"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmailOtp, isSubmitting, error, clearError } = useAuth();
  
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resending code
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Handle OTP input changes
  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    clearError();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text").substring(0, 6);
    if (!/^\d+$/.test(data)) return;

    const newOtp = [...otp];
    data.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(data.length, 5)]?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const token = otp.join("");
    if (token.length !== 6) return;
    
    await verifyEmailOtp(email, token);
  };

  // Submit automatically when all 6 digits are filled
  useEffect(() => {
    if (otp.join("").length === 6) {
      handleSubmit();
    }
  }, [otp]);

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 relative z-10 bg-[var(--color-background)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <Link 
          href="/register" 
          className="self-start flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors mb-12 font-bold group"
        >
          <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowLeft size={20} />
          </div>
          <span>Quay lại</span>
        </Link>

        <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-8 shadow-sm">
           <ShieldCheck size={32} className="text-[var(--color-on-surface)]" />
        </div>

        <h2 className="text-3xl font-extrabold mb-3 text-center text-[var(--color-on-surface)]">Xác thực tài khoản</h2>
        <p className="text-[var(--color-on-surface-variant)] font-medium mb-10 text-center max-w-xs">
          Mã OTP gồm 6 chữ số đã được gửi tới <br /> 
          <span className="text-[var(--color-on-surface)] font-bold">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-10">
          {error && (
            <div className="px-6 py-4 rounded-3xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-center font-medium text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between gap-2 md:gap-3 px-2">
            {otp.map((digit, index) => (
              <div 
                key={index}
                className="flex-1 aspect-square neumorphic-pressed rounded-2xl flex items-center justify-center border border-transparent focus-within:border-[var(--color-primary)]/50 transition-all"
              >
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-full h-full bg-transparent text-center text-2xl font-black text-[var(--color-on-surface)] outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <motion.button 
              type="submit"
              disabled={isSubmitting || otp.join("").length !== 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold py-5 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isSubmitting ? "Đang xác thực..." : "Xác nhận ngay"}
            </motion.button>
            
            <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-[var(--color-on-surface-variant)]">Chưa nhận được mã?</span>
               {timer > 0 ? (
                 <span className="text-sm font-bold text-[var(--color-primary)] underline decoration-dotted">{timer}s nữa có thể gửi lại</span>
               ) : (
                 <button 
                   type="button" 
                   className="text-sm font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 cursor-pointer"
                   onClick={() => setTimer(60)}
                 >
                   <RefreshCw size={14} /> Gửi lại mã
                 </button>
               )}
            </div>
          </div>
        </form>

        <Link href="/login" className="mt-12 text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors">
          Đăng ký bằng email khác?
        </Link>
      </motion.div>
    </div>
  );
}
