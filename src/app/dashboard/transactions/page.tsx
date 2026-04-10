import React from 'react';
import type { Metadata } from 'next';
import TransactionsClient from './TransactionsClient';

export const metadata: Metadata = {
  title: "Lịch sử Giao dịch",
  description: "Quản lý và tra cứu toàn bộ lịch sử thu chi của bạn. Phân lọc giao dịch theo thời gian, hạng mục và tìm kiếm thông minh.",
};

export default function TransactionsPage() {
  return <TransactionsClient />;
}
