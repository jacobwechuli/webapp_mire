import { NextRequest, NextResponse } from 'next/server';
import { suggestBudget } from '@/ai/flows/suggest-budget';
import { apiCache, cacheUtils } from '@/lib/cache';
import { rateLimiters } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await rateLimiters.ai.checkLimit(req);
  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many budget suggestion requests. Please try again later.',
        retryAfter: rateLimitResult.retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
        },
      }
    );
  }

  const { income, expenses } = await req.json();

  if (!income || !expenses) {
    return NextResponse.json({ error: 'Income and expenses are required' }, { status: 400 });
  }

  try {
    // Generate cache key based on income and expenses
    const cacheKey = cacheUtils.generateApiKey('suggest-budget', {
      income,
      expenses: JSON.stringify(expenses) // Stringify to ensure consistent key
    });

    // Check cache first
    const cached = apiCache.get<any>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const result = await suggestBudget({ income, expenses });
    
    // Cache the result for 5 minutes since budget suggestions don't change frequently
    apiCache.set(cacheKey, result, 5 * 60 * 1000);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting budget suggestion:', error);
    return NextResponse.json({ error: 'Failed to get budget suggestion' }, { status: 500 });
  }
} 