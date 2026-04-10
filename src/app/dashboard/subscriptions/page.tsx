import React from 'react';
import type { Metadata } from 'next';
import SubscriptionsClient from './SubscriptionsClient';

export const metadata: Metadata = {
  title: "Quản lý Hóa đơn | Pesse Finance",
  description: "Tự động phát hiện và theo dịch các dịch vụ đăng ký (Netflix, Spotify, iCloud...) từ Gmail. Nhận thông báo trước ngày nhắc nợ và gia hạn.",
};

export default function SubscriptionsPage() {
  return <SubscriptionsClient />;
}
