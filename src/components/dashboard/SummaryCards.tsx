"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/lib/types';
import { Landmark, TrendingDown, Wallet, Eye, RotateCcw } from 'lucide-react';
import TransactionHistoryModal from './TransactionHistoryModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, isSameMonth, parseISO, subMonths } from 'date-fns';

interface SummaryCardsProps {
  transactions: Transaction[];
  onReset: (type: 'income' | 'expense' | 'all') => void;
  showOnly?: number[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions, onReset, showOnly }) => {
  const [modalState, setModalState] = useState({ isOpen: false, type: 'all' as 'income' | 'expense' | 'all', title: '' });
  const [resetDialog, setResetDialog] = useState({ isOpen: false, type: 'all' as 'income' | 'expense' | 'all', title: '' });
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Filter transactions for the selected month (default: current month)
  const filteredTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), selectedMonth));
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(amount);
  };

  const handleCardClick = (type: 'income' | 'expense' | 'all', title: string) => {
    setModalState({ isOpen: true, type, title });
  };

  const handleResetClick = (e: React.MouseEvent, type: 'income' | 'expense' | 'all', title: string) => {
    e.stopPropagation();
    setResetDialog({ isOpen: true, type, title });
  };

  const confirmReset = () => {
    onReset(resetDialog.type);
    setResetDialog(prev => ({ ...prev, isOpen: false }));
  };

  const cardData = [
    {
      key: 'income',
      title: 'Total Revenue',
      value: totalIncome,
      description: 'Click to view revenue history',
      Icon: Landmark,
      color: 'text-gold-dark',
      titleColor: 'text-gold-dark',
      onCardClick: () => handleCardClick('income', 'Income History'),
      onResetClick: (e: React.MouseEvent) => handleResetClick(e, 'income', 'Income'),
      showReset: true,
    },
    {
      key: 'expense',
      title: 'Total Expenditure',
      value: totalExpenses,
      description: 'Click to view expenditure history',
      Icon: TrendingDown,
      color: 'text-destructive',
      titleColor: 'text-destructive',
      onCardClick: () => handleCardClick('expense', 'Expense History'),
      onResetClick: (e: React.MouseEvent) => handleResetClick(e, 'expense', 'Expenses'),
      showReset: true,
    },
    {
      key: 'balance',
      title: 'Net Balance',
      value: balance,
      description: 'Click to view all transactions',
      Icon: Wallet,
      color: balance >= 0 ? 'text-gold' : 'text-destructive',
      titleColor: 'text-gold',
      onCardClick: () => handleCardClick('all', 'All Transactions'),
      onResetClick: () => {},
      showReset: false,
    },
  ];

  const indices = showOnly ?? [0, 1, 2];
  const cardsToRender = indices.map(i => cardData[i]).filter(Boolean);

  return (
    <>
      {cardsToRender.map((card, idx) => (
        <Card
          key={card.key}
          borderless
          className="bg-background text-foreground shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] rounded-lg"
          onClick={card.onCardClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium text-card-foreground`}>{card.title}</CardTitle>
            <div className="flex items-center gap-2">
              <card.Icon className={`h-5 w-5 ${card.color}`} />
              <Eye className="h-4 w-4 text-muted-foreground" />
              {/* Add History button for income and expenses */}
              {['income', 'expense'].includes(card.key) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 px-2 py-1 text-xs"
                  onClick={e => {
                    e.stopPropagation();
                    setModalState({ isOpen: true, type: card.key as 'income' | 'expense', title: `${card.title} History` });
                  }}
                >
                  History
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-3xl font-bold text-card-foreground`}>{formatCurrency(card.value)}</div>
              {card.showReset && (
                 <Button
                    variant="gold"
                    size="sm"
                    onClick={card.onResetClick}
                    className="h-8 w-8 p-0"
                    title={`Reset ${card.key}`}
                  >
                    <RotateCcw className="h-4 w-4 text-primary-foreground" />
                  </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground pt-1">{card.description}</p>
          </CardContent>
        </Card>
      ))}

      {/* History Modal for Income/Expenses */}
      <TransactionHistoryModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        transactions={transactions}
        type={modalState.type}
        title={modalState.title}
        monthSelector
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      <AlertDialog open={resetDialog.isOpen} onOpenChange={() => setResetDialog(prev => ({...prev, isOpen: false}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset {resetDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {resetDialog.type === 'all' ? 'transactions' : resetDialog.type}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="bg-destructive hover:bg-destructive/90">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SummaryCards;