import React from 'react';
import type { Metadata } from 'next';
import DataConnectionClient from './DataConnectionClient';

export const metadata: Metadata = {
  title: "Kết nối Dữ liệu | Pesse Finance",
  description: "Tự động đồng bộ giao dịch từ hàng chục ngân hàng và ví điện tử, bảo mật tối đa với công nghệ mã hoá chuẩn quân đội.",
};

export default function DataConnectionPage() {
  return <DataConnectionClient />;
}
