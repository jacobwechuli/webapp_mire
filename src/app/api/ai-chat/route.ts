import { NextResponse } from 'next/server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    const body = await req.json();
    const { message, userContext, history, tone } = ChatInputSchema.parse(body);

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
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ reply: 'Sorry, there was an error generating a response.' }, { status: 500 });
  }
} 