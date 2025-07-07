import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Theme | GoldPlus',
  description: 'Customize your GoldPlus dashboard theme and personalize your experience.',
  openGraph: {
    title: 'Theme | GoldPlus',
    description: 'Customize your GoldPlus dashboard theme and personalize your experience.',
    url: 'http://goldplus-advisory.com/theme',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Theme',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Theme | GoldPlus',
    description: 'Customize your GoldPlus dashboard theme and personalize your experience.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/theme',
  },
}; 