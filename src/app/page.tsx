import React from 'react';
import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: "Pesse Finance - Quản lý tài chính cá nhân tự động bằng AI",
  description: "Tự động hóa việc quản lý tài chính cá nhân với Pesse Finance. Theo dõi thu chi, quản lý ngân sách và tiết kiệm thông minh chỉ trong vài phút với trợ lý AI chuyên nghiệp.",
  keywords: ["quản lý tài chính cá nhân", "tự động hóa thu chi", "tiết kiệm thông minh", "trợ lý tài chính AI", "Pesse Finance", "app quản lý chi tiêu"],
  openGraph: {
    title: "Pesse Finance - Quản lý tài chính cá nhân tự động bằng AI",
    description: "Giải pháp quản lý tài chính thông minh giúp bạn kiểm soát dòng tiền và đạt mục tiêu tự do tài chính nhanh hơn.",
    url: 'https://pesse-finance.vercel.app',
    siteName: 'Pesse Finance',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Pesse Finance - Quản lý tài chính cá nhân tự động bằng AI",
    description: "Tự động hóa chi tiêu, ngân sách và tiết kiệm thông minh với trợ lý AI.",
  },
  alternates: {
    canonical: 'https://pesse-finance.vercel.app',
  }
};

export default function LandingPage() {
  return <LandingClient />;
}
