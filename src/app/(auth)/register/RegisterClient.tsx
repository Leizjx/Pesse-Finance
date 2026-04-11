"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, RefreshCw, Wallet, Star, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RegisterSchema } from "@/types/database.types";

export default function RegisterClient() {
  const { signUp, isSubmitting, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof formData>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = RegisterSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<typeof formData> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof typeof formData] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    try {
      await signUp({
        email: result.data.email,
        password: result.data.password,
        full_name: result.data.full_name,
        confirm_password: result.data.confirm_password,
      });
    } catch {
      // Error handled by useAuth
    }
  };


  return (
    <div className="min-h-dvh flex items-center justify-center p-4 sm:p-6 relative z-10 bg-[var(--color-background)] overflow-y-auto">
      <div className="w-full max-w-6xl flex items-center justify-center gap-16 py-8 sm:py-0">
        
        {/* Left side text (Hidden on mobile) */}
        <div className="hidden lg:block flex-1">
          <h1 className="text-8xl font-extrabold text-[var(--color-surface)] drop-shadow-[0_4px_4px_rgba(0,0,0,0.05)] tracking-tighter opacity-80">
            PESSE
          </h1>
        </div>

        {/* Main Form Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="neumorphic p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] w-full max-w-md flex flex-col items-center relative z-10"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--color-surface)] rounded-2xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] flex items-center justify-center mb-4 sm:mb-6">
            <Wallet size={20} className="text-[var(--color-primary)] sm:w-6 sm:h-6" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black mb-2 text-center text-[var(--color-on-surface)] tracking-tight">Bắt đầu hành trình mới</h2>
          <p className="text-[var(--color-on-surface-variant)] font-semibold mb-8 sm:mb-10 text-center text-sm sm:text-base px-2">
            Tạo tài khoản Pesse chỉ trong vài giây
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 sm:gap-5 mb-5 sm:mb-6" noValidate>
            {error && (
              <div className="px-5 py-3 rounded-2xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-center font-medium text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest block ml-5">Họ và tên</label>
              <div className={`neumorphic-pressed rounded-full px-6 py-4 flex items-center gap-4 border border-transparent transition-all duration-300 ${formErrors.full_name ? '!border-[var(--color-error)] ring-2 ring-[var(--color-error)]/10' : ''}`}>
                <User size={20} className="text-[var(--color-on-surface-variant)]" />
                <input 
                  type="text" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-bold placeholder:text-[var(--color-on-surface-variant)]/40 text-base"
                />
              </div>
              {formErrors.full_name && <p className="text-sm text-[var(--color-error)] mt-2 ml-5 font-bold">{formErrors.full_name}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest block ml-5">Email</label>
              <div className={`neumorphic-pressed rounded-full px-6 py-4 flex items-center gap-4 border border-transparent transition-all duration-300 ${formErrors.email ? '!border-[var(--color-error)] ring-2 ring-[var(--color-error)]/10' : ''}`}>
                <Mail size={20} className="text-[var(--color-on-surface-variant)]" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-bold placeholder:text-[var(--color-on-surface-variant)]/40 text-base"
                />
              </div>
              {formErrors.email && <p className="text-sm text-[var(--color-error)] mt-2 ml-5 font-bold">{formErrors.email}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest block ml-5">Mật khẩu</label>
              <div className={`neumorphic-pressed rounded-full px-6 py-4 flex items-center gap-4 border border-transparent transition-all duration-300 ${formErrors.password ? '!border-[var(--color-error)] ring-2 ring-[var(--color-error)]/10' : ''}`}>
                <Lock size={20} className="text-[var(--color-on-surface-variant)]" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-bold placeholder:text-[var(--color-on-surface-variant)]/40 tracking-[0.2em] text-base"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] cursor-pointer mr-1">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password && <p className="text-sm text-[var(--color-error)] mt-2 ml-5 font-bold">{formErrors.password}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-[var(--color-on-surface-variant)] uppercase tracking-widest block ml-5">Xác nhận mật khẩu</label>
              <div className={`neumorphic-pressed rounded-full px-6 py-4 flex items-center gap-4 border border-transparent transition-all duration-300 ${formErrors.confirm_password ? '!border-[var(--color-error)] ring-2 ring-[var(--color-error)]/10' : ''}`}>
                <RefreshCw size={20} className="text-[var(--color-on-surface-variant)]" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-bold placeholder:text-[var(--color-on-surface-variant)]/40 tracking-[0.2em] text-base"
                />
              </div>
              {formErrors.confirm_password && <p className="text-sm text-[var(--color-error)] mt-2 ml-5 font-bold">{formErrors.confirm_password}</p>}
            </div>

            <div className="w-full flex items-center gap-3 mt-4 px-2">
              <div className="w-5 h-5 rounded bg-[var(--color-surface)] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center cursor-pointer">
                <div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]"></div>
              </div>
              <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">
                Tôi đồng ý với <a href="#" className="text-[var(--color-on-surface)] font-bold hover:underline">Điều khoản & Chính sách</a>
              </span>
            </div>

            <motion.button 
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] font-black py-5 rounded-full shadow-xl mt-6 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </motion.button>
          </form>

          <p className="text-sm font-medium text-[var(--color-on-surface-variant)] mb-4 sm:mb-6">
            Đã có tài khoản? <Link href="/login" className="text-[var(--color-on-surface)] font-bold hover:text-[var(--color-primary)] transition-colors">Đăng nhập</Link>
          </p>
        </motion.div>

        {/* Right side floating card (Hidden on mobile) */}
        <div className="hidden lg:block flex-1 relative">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-1/2 -translate-y-1/2 right-0 bg-[var(--color-primary)] p-8 rounded-[32px] shadow-xl max-w-xs rotate-2 hover:rotate-0 transition-transform duration-300"
          >
            <div className="w-10 h-10 bg-[var(--color-on-surface)]/10 rounded-full flex items-center justify-center mb-4">
              <Star size={20} className="text-[var(--color-on-surface)]" fill="currentColor" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6 leading-tight">
              An tâm tài chính, nâng tầm cuộc sống.
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-3">
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)]" unoptimized />
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)]" unoptimized />
                <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=3" alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-surface)]" unoptimized />
              </div>
              <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] text-[10px] font-bold px-2 py-1 rounded-full">
                +2k
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
