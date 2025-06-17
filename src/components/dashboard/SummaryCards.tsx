"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Transaction } from '@/lib/types';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Landmark } from 'lucide-react';

interface SummaryCardsProps {
  transactions: Transaction[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions }) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary">Total Income</CardTitle>
          <Landmark className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground pt-1">All income received</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-destructive">Total Expenses</CardTitle>
          <TrendingDown className="h-5 w-5 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground pt-1">All expenses paid</p>
        </CardContent>
      </Card>
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-accent">Net Balance</CardTitle>
          <Wallet className="h-5 w-5 text-accent" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-destructive'}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground pt-1">{balance >= 0 ? "Your current savings" : "Your current deficit"}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
