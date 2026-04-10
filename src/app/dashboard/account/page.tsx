import React from 'react';
import type { Metadata } from 'next';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: "Cài đặt Tài khoản | Pesse Finance",
  description: "Quản lý thông tin cá nhân, thiết lập bảo mật sinh trắc học và tùy chỉnh quyền riêng tư cho tài khoản Pesse của bạn.",
};

export default function AccountPage() {
  return <AccountClient />;
}
