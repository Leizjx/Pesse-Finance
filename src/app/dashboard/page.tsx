import React from 'react';
import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: "Tổng quan Dashboard",
  description: "Trình điều khiển tài chính cá nhân của bạn. Xem số dư, phân tích chi tiêu và quản lý ngân sách thông minh.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
