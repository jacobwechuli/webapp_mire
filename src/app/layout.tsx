import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
// import Sidebar from '@/components/layout/Sidebar';
import ClientLayout from './ClientLayout';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'GoldPlus - Personal Finance Manager',
    template: '%s | GoldPlus',
  },
  description: 'Track your income and expenses, visualize spending, and get AI-powered budget advice with GoldPlus.',
  openGraph: {
    title: 'GoldPlus - Personal Finance Manager',
    description: 'Track your income and expenses, visualize spending, and get AI-powered budget advice with GoldPlus.',
    url: 'http://goldplus-advisory.com',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Dashboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoldPlus - Personal Finance Manager',
    description: 'Track your income and expenses, visualize spending, and get AI-powered budget advice with GoldPlus.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {/* <Sidebar /> */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
