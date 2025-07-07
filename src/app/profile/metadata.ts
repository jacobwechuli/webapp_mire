import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | GoldPlus',
  description: 'Manage your GoldPlus profile, update your information, and personalize your experience.',
  openGraph: {
    title: 'Profile | GoldPlus',
    description: 'Manage your GoldPlus profile, update your information, and personalize your experience.',
    url: 'http://goldplus-advisory.com/profile',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Profile',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Profile | GoldPlus',
    description: 'Manage your GoldPlus profile, update your information, and personalize your experience.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/profile',
  },
}; 