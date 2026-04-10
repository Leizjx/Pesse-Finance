import React from 'react';
import type { Metadata } from 'next';
import ReportsClient from './ReportsClient';

export const metadata: Metadata = {
  title: "Báo cáo Tài chính",
  description: "Xem phân tích chi tiêu chi tiết theo tuần và tháng. Pesse AI cung cấp những lời khuyên thông minh giúp bạn tối ưu hóa dòng tiền.",
};

export default function ReportsPage() {
  return <ReportsClient />;
}
