import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginPageContent from './LoginPageContent';

export const metadata: Metadata = {
  title: "Đăng nhập | Pesse Finance",
  description: "Đăng nhập vào tài khoản Pesse Finance của bạn để quản lý thu chi và ngân sách thông minh.",
  robots: {
    index: false, // Don't index login page for security/utility reasons
    follow: true,
  }
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center p-6 bg-[var(--color-background)]"><div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
