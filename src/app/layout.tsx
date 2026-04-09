import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Pesse Finance",
    template: "%s | Pesse Finance",
  },
  description:
    "Quản lý tài chính cá nhân thông minh — theo dõi thu chi, ngân sách và mục tiêu tiết kiệm.",
  keywords: ["quản lý tài chính", "thu chi", "ngân sách", "tiết kiệm", "finance"],
  authors: [{ name: "Pesse Finance" }],
  robots: "noindex, nofollow", // Private app — no public indexing
};

export const viewport: Viewport = {
  themeColor: "#eef0f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
