"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/lib/types';
import { Calendar, DollarSign, Tag } from 'lucide-react';
import { format, isSameMonth, parseISO, subMonths, addMonths } from 'date-fns';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  type: 'income' | 'expense' | 'all';
  title: string;
  monthSelector?: boolean;
  selectedMonth?: Date;
  setSelectedMonth?: (date: Date) => void;
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  type,
  title,
  monthSelector,
  selectedMonth,
  setSelectedMonth
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter by selected month if monthSelector is enabled
  let filteredTransactions = type === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === type);
  if (monthSelector && selectedMonth) {
    filteredTransactions = filteredTransactions.filter(t => isSameMonth(parseISO(t.date), selectedMonth));
  }

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full bg-background text-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-card-foreground flex items-center gap-2">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Month Selector */}
          {monthSelector && selectedMonth && setSelectedMonth && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                className="px-2 py-1 rounded bg-accent text-accent-foreground border border-border"
                onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                title="Previous Month"
              >
                &lt;
              </button>
              <span className="font-semibold text-card-foreground">{format(selectedMonth, 'MMMM yyyy')}</span>
              <button
                className="px-2 py-1 rounded bg-accent text-accent-foreground border border-border"
                onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
                title="Next Month"
                disabled={format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')}
              >
                &gt;
              </button>
            </div>
          )}
          <div className="mb-4 p-4 bg-accent rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total {type === 'all' ? 'Transactions' : type === 'income' ? 'Income' : 'Expenses'}</p>
                <p className="text-2xl font-bold text-card-foreground">{formatCurrency(totalAmount)}</p>
              </div>
              <Badge variant={type === 'income' ? 'default' : type === 'expense' ? 'destructive' : 'secondary'} className="bg-primary text-primary-foreground">
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
              </Badge>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Tag className="h-8 w-8 mb-2 opacity-50 text-muted-foreground" />
                <p>No {type === 'all' ? '' : type} transactions found</p>
              </div>
            ) : (
              <Table className="bg-card text-card-foreground">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Description</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                    <TableRow key={transaction.id} className="border-border">
                      <TableCell className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell className="font-medium text-card-foreground">{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-primary text-primary bg-primary/10">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell className={`text-right font-bold ${transaction.type === 'income' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionHistoryModal; 