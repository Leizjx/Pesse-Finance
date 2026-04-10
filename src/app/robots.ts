import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pesse-finance.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/register', '/forgot-password', '/verify-otp'],
      disallow: ['/dashboard', '/api', '/sync-profile', '/auth/callback'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
