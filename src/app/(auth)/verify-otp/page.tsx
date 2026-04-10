import { Metadata } from "next";
import { Suspense } from "react";
import VerifyOtpContent from "./VerifyOtpContent";

export const metadata: Metadata = {
  title: "Xác thực OTP",
  description: "Xác thực tài khoản Pesse Finance của bạn bằng mã OTP.",
};

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh flex items-center justify-center p-6 bg-[var(--color-background)]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
