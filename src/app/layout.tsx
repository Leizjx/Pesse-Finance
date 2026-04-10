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
    default: "Pesse Finance - Quản lý tài chính cá nhân thông minh",
    template: "%s | Pesse Finance",
  },
  description:
    "Pesse Finance giúp bạn tự động theo dõi thu chi, quản lý ngân sách và đạt được mục tiêu tiết kiệm với sự hỗ trợ của AI.",
  keywords: ["quản lý tài chính", "thu chi", "ngân sách", "tiết kiệm", "tài chính cá nhân", "Pesse Finance", "AI finance"],
  authors: [{ name: "Pesse Finance Team" }],
  creator: "Pesse Finance",
  publisher: "Pesse Finance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://pesse.finance'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Pesse Finance - Quản lý tài chính cá nhân thông minh",
    description: "Tự động hóa việc quản lý tài chính của bạn với Pesse. Theo dõi thu chi, ngân sách và mục tiêu tiết kiệm một cách dễ dàng.",
    url: 'https://pesse.finance',
    siteName: 'Pesse Finance',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Pesse Finance - Quản lý tài chính cá nhân thông minh",
    description: "Tự động hóa việc quản lý tài chính của bạn với Pesse Finance.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
