"use client";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#3E2723] text-white py-8 px-4 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Top navigation */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex flex-col md:flex-row gap-8 text-center md:text-left">
            <Link href="#" className="font-bold hover:underline">ABOUT US</Link>
            <Link href="#" className="font-bold hover:underline">PRODUCTS</Link>
            <Link href="#" className="font-bold hover:underline">AWARDS</Link>
            <Link href="#" className="font-bold hover:underline">HELP</Link>
            <Link href="#" className="font-bold hover:underline">CONTACT</Link>
          </div>
        </div>
        <hr className="w-full border-b border-[#5D4037] mb-6" />
        {/* Center text */}
        <div className="text-center max-w-2xl mb-6 text-sm text-white/90">
          <p>
            Welcome to GoldPlus. We help you master your finances and entrepreneurship journey. For more information, check our policies below or connect with us on social media.
          </p>
        </div>
        {/* Policy links */}
        <div className="flex flex-wrap gap-6 justify-center mb-6">
          <Link href="/docs/PrivacyPolicy.html" className="hover:underline text-white/80">Privacy Policy</Link>
          <a href="/docs/TermsofService_TOS_.html" className="hover:underline text-white/80">Terms of Service</a>
        </div>
        {/* Social icons */}
        <div className="flex gap-6 mb-6">
          <a href="https://www.facebook.com/GoldplusAdvisory/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-yellow-400"><Facebook size={22} /></a>
          <a href="https://x.com/Goldplusadvisor?t=WHY-XenPNEMMOurrz8T8pA&s=09" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="hover:text-yellow-400"><Twitter size={22} /></a>
          <a href="https://www.instagram.com/goldplus_advisory?igsh=MWlldXE5YXE2bWJlYg==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-yellow-400"><Instagram size={22} /></a>
          <a href="https://www.linkedin.com/company/goldplus-advisory/?viewAsMember=true" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-yellow-400"><Linkedin size={22} /></a>
          <a href="mailto:Info@goldplusadvisory.com" aria-label="Email" className="hover:text-yellow-400"><Mail size={22} /></a>
        </div>
        {/* Copyright */}
        <div className="text-xs text-white/60 mt-2">
          © {new Date().getFullYear()} GoldPlus. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 