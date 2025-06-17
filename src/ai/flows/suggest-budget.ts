// src/ai/flows/suggest-budget.ts
'use server';
/**
 * @fileOverview AI-driven budget suggestion flow.
 *
 * This file contains the Genkit flow for providing users with budget suggestions
 * based on their spending habits, helping them optimize their savings.
 *
 * @interface SuggestBudgetInput - Defines the input schema for the budget suggestion flow.
 * @interface SuggestBudgetOutput - Defines the output schema for the budget suggestion flow.
 * @function suggestBudget - The main function to trigger the budget suggestion flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBudgetInputSchema = z.object({
  income: z.number().describe('The user monthly income.'),
  expenses: z.array(
    z.object({
      category: z.string().describe('The category of the expense.'),
      amount: z.number().describe('The amount spent in the category.'),
    })
  ).describe('A list of expenses with category and amount.'),
});

export type SuggestBudgetInput = z.infer<typeof SuggestBudgetInputSchema>;

const SuggestBudgetOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      category: z.string().describe('The category to optimize.'),
      suggestion: z.string().describe('The suggestion to optimize the budget for the specific category.'),
    })
  ).describe('A list of budget optimization suggestions.'),
});

export type SuggestBudgetOutput = z.infer<typeof SuggestBudgetOutputSchema>;

export async function suggestBudget(input: SuggestBudgetInput): Promise<SuggestBudgetOutput> {
  return suggestBudgetFlow(input);
}

const suggestBudgetPrompt = ai.definePrompt({
  name: 'suggestBudgetPrompt',
  input: {schema: SuggestBudgetInputSchema},
  output: {schema: SuggestBudgetOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's income and expenses and provide personalized budget suggestions.

Income: {{{income}}}
Expenses:
{{#each expenses}}
- Category: {{{category}}}, Amount: {{{amount}}}
{{/each}}

Based on this information, provide a list of budget optimization suggestions. Focus on specific categories where the user can save money. Be direct and concise with the suggestions.
`,
});

const suggestBudgetFlow = ai.defineFlow(
  {
    name: 'suggestBudgetFlow',
    inputSchema: SuggestBudgetInputSchema,
    outputSchema: SuggestBudgetOutputSchema,
  },
  async input => {
    const {output} = await suggestBudgetPrompt(input);
    return output!;
  }
);
