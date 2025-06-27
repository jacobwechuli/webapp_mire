import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { income, expenses } = await req.json();
  // Dummy logic for now
  return NextResponse.json({
    suggestions: [
      { category: 'Food', suggestion: 'Reduce eating out to save more.' },
      { category: 'Entertainment', suggestion: 'Limit streaming subscriptions.' },
    ],
  });
} 