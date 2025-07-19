import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-b from-yellow-50 to-white py-16 px-4 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-yellow-700">
        Take control of your money.
      </h1>
      <p className="text-xl sm:text-2xl mb-2 text-gray-700">
        Track your income, plan your budget, and reach your financial goals — no spreadsheets needed.
      </p>
      <p className="text-lg mb-6 text-gray-600">
        Automate your budget, increase your savings.<br />
        See where your money goes — instantly.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/signup">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all">
            Get Started Free
          </button>
        </Link>
        <Link href="/login">
          <button className="bg-white border border-yellow-500 text-yellow-700 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-yellow-50 transition-all">
            Log In
          </button>
        </Link>
      </div>
    </section>
  );
} 