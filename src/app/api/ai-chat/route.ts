import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { apiCache, cacheUtils } from '@/lib/cache';
import { rateLimiters } from '@/lib/rateLimit';
import { verifyAuth } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

const ChatInputSchema = z.object({
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'ai']),
    content: z.string(),
  })).optional(),
  tone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // Verify authentication first - derive identity server-side from verified session
    const { user, error: authError } = await verifyAuth(req);
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Apply rate limiting
    const rateLimitResult = await rateLimiters.ai.checkLimit(req);
    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many AI requests. Please try again later.',
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

    const body = await req.json();
    const { message, history, tone } = ChatInputSchema.parse(body);

    // Get user context from database server-side
    const db = getDatabase();
    const userProfile = await db.user.findUnique({
      where: { id: user.uid },
      select: {
        id: true,
        email: true,
        displayName: true,
        country: true,
        dateOfBirth: true,
        onboarding: true,
        onboardingComplete: true,
      },
    });

    // Generate cache key based on request parameters
    const cacheKey = cacheUtils.generateApiKey('ai-chat', {
      message,
      userId: user.uid,
      historyLength: history?.length || 0,
      tone
    });

    // Check cache first
    const cached = apiCache.get<{ reply: string }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Compose prompt with user context derived server-side
    let contextString = '';
    if (userProfile) {
      contextString = `User info:\n` +
        (userProfile.displayName ? `Name: ${userProfile.displayName}\n` : '') +
        (userProfile.email ? `Email: ${userProfile.email}\n` : '') +
        `User ID: ${userProfile.id}\n`;
      if (userProfile.onboarding) {
        const onboarding = userProfile.onboarding as any;
        if (onboarding.budget) {
          contextString += `Budget info:\n`;
          if (onboarding.budget.income) contextString += `- Income: ${onboarding.budget.income}\n`;
          if (onboarding.budget.incomeFrequency) contextString += `- Income Frequency: ${onboarding.budget.incomeFrequency}\n`;
          if (onboarding.budget.expenses && Array.isArray(onboarding.budget.expenses) && onboarding.budget.expenses.length > 0) {
            contextString += `- Expenses: ${onboarding.budget.expenses.map((e: { category: string; amount: number }) => `${e.category}: ${e.amount}`).join(', ')}\n`;
          }
        }
        if (userProfile.onboardingComplete !== undefined) {
          contextString += `Onboarding complete: ${userProfile.onboardingComplete}\n`;
        }
      }
      if (userProfile.country) contextString += `Country: ${userProfile.country}\n`;
      if (userProfile.dateOfBirth) contextString += `Date of Birth: ${userProfile.dateOfBirth}\n`;
    }

    // Compose chat history for context
    let historyString = '';
    if (history && history.length > 0) {
      historyString = 'Chat history:\n' + history.map(h => `${h.role === 'user' ? 'User' : 'AI'}: ${h.content}`).join('\n') + '\n';
    }

    // Add tone instruction
    let toneString = '';
    if (tone) {
      toneString = `Respond in a ${tone} manner.\n`;
    }

    const prompt = `You are a helpful personal finance AI assistant.\n${toneString}${contextString}${historyString}User: ${message}\nAI:`;

    // Use Genkit to get a Gemini response
    const response = await ai.generate(prompt);
    const reply = response.text.trim();
    
    // Cache the response for 2 minutes
    const result = { reply };
    apiCache.set(cacheKey, result, 2 * 60 * 1000);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ reply: 'Sorry, there was an error generating a response.' }, { status: 500 });
  }
}
