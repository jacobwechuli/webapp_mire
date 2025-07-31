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
import { format, isSameMonth, parseISO, subMonths, isAfter, isBefore, subDays, subWeeks, subMonths as dateFnsSubMonths } from 'date-fns';

type TimeFilter = '1d' | '3d' | '1w' | '1m' | 'all';

interface SummaryCardsProps {
  transactions: Transaction[];
  onReset: (type: 'income' | 'expense' | 'all') => void;
  showOnly?: number[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions, onReset, showOnly }) => {
  const [modalState, setModalState] = useState({ isOpen: false, type: 'all' as 'income' | 'expense' | 'all', title: '' });
  const [resetDialog, setResetDialog] = useState({ isOpen: false, type: 'all' as 'income' | 'expense' | 'all', title: '' });
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Filter transactions based on time filter
  const getFilteredTransactions = () => {
    const now = new Date();
    let filterStartDate: Date;

    switch (timeFilter) {
      case '1d':
        filterStartDate = subDays(now, 1);
        break;
      case '3d':
        filterStartDate = subDays(now, 3);
        break;
      case '1w':
        filterStartDate = subWeeks(now, 1);
        break;
      case '1m':
        filterStartDate = dateFnsSubMonths(now, 1);
        break;
      case 'all':
      default:
        filterStartDate = new Date(0); // Beginning of time
        break;
    }

    return transactions.filter(t => {
      if (!t.date) return false;
      
      try {
        const txDate = parseISO(t.date);
        return isAfter(txDate, filterStartDate) && isBefore(txDate, now);
      } catch (error) {
        console.warn('Error parsing transaction date:', t.date, error);
        return false;
      }
    });
  };

  const filteredTransactions = getFilteredTransactions();
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

  const TimeFilterButton = ({ filter, label }: { filter: TimeFilter; label: string }) => (
    <Button
      variant={timeFilter === filter ? "default" : "outline"}
      size="sm"
      onClick={() => setTimeFilter(filter)}
      className={timeFilter === filter ? "bg-gold text-black" : ""}
    >
      {label}
    </Button>
  );

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
      {/* Time Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <TimeFilterButton filter="1d" label="1 Day" />
        <TimeFilterButton filter="3d" label="3 Days" />
        <TimeFilterButton filter="1w" label="1 Week" />
        <TimeFilterButton filter="1m" label="1 Month" />
        <TimeFilterButton filter="all" label="All Time" />
      </div>

      {/* Filter Status */}
      <div className="mb-6 p-3 bg-muted rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          Showing {filteredTransactions.length} transactions for {
            timeFilter === '1d' ? '1 Day' : 
            timeFilter === '3d' ? '3 Days' : 
            timeFilter === '1w' ? '1 Week' : 
            timeFilter === '1m' ? '1 Month' : 'All Time'
          }
        </p>
      </div>

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