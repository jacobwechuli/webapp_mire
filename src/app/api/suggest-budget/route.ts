import { NextRequest, NextResponse } from 'next/server';
import { suggestBudget } from '@/ai/flows/suggest-budget';

export async function POST(req: NextRequest) {
  const { income, expenses } = await req.json();

  if (!income || !expenses) {
    return NextResponse.json({ error: 'Income and expenses are required' }, { status: 400 });
  }

  try {
    const result = await suggestBudget({ income, expenses });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting budget suggestion:', error);
    return NextResponse.json({ error: 'Failed to get budget suggestion' }, { status: 500 });
  }
} 