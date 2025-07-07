import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | GoldPlus',
  description: 'Reset your GoldPlus account password securely and regain access to your finances.',
  openGraph: {
    title: 'Forgot Password | GoldPlus',
    description: 'Reset your GoldPlus account password securely and regain access to your finances.',
    url: 'http://goldplus-advisory.com/forgot-password',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Forgot Password',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Forgot Password | GoldPlus',
    description: 'Reset your GoldPlus account password securely and regain access to your finances.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/forgot-password',
  },
}; 