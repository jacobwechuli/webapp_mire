import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GoldPlus - Personal Finance Manager',
  description: 'Track your income and expenses, visualize spending, and get AI-powered budget advice with GoldPlus.',
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
        <div className="flex">
          <Sidebar />
          <div className="flex-1 transition-all duration-300">
            <AuthProvider>
              {children}
            </AuthProvider>
            <Toaster />
          </div>
        </div>
      </body>
    </html>
  );
}
