import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Overview | GoldPlus',
  description: 'See your financial overview, track spending, and get AI-powered insights with GoldPlus.',
  openGraph: {
    title: 'Overview | GoldPlus',
    description: 'See your financial overview, track spending, and get AI-powered insights with GoldPlus.',
    url: 'http://goldplus-advisory.com/overview',
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
    title: 'Overview | GoldPlus',
    description: 'See your financial overview, track spending, and get AI-powered insights with GoldPlus.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/overview',
  },
}; 