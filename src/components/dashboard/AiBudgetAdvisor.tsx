"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, AlertCircle, Sparkles, Brain, RefreshCw } from 'lucide-react';
import { Transaction } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

interface AiBudgetAdvisorProps {
  transactions: Transaction[];
}

// Define types locally (or import if you have a shared types file)
export interface SuggestBudgetInput {
  income: number;
  expenses: { category: string; amount: number }[];
}
export interface SuggestBudgetOutput {
  suggestions: { category: string; suggestion: string }[];
}

async function getBudgetSuggestions(input: SuggestBudgetInput): Promise<SuggestBudgetOutput> {
  const res = await fetch('/api/suggest-budget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to get suggestions');
  return res.json();
}

const AiBudgetAdvisor: React.FC<AiBudgetAdvisorProps> = ({ transactions }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestBudgetOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions(null);
    setError(null);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const categorizedExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const existing = acc.find(e => e.category === t.category);
        if (existing) {
          existing.amount += t.amount;
        } else {
          acc.push({ category: t.category, amount: t.amount });
        }
        return acc;
      }, [] as { category: string; amount: number }[]);

    if (totalIncome === 0 && categorizedExpenses.length === 0) {
        setError("Please add some income and expenses first to get budget suggestions.");
        setIsLoading(false);
        toast({
          title: "No Data",
          description: "Add income/expenses for AI suggestions.",
          variant: "destructive",
        });
        return;
    }
    if (totalIncome === 0) {
        setError("Please add your income to get personalized budget suggestions.");
        setIsLoading(false);
        toast({
          title: "Income Required",
          description: "Add your income for AI suggestions.",
          variant: "destructive",
        });
        return;
    }
     if (categorizedExpenses.length === 0) {
        setError("Please add some expenses to get budget suggestions.");
        setIsLoading(false);
        toast({
          title: "Expenses Required",
          description: "Add expenses for AI suggestions.",
          variant: "destructive",
        });
        return;
    }

    const input: SuggestBudgetInput = {
      income: totalIncome,
      expenses: categorizedExpenses,
    };

    try {
      const result = await getBudgetSuggestions(input);
      setSuggestions(result);
    } catch (err) {
      console.error("AI Budget Suggestion Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to get suggestions: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to get AI suggestions: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-background text-foreground border border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> AI Budget Advisor
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Get personalized tips from our AI to optimize your savings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="default"
          className="w-full mt-2 text-primary-foreground font-bold bg-primary hover:bg-primary/90"
          onClick={handleGetSuggestions}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5 text-primary-foreground" /> Get AI Budget Tips
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions && suggestions.suggestions.length > 0 && (
          <div className="mt-6 bg-accent p-4 rounded-lg text-card-foreground border border-border">
            <h3 className="font-semibold mb-2 text-card-foreground">AI Tips:</h3>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-muted-foreground">{suggestion.suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        {suggestions && suggestions.suggestions.length === 0 && (
          <p className="text-muted-foreground text-sm pt-2">The AI couldn't find specific suggestions with the current data. Try adding more transaction details.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AiBudgetAdvisor;
