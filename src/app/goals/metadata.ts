import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Goals | GoldPlus',
  description: 'Set, track, and achieve your savings goals with GoldPlus.',
  openGraph: {
    title: 'Goals | GoldPlus',
    description: 'Set, track, and achieve your savings goals with GoldPlus.',
    url: 'http://goldplus-advisory.com/goals',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Goals',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goals | GoldPlus',
    description: 'Set, track, and achieve your savings goals with GoldPlus.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/goals',
  },
}; 