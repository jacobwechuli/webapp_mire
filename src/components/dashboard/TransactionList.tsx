"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { List, TrendingUp, TrendingDown, Edit3, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { FirebaseTransaction } from '@/lib/firebaseDataStructure';

interface TransactionListProps {
  transactions: FirebaseTransaction[];
  onEditTransaction: (transaction: FirebaseTransaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEditTransaction, onDeleteTransaction }) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);
  };

  const sortedTransactions = [...transactions].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <Card className="bg-background text-foreground shadow-lg border border-border">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-card-foreground flex items-center gap-2">
          Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-muted-foreground text-sm">No transactions found.</div>
        ) : (
          <ScrollArea className="h-72">
            <ul className="divide-y divide-border">
              {sortedTransactions.map((t) => (
                <li key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-card-foreground">{t.description}</span>
                      <span className="text-xs text-muted-foreground">{t.category}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.date}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className={`font-semibold ${t.type === 'income' ? 'text-primary' : 'text-muted-foreground'}`}>{t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}</p>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEditTransaction(t)}>
                      <Edit3 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleteTransaction(t.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
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
