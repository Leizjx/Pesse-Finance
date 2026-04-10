import React from 'react';
import type { Metadata } from 'next';
import PremiumClient from './PremiumClient';

export const metadata: Metadata = {
  title: "Nâng cấp Premium | Pesse Finance",
  description: "Trải nghiệm toàn bộ tính năng thông minh cao cấp của Pesse Finance. Mở khóa AI Advisor, quét hóa đơn tự động và hơn thế nữa.",
};

export default function PremiumPage() {
  return <PremiumClient />;
}
