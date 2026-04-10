import React from 'react';
import type { Metadata } from 'next';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: "Đăng ký tài khoản | Pesse Finance",
  description: "Tham gia cùng hàng ngàn người đang quản lý tài chính thông minh hơn với Pesse Finance. Đăng ký ngay hôm nay!",
  openGraph: {
    title: "Đăng ký Pesse Finance - Bắt đầu hành trình tài chính mới",
    description: "Tạo tài khoản Pesse Finance để trải nghiệm quản lý tài chính tự động với AI.",
  }
};

export default function RegisterPage() {
  return <RegisterClient />;
}
