import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | GoldPlus',
  description: 'Create your GoldPlus account to start managing your finances and achieving your goals.',
  openGraph: {
    title: 'Sign Up | GoldPlus',
    description: 'Create your GoldPlus account to start managing your finances and achieving your goals.',
    url: 'http://goldplus-advisory.com/signup',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Sign Up',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sign Up | GoldPlus',
    description: 'Create your GoldPlus account to start managing your finances and achieving your goals.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/signup',
  },
}; 