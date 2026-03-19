import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

// 元数据配置
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ),
  title: {
    default: 'Nest Next App',
    template: '%s | Nest Next App',
  },
  description: 'A modern web application built with NestJS and Next.js',
  icons: {
    icon: '/static/logo.png',
    apple: '/static/logo.png',
  },
  openGraph: {
    title: 'Nest Next App',
    description: 'A modern web application built with NestJS and Next.js',
    images: ['/static/logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nest Next App',
    description: 'A modern web application built with NestJS and Next.js',
    images: ['/static/logo.png'],
  },
};

// 根布局 - 必须包含 html 和 body 标签
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        <link rel="icon" href="/static/logo.png" />
        <link rel="apple-touch-icon" href="/static/logo.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
