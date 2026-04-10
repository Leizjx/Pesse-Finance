import React from 'react';
import type { Metadata } from 'next';
import LandingClient from './LandingClient';

export const metadata: Metadata = {
  title: "Pesse Finance - Quản lý tài chính tự động thông minh",
  description: "Bắt đầu hành trình quản lý tài chính thông minh với Pesse. Tự động hóa chi tiêu, ngân sách và tiết kiệm chỉ trong vài phút.",
  openGraph: {
    title: "Pesse Finance - Tự động hóa quản lý tài chính cá nhân",
    description: "Giải pháp quản lý tài chính cá nhân với AI giúp bạn tiết kiệm thời gian và tiền bạc.",
  }
};

export default function LandingPage() {
  return <LandingClient />;
}
