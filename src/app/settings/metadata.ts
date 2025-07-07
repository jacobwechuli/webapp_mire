import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | GoldPlus',
  description: 'Customize your GoldPlus experience and manage your account settings.',
  openGraph: {
    title: 'Settings | GoldPlus',
    description: 'Customize your GoldPlus experience and manage your account settings.',
    url: 'http://goldplus-advisory.com/settings',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Settings',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Settings | GoldPlus',
    description: 'Customize your GoldPlus experience and manage your account settings.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/settings',
  },
}; 