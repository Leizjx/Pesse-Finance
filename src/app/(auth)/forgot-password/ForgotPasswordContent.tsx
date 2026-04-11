"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ForgotPasswordContent() {
  const { sendPasswordResetEmail, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    clearError();

    if (!email) {
      setEmailError("Vui lòng nhập email của bạn.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Email không hợp lệ.");
      return;
    }

    const { success } = await sendPasswordResetEmail(email);
    if (success) {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 relative z-10 bg-[var(--color-background)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 md:p-12 neumorphic rounded-[2.5rem] text-center flex flex-col items-center gap-6"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--color-income-bg)] text-[var(--color-income)] flex items-center justify-center shadow-lg mb-2">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--color-on-surface)]">Kiểm tra Email</h2>
          <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed font-medium">
            Chúng mình đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư (và cả thư rác) nhé!
          </p>
          <Link 
            href="/login"
            className="mt-6 px-10 py-4 bg-[var(--color-primary)] text-black font-bold text-lg rounded-full hover:scale-105 transition-transform shadow-lg w-full"
          >
            Quay lại Đăng nhập
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6 relative z-10 bg-[var(--color-background)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center"
      >
        <Link 
          href="/login" 
          className="self-start flex items-center gap-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors mb-12 font-bold group"
        >
          <div className="w-10 h-10 rounded-full neumorphic flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowLeft size={20} />
          </div>
          <span>Quay lại</span>
        </Link>

        <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-8 shadow-sm">
           <Mail size={32} className="text-[var(--color-on-surface)]" />
        </div>

        <h2 className="text-3xl font-extrabold mb-3 text-center text-[var(--color-on-surface)]">Quên mật khẩu?</h2>
        <p className="text-[var(--color-on-surface-variant)] font-medium mb-10 text-center max-w-xs">
          Đừng lo, hãy nhập email của bạn và chúng mình sẽ gửi link khôi phục.
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8" noValidate>
          {error && (
            <div className="px-6 py-4 rounded-3xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-center font-medium text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block ml-4">
              Địa chỉ Email
            </label>
            <div className={`neumorphic-pressed rounded-full px-6 py-4 border border-transparent transition-colors ${emailError ? '!border-[var(--color-error)]' : ''}`}>
              <input 
                type="email" 
                placeholder="email@vi-du.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                  clearError();
                }}
                className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-medium placeholder:text-[var(--color-on-surface-variant)]/50"
              />
            </div>
            {emailError && <p className="text-xs text-[var(--color-error)] mt-2 ml-4 font-medium">{emailError}</p>}
          </div>

          <motion.button 
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold py-5 rounded-full shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Đang gửi yêu cầu...</span>
              </>
            ) : (
              "Gửi link khôi phục"
            )}
          </motion.button>
        </form>

        <p className="mt-12 text-sm font-medium text-[var(--color-on-surface-variant)]">
          Bạn nhớ ra rồi sao? <Link href="/login" className="text-[var(--color-on-surface)] font-bold hover:text-[var(--color-primary)] transition-colors">Đăng nhập</Link>
        </p>
      </motion.div>
    </div>
  );
}
