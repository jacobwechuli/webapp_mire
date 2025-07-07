import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | GoldPlus',
  description: 'Access your GoldPlus account to manage your finances, goals, and more.',
  openGraph: {
    title: 'Login | GoldPlus',
    description: 'Access your GoldPlus account to manage your finances, goals, and more.',
    url: 'http://goldplus-advisory.com/login',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Login',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Login | GoldPlus',
    description: 'Access your GoldPlus account to manage your finances, goals, and more.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/login',
  },
}; 