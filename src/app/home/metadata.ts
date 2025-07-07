import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | GoldPlus',
  description: 'Welcome to GoldPlus – your AI-powered personal finance and entrepreneurship platform.',
  openGraph: {
    title: 'Home | GoldPlus',
    description: 'Welcome to GoldPlus – your AI-powered personal finance and entrepreneurship platform.',
    url: 'http://goldplus-advisory.com/home',
    siteName: 'GoldPlus',
    images: [
      {
        url: '/images/goldplus.jpg',
        width: 1200,
        height: 630,
        alt: 'GoldPlus Home',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Home | GoldPlus',
    description: 'Welcome to GoldPlus – your AI-powered personal finance and entrepreneurship platform.',
    images: ['/images/goldplus.jpg'],
  },
  alternates: {
    canonical: 'http://goldplus-advisory.com/home',
  },
}; 