
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, AlertCircle } from 'lucide-react'; // Removed CheckCircle as it was used for success toast
import { Transaction } from '@/lib/types';
import { suggestBudget, SuggestBudgetInput, SuggestBudgetOutput } from '@/ai/flows/suggest-budget';
import { useToast } from "@/hooks/use-toast";

interface AiBudgetAdvisorProps {
  transactions: Transaction[];
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
      const result = await suggestBudget(input);
      setSuggestions(result);
      // Success toast removed as per guideline: "Use toast components for only displaying errors"
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
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <Wand2 className="mr-2 h-6 w-6" /> AI Budget Advisor
        </CardTitle>
        <CardDescription>Get personalized tips from our AI to optimize your savings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGetSuggestions} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Generating Tips...' : 'Get AI Budget Tips'}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions && suggestions.suggestions.length > 0 && (
          <div className="space-y-3 pt-4">
            <h3 className="text-lg font-semibold text-foreground">Here are your AI-powered suggestions:</h3>
            <ul className="list-disc list-inside space-y-2 pl-2 text-sm text-muted-foreground">
              {suggestions.suggestions.map((suggestion, index) => (
                <li key={index}>
                  <strong className="text-foreground">{suggestion.category}:</strong> {suggestion.suggestion}
                </li>
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
