"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function SyncProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") ?? "/dashboard";
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [showRetry, setShowRetry] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    // Tweak to fetch explicit auth ID for debugging
    import('@/lib/supabaseClient').then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }: { data: { user: { id: string } | null } }) => {
        if (data?.user?.id) setAuthUserId(data.user.id);
      })
    });
  }, []);

  useEffect(() => {
    console.log(`[QA LOG] Mounted /sync-profile. Current state -> isAuthenticated: ${isAuthenticated}, isLoading: ${isLoading}, hasUser: ${!!user}`);
  }, [isAuthenticated, isLoading, user]);

  // If the user's profile gets populated during wait, automatically navigate them
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      console.log(`[QA LOG] Profile synced successfully! Redirecting back to ${nextRoute}...`);
      router.push(nextRoute);
    }
  }, [user, isAuthenticated, isLoading, router, nextRoute]);

  // If useAuth finishes loading but says user is NOT authenticated, kick them back to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log(`[QA LOG] Access denied. No valid session found. Kicking to /login.`);
      router.push("/login?error=Phiên+đăng+nhập+hết+hạn");
    }
  }, [isLoading, isAuthenticated, router]);

  // Handle timeout -> Show retry
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(`[QA LOG] 5000ms timeout reached. Show Retry button.`);
      setShowRetry(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] font-sans relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--color-primary)] opacity-10 rounded-full blur-[100px] pointer-events-none" />

      <div className="neumorphic rounded-extra-large p-10 w-full max-w-sm flex flex-col items-center text-center relative z-10">
        
        {/* Pulsating Icon */}
        <motion.div
          animate={showRetry ? {} : { scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-20 h-20 bg-[var(--color-surface)] border-4 border-[var(--color-primary)] rounded-full flex items-center justify-center neumorphic mb-6"
        >
          <RefreshCw size={32} className={`text-[var(--color-on-surface)] ${!showRetry ? "animate-spin" : ""}`} />
        </motion.div>

        <h1 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">
          {showRetry ? "Thời gian chờ quá lâu" : "Đang chuẩn bị hồ sơ"}
        </h1>
        <p className="text-sm font-medium text-[var(--color-on-surface-variant)] mb-8">
          {showRetry
            ? "Mạng có vẻ chậm hoặc server đang bị lỗi. Hãy bấm thử lại để tải tiếp nhé."
            : "Vui lòng đợi một lát, hệ thống đang đồng bộ tài khoản an toàn cho bạn."}
        </p>

        {authUserId && (
          <div className="absolute top-4 w-full text-center left-0">
            <span className="text-[10px] font-mono text-[var(--color-on-surface-variant)]/60">
              Đang kiểm tra ID: {authUserId.split('-')[0]}...
            </span>
          </div>
        )}

        {showRetry ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="w-full py-3 bg-[var(--color-primary)] text-[var(--color-on-surface)] font-bold rounded-full shadow-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Thử lại
          </motion.button>
        ) : (
          <div className="w-full h-1.5 bg-[var(--color-on-surface-variant)]/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="h-full w-1/2 bg-[var(--color-primary)] rounded-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
