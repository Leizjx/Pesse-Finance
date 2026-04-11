"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LoginSchema } from "@/types/database.types";
import { signInWithSocial } from "@/services/authService";

export default function LoginPageContent() {
  const { signIn, isSubmitting, error, clearError } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const registered = searchParams.get("registered");

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; social?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    setFormErrors({});
    const { error } = await signInWithSocial(provider);
    if (error) {
      setFormErrors({ social: "Đăng nhập mạng xã hội thất bại. Vui lòng thử lại!" });
      setSocialLoading(null);
    }
  };

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

    const result = LoginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }

    await signIn(result.data, redirectTo);
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 sm:p-6 relative z-10 bg-[var(--color-background)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex flex-col items-center py-6 sm:py-0"
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-8 sm:mb-10 shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-[var(--color-on-surface)]">Pesse</h1>
        </div>

        <h2 className="text-3xl lg:text-4xl font-black lg:font-extrabold mb-3 text-center text-[var(--color-on-surface)] tracking-tighter leading-none">Chào mừng trở lại</h2>
        <p className="text-base lg:text-lg text-[var(--color-on-surface-variant)] font-bold lg:font-semibold mb-10 sm:mb-12 text-center px-6 leading-relaxed opacity-90">
          Đăng nhập để tiếp tục quản lý tài chính
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 mb-4" noValidate>
          {registered === "true" && (
             <div className="px-6 py-4 rounded-3xl bg-[var(--color-income-bg)] text-[var(--color-income)] text-center font-medium text-sm">
               Đăng ký thành công! Vui lòng đăng nhập để bắt đầu.
             </div>
          )}
          {error && (
            <div className="px-6 py-4 rounded-3xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-center font-medium text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-base font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest block ml-6">
              Email
            </label>
            <div className={`neumorphic-pressed rounded-full px-7 py-5 border border-transparent transition-all duration-300 ${formErrors.email ? '!border-[var(--color-error)] ring-2 ring-[var(--color-error)]/10' : 'focus-within:border-[var(--color-primary)]'}`}>
              <input 
                name="email"
                type="email" 
                placeholder="email@vi-du.com"
                value={formData.email}
                onChange={handleChange}
                className="bg-transparent border-none outline-none w-full text-base text-[var(--color-on-surface)] font-bold placeholder:text-[var(--color-on-surface-variant)]/40"
              />
            </div>
            {formErrors.email && <p className="text-sm text-[var(--color-error)] mt-2.5 ml-5 font-bold">{formErrors.email}</p>}
          </div>

          <div className="space-y-4">
            <label className="text-base font-black text-[var(--color-on-surface-variant)] uppercase tracking-widest block ml-6">
              Mật khẩu
            </label>
            <div className={`neumorphic-pressed rounded-full px-7 py-5 flex items-center border border-transparent transition-all duration-300 ${formErrors.password ? '!border-[var(--color-error)] ring-2 ring-[var(--color-error)]/10' : 'focus-within:border-[var(--color-primary)]'}`}>
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="bg-transparent border-none outline-none w-full text-base text-[var(--color-on-surface)] font-bold placeholder:text-[var(--color-on-surface-variant)]/40 tracking-[0.2em]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] ml-3 transition-colors cursor-pointer">
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            {formErrors.password && <p className="text-sm text-[var(--color-error)] mt-2.5 ml-5 font-bold">{formErrors.password}</p>}
          </div>

          <div className="w-full flex justify-end">
             <Link 
               href="/forgot-password" 
               className="text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
             >
               Quên mật khẩu?
             </Link>
          </div>

          <motion.button 
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] font-black lg:font-extrabold py-5 lg:py-4.5 rounded-[2.5rem] lg:rounded-large shadow-2xl mt-8 mb-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-4 text-lg lg:text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              "Đăng nhập ngay"
            )}
          </motion.button>
        </form>

        <div className="w-full flex items-center gap-4 my-6 sm:my-8">
          <div className="flex-1 h-px bg-[var(--color-on-surface-variant)]/20"></div>
          <span className="text-[10px] sm:text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider whitespace-nowrap">Hoặc đăng nhập với</span>
          <div className="flex-1 h-px bg-[var(--color-on-surface-variant)]/20"></div>
        </div>

        <div className="flex gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.button 
            type="button" 
            disabled={socialLoading !== null}
            whileHover={socialLoading === null ? { scale: 1.05 } : {}}
            whileTap={socialLoading === null ? { scale: 0.95 } : {}}
            onClick={() => handleSocialLogin('google')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full neumorphic flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {socialLoading === 'google' ? (
               <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-90 sm:scale-100">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
          </motion.button>
          
          <motion.button 
             type="button"
             disabled={socialLoading !== null}
             whileHover={socialLoading === null ? { scale: 1.05 } : {}}
             whileTap={socialLoading === null ? { scale: 0.95 } : {}}
             onClick={() => handleSocialLogin('facebook')}
             className="w-12 h-12 sm:w-14 sm:h-14 rounded-full neumorphic flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {socialLoading === 'facebook' ? (
              <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg" className="scale-90 sm:scale-100">
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/>
              </svg>
            )}
          </motion.button>
        </div>

        {formErrors.social && <p className="text-sm text-[var(--color-error)] mb-8 font-medium">{formErrors.social}</p>}

        <p className="text-sm font-medium text-[var(--color-on-surface-variant)]">
          Chưa có tài khoản? <Link href="/register" className="text-on-surface font-bold hover:text-[var(--color-primary)] transition-colors">Đăng ký ngay</Link>
        </p>
      </motion.div>
    </div>
  );
}
