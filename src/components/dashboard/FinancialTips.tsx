"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp } from 'lucide-react';
import { Transaction } from '@/lib/types';

interface FinancialTipsProps {
  transactions: Transaction[];
}

const staticTips = [
  "Create a monthly budget and stick to it.",
  "Automate your savings by setting up regular transfers.",
  "Review your subscriptions and cancel unused ones.",
  "Build an emergency fund covering 3-6 months of expenses.",
  "Pay off high-interest debt as quickly as possible.",
  "Track your spending to identify areas for improvement.",
  "Set clear financial goals (e.g., buying a house, retirement).",
  "Cook more meals at home instead of eating out.",
  "Compare prices before making significant purchases.",
  "Invest in your financial education continuously."
];

const FinancialTips: React.FC<FinancialTipsProps> = ({ transactions }) => {
  // This component can be enhanced with more dynamic tips based on 'transactions'
  // For now, it will display a random static tip.
  const [currentTip, setCurrentTip] = React.useState("");

  React.useEffect(() => {
    // Select a random tip on mount and if transactions change (placeholder for future logic)
    // For now, just picks one random tip.
    setCurrentTip(staticTips[Math.floor(Math.random() * staticTips.length)]);
  }, [transactions]);


  // Example of a dynamic tip (can be expanded)
  const getDynamicTip = () => {
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const foodExpenses = transactions
      .filter(t => t.type === 'expense' && (t.category.toLowerCase().includes('food') || t.category.toLowerCase().includes('dining')))
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalExpenses > 0 && (foodExpenses / totalExpenses) > 0.3) {
      return "You're spending a significant portion on food. Consider meal planning or cooking at home more often to save.";
    }
    return null;
  }

  const dynamicTip = getDynamicTip();

  return (
    <Card className="bg-background text-foreground border border-border shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Financial Tips
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Get daily tips to improve your financial health.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dynamicTip ? (
            <p className="text-muted-foreground text-sm leading-relaxed">{dynamicTip}</p>
        ) : (
            currentTip && <p className="text-muted-foreground text-sm leading-relaxed">{currentTip}</p>
        )}
         {!dynamicTip && !currentTip && (
            <p className="text-muted-foreground text-sm">No tips available at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialTips;
