"use client";

import React from 'react';
import { Transaction, TransactionType } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { List, TrendingUp, TrendingDown, Edit3, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEditTransaction, onDeleteTransaction }) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const sortedTransactions = [...transactions].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col rounded-lg p-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <List className="mr-2 h-6 w-6" /> Recent Transactions
        </CardTitle>
        <CardDescription>Your latest financial activities.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        {sortedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <List className="w-16 h-16 mb-4 opacity-50" />
            <p>No transactions yet.</p>
            <p className="text-sm">Add a transaction to get started!</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <ul className="divide-y divide-border">
              {sortedTransactions.map((t) => (
                <li key={t.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {t.type === 'income' ? (
                        <TrendingUp className="h-4 w-4 text-gold" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium text-muted-foreground">{t.category}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{format(new Date(t.date), 'PPP')}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className={`font-semibold ${t.type === 'income' ? 'text-gold' : 'text-destructive'}`}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditTransaction(t)}>
                      <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleteTransaction(t.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionList;
