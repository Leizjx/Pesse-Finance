import React from 'react';
import type { Metadata } from 'next';
import BudgetClient from './BudgetClient';

export const metadata: Metadata = {
  title: "Quản lý Ngân sách | Pesse Finance",
  description: "Thiết lập và theo dõi hạn mức chi tiêu cho từng danh mục. Pesse giúp bạn kiểm soát tài chính và tránh vung tay quá trán.",
};

export default function BudgetPage() {
  return <BudgetClient />;
}
