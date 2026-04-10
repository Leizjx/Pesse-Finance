import React from 'react';
import type { Metadata } from 'next';
import ChatClient from './ChatClient';

export const metadata: Metadata = {
  title: "Chat AI Advisor | Pesse Finance",
  description: "Trợ lý ảo Pesse AI Advisor - Tư vấn tài chính thông minh dựa trên dữ liệu thực tế của bạn.",
};

export default function ChatPage() {
  return <ChatClient />;
}
