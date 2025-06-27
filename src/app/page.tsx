'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Menu, User, CreditCard, PiggyBank, TrendingUp, Shield, Zap, Calendar, Briefcase, BookOpen, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react';
import { useRef, useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const testimonials = [
  {
    quote: "GoldPlus helped me save for my first car in just 8 months!",
    name: "— Jane, Nairobi",
  },
  {
    quote: "I finally feel in control of my finances.",
    name: "— Peter, Mombasa",
  },
  {
    quote: "The AI tips are so helpful and easy to follow.",
    name: "— Aisha, Kisumu",
  },
];

function TestimonialCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: 'snap',
    slides: {
      perView: 1,
      spacing: 30,
    },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });
  const timer = useRef<NodeJS.Timeout | null>(null);
  const mouseOver = useRef(false);

  useEffect(() => {
    if (!slider.current) return;
    function next() {
      if (mouseOver.current) return;
      slider.current?.next();
    }
    timer.current = setInterval(next, 4000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [slider]);

  return (
    <section className="py-16 bg-black/20 backdrop-blur-md text-white relative">
      <div
        ref={sliderRef}
        className="keen-slider max-w-2xl mx-auto"
        onMouseEnter={() => { mouseOver.current = true; }}
        onMouseLeave={() => { mouseOver.current = false; }}
      >
        {testimonials.map(({ quote, name }, i) => (
          <div
            key={i}
            className="keen-slider__slide px-6 text-center space-y-6"
          >
            <div className="text-7xl font-bold text-yellow-400 leading-none">“</div>
            <p className="text-2xl md:text-3xl font-medium text-gray-100 leading-relaxed">
              {quote}
            </p>
            <div className="text-7xl font-bold text-yellow-400 leading-none">”</div>
            <p className="text-lg font-semibold text-yellow-300">{name}</p>
          </div>
        ))}
        {/* Navigation Arrows */}
        <button
          aria-label="Previous testimonial"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-yellow-400/80 text-yellow-400 hover:text-black rounded-full p-2 z-10 transition-colors"
          onClick={() => slider.current?.prev()}
          style={{outline: 'none'}}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <button
          aria-label="Next testimonial"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-yellow-400/80 text-yellow-400 hover:text-black rounded-full p-2 z-10 transition-colors"
          onClick={() => slider.current?.next()}
          style={{outline: 'none'}}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
      {/* Dots Navigation */}
      <div className="flex justify-center mt-8 gap-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to testimonial ${idx + 1}`}
            className={`w-3 h-3 rounded-full border-2 border-yellow-400 transition-all ${currentSlide === idx ? 'bg-yellow-400' : 'bg-transparent'}`}
            onClick={() => slider.current?.moveToIdx(idx)}
            style={{outline: 'none'}}
          />
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 bg-black/80 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Image src="/images/goldplus-logo.png" alt="GoldPlus Logo" width={40} height={40} className="rounded" />
          <span className="text-2xl font-bold text-white tracking-tight">GoldPlus</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="bg-yellow-400/90 hover:bg-yellow-400 text-black">
              <Menu className="h-7 w-7" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-neutral-900 border border-yellow-400 text-white min-w-[160px]">
            <DropdownMenuItem asChild>
              <Link href="/about">About Us</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/login">Login</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/contact">Contact</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12 relative">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* <div className="flex justify-center">
            <span className="flex items-center gap-2 bg-neutral-800/80 text-yellow-400 px-4 py-2 rounded-full font-medium text-base shadow">
              <CheckCircle className="h-5 w-5" /> No Credit Check. No Hidden Fees.
            </span>
          </div> */}
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Welcome to GoldPlus<br />Empowering Your<br />
            <span className="text-yellow-400">Financial Journey</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            Take control of your money, build healthy savings habits, and unlock your financial future with GoldPlus.
          </p>
          <Link href="/signup" passHref>
            <Button size="lg" variant="gold" className="px-10 py-5 text-lg font-semibold shadow-lg hover:scale-105 transition-transform">
              Get Started <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-10 px-4 bg-black/90">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-neutral-900/80 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-7 w-7 text-yellow-400" />
              <span className="font-bold text-lg">Track Your Spending</span>
            </div>
            <p className="text-gray-300">See where your money goes, spot trends, and make smarter decisions.</p>
          </div>
          <div className="bg-neutral-900/80 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <PiggyBank className="h-7 w-7 text-yellow-400" />
              <span className="font-bold text-lg">Automated Savings</span>
            </div>
            <p className="text-gray-300">Set goals and let GoldPlus move money to savings automatically.</p>
          </div>
          <div className="bg-neutral-900/80 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-7 w-7 text-yellow-400" />
              <span className="font-bold text-lg">AI Budget Advisor</span>
            </div>
            <p className="text-gray-300">Personalized tips and smart suggestions to help you save more.</p>
          </div>
          <div className="bg-neutral-900/80 rounded-2xl p-6 flex flex-col gap-4 shadow-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-7 w-7 text-yellow-400" />
              <span className="font-bold text-lg">Bill Reminders</span>
            </div>
            <p className="text-gray-300">Never miss a payment. Get timely reminders for upcoming bills.</p>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <TestimonialCarousel />

      {/* How It Works */}
      <section className="py-12 px-4 bg-black/95">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <User className="h-8 w-8 text-yellow-400 mb-2" />
              <span className="font-semibold">Sign Up</span>
              <span className="text-gray-400 text-sm">Create your free account in minutes.</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-yellow-400 mb-2" />
              <span className="font-semibold">Connect Accounts</span>
              <span className="text-gray-400 text-sm">Securely link your bank or mobile money.</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp className="h-8 w-8 text-yellow-400 mb-2" />
              <span className="font-semibold">Set Goals</span>
              <span className="text-gray-400 text-sm">Choose what you want to save for.</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Briefcase className="h-8 w-8 text-yellow-400 mb-2" />
              <span className="font-semibold">Track & Grow</span>
              <span className="text-gray-400 text-sm">Watch your savings grow and get tips.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Our <span className="text-yellow-400">Products</span>
          </h2>
          <div className="flex justify-center gap-4 mb-8">
            <Button className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-full shadow hover:bg-yellow-300">For Individuals</Button>
            <Button variant="outline" className="border-yellow-400 text-yellow-400 font-bold px-6 py-2 rounded-full shadow hover:bg-yellow-400 hover:text-black">For Businesses</Button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-neutral-900/80 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg">
              <CreditCard className="h-8 w-8 text-yellow-400" />
              <span className="font-bold text-lg">Checking Accounts</span>
              <span className="text-gray-400 text-center text-sm">Easy access to your funds, with no monthly fees.</span>
            </div>
            <div className="bg-neutral-900/80 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg">
              <PiggyBank className="h-8 w-8 text-yellow-400" />
              <span className="font-bold text-lg">Savings Accounts</span>
              <span className="text-gray-400 text-center text-sm">Earn competitive interest and reach your goals faster.</span>
            </div>
            <div className="bg-neutral-900/80 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg">
              <BookOpen className="h-8 w-8 text-yellow-400" />
              <span className="font-bold text-lg">Financial Literacy</span>
              <span className="text-gray-400 text-center text-sm">Learn, grow, and master your money with our tutorials.</span>
            </div>
            <div className="bg-neutral-900/80 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg">
              <Briefcase className="h-8 w-8 text-yellow-400" />
              <span className="font-bold text-lg">Business Tools</span>
              <span className="text-gray-400 text-center text-sm">Manage cash flow, pay bills, and grow your business.</span>
            </div>
            <div className="bg-neutral-900/80 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg">
              <Shield className="h-8 w-8 text-yellow-400" />
              <span className="font-bold text-lg">Secure & Private</span>
              <span className="text-gray-400 text-center text-sm">Your data is encrypted and never sold. Your privacy is our priority.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 px-4 bg-black/95">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl font-bold">Ready to start your journey to financial freedom?</h2>
          <Link href="/signup" passHref>
            <Button size="lg" variant="gold" className="px-10 py-5 text-lg font-semibold shadow-lg hover:scale-105 transition-transform">
              Create Your Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 bg-black/90">
        <div className="container mx-auto text-center space-y-2">
          <div className="flex justify-center gap-6 text-gray-400 text-sm mb-2">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/docs/PrivacyPolicy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
            <Link href="/docs/TermsofService_TOS_.html" target="_blank" rel="noopener noreferrer">Terms</Link>
          </div>
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} GoldPlus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
