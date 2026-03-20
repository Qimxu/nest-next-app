import './globals.css';
import { Metadata } from 'next';
import { ReactNode } from 'react';

// 元数据配置
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  title: {
    default: 'NestNext - Full-Stack Solution',
    template: '%s | NestNext',
  },
  description:
    'An enterprise-grade full-stack template integrating NestJS backend and Next.js frontend',
  icons: {
    icon: '/static/logo.png',
    apple: '/static/logo.png',
  },
  openGraph: {
    title: 'NestNext - Full-Stack Solution',
    description:
      'An enterprise-grade full-stack template integrating NestJS backend and Next.js frontend',
    images: ['/static/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NestNext - Full-Stack Solution',
    description:
      'An enterprise-grade full-stack template integrating NestJS backend and Next.js frontend',
    images: ['/static/logo.png'],
  },
};

// 根布局 - 必须包含 html 和 body 标签
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link rel="icon" href="/static/logo.png" />
        <link rel="apple-touch-icon" href="/static/logo.png" />
        {/* Fonts: Orbitron (display) + Sora (body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Sora:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
