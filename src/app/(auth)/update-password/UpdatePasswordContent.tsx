"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function UpdatePasswordContent() {
  const router = useRouter();
  const { updatePassword, isSubmitting, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [formErrors, setFormErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    clearError();

    let errors: { password?: string; confirmPassword?: string } = {};
    if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const { success } = await updatePassword(formData.password);
    if (success) {
      setIsSuccess(true);
      // Wait a bit and redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
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
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-[var(--color-on-surface)]">Thành công!</h2>
          <p className="text-[var(--color-on-surface-variant)] text-lg leading-relaxed font-medium">
            Mật khẩu của bạn đã được cập nhật. Hệ thống sẽ tự động chuyển bạn về Trang chủ sau vài giây...
          </p>
          <div className="flex gap-2">
             <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce"></div>
          </div>
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
        <div className="w-20 h-20 bg-[var(--color-primary)] rounded-full flex items-center justify-center mb-8 shadow-sm">
           <KeyRound size={32} className="text-[var(--color-on-surface)]" />
        </div>

        <h2 className="text-3xl font-extrabold mb-3 text-center text-[var(--color-on-surface)]">Mật khẩu mới</h2>
        <p className="text-[var(--color-on-surface-variant)] font-medium mb-10 text-center max-w-xs">
          Vui lòng nhập mật khẩu mới thật an toàn nhé!
        </p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6" noValidate>
          {error && (
            <div className="px-6 py-4 rounded-3xl bg-[var(--color-error)]/10 text-[var(--color-error)] text-center font-medium text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block ml-4">
              Mật khẩu mới
            </label>
            <div className={`neumorphic-pressed rounded-full px-6 py-4 flex items-center border border-transparent transition-colors ${formErrors.password ? '!border-[var(--color-error)]' : ''}`}>
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-medium placeholder:text-[var(--color-on-surface-variant)]/50 tracking-widest"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] ml-2 transition-colors cursor-pointer">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formErrors.password && <p className="text-xs text-[var(--color-error)] mt-2 ml-4 font-medium">{formErrors.password}</p>}
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-2 block ml-4">
              Xác nhận mật khẩu
            </label>
            <div className={`neumorphic-pressed rounded-full px-6 py-4 border border-transparent transition-colors ${formErrors.confirmPassword ? '!border-[var(--color-error)]' : ''}`}>
              <input 
                name="confirmPassword"
                type="password" 
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-transparent border-none outline-none w-full text-[var(--color-on-surface)] font-medium placeholder:text-[var(--color-on-surface-variant)]/50 tracking-widest"
              />
            </div>
            {formErrors.confirmPassword && <p className="text-xs text-[var(--color-error)] mt-2 ml-4 font-medium">{formErrors.confirmPassword}</p>}
          </div>

          <motion.button 
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold py-5 rounded-full shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4 text-lg"
          >
            {isSubmitting ? "Đang lưu..." : "Cập nhật mật khẩu"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
