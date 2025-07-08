import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tutorials | GoldPlus',
  description: 'Explore personal finance and entrepreneurship tutorials with GoldPlus.',
  openGraph: {
    title: 'Tutorials | GoldPlus',
    description: 'Explore personal finance and entrepreneurship tutorials with GoldPlus.',
    url: 'http://goldplus-advisory.com/tutorials',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Tutorials',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tutorials | GoldPlus',
    description: 'Explore personal finance and entrepreneurship tutorials with GoldPlus.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/tutorials',
  },
}; 