import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { apiCache, cacheUtils } from '@/lib/cache';
import { rateLimiters } from '@/lib/rateLimit';

const ChatInputSchema = z.object({
  message: z.string(),
  userContext: z.object({
    uid: z.string().optional(),
    email: z.string().optional(),
    displayName: z.string().optional(),
    profile: z.any().optional(),
  }).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'ai']),
    content: z.string(),
  })).optional(),
  tone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
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
    const { message, userContext, history, tone } = ChatInputSchema.parse(body);

    // Generate cache key based on request parameters
    const cacheKey = cacheUtils.generateApiKey('ai-chat', {
      message,
      userContext: userContext?.uid,
      historyLength: history?.length || 0,
      tone
    });

    // Check cache first
    const cached = apiCache.get<{ reply: string }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Compose prompt with user context
    let contextString = '';
    if (userContext) {
      contextString = `User info:\n` +
        (userContext.displayName ? `Name: ${userContext.displayName}\n` : '') +
        (userContext.email ? `Email: ${userContext.email}\n` : '') +
        (userContext.uid ? `User ID: ${userContext.uid}\n` : '');
      if (userContext.profile) {
        const p = userContext.profile;
        if (p.budget) {
          contextString += `Budget info:\n`;
          if (p.budget.income) contextString += `- Income: ${p.budget.income}\n`;
          if (p.budget.incomeFrequency) contextString += `- Income Frequency: ${p.budget.incomeFrequency}\n`;
          if (p.budget.expenses && p.budget.expenses.length > 0) {
            contextString += `- Expenses: ${p.budget.expenses.map((e: { category: string; amount: number }) => `${e.category}: ${e.amount}`).join(', ')}\n`;
          }
        }
        if (p.onboardingComplete !== undefined) {
          contextString += `Onboarding complete: ${p.onboardingComplete}\n`;
        }
        if (p.country) contextString += `Country: ${p.country}\n`;
        if (p.dateOfBirth) contextString += `Date of Birth: ${p.dateOfBirth}\n`;
      }
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