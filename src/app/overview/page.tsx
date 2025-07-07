"use client";

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SpendingChart from '@/components/dashboard/SpendingChart';
import AiBudgetAdvisor from '@/components/dashboard/AiBudgetAdvisor';
import FinancialTips from '@/components/dashboard/FinancialTips';
import TransactionForm from '@/components/dashboard/TransactionForm';
import TransactionList from '@/components/dashboard/TransactionList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Trash2, Coins, LogOut, User, Loader2, MessageCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/layout/DashboardHeader';
import UpcomingBillsCard from '@/components/dashboard/UpcomingBillsCard';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSWRData } from '@/hooks/useSWRData';
import { FirebaseTransaction, FirebaseBill } from '@/lib/firebaseDataStructure';
import FloatingActionButton from '@/components/ui/floating-action-button';
import { useProfile } from '@/hooks/useProfile';
import AiChatbot from '@/components/dashboard/AiChatbot';
import { DashboardSkeleton, TransactionSkeleton } from '@/components/ui/skeleton';
import { CardTransition, ListTransition } from '@/components/layout/PageTransition';
import type { Metadata } from 'next';
import Script from 'next/script';

function DashboardContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FirebaseTransaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  // Onboarding modal state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState({
    displayName: '',
    incomes: [{ source: '', amount: '' }],
    incomeFrequency: 'monthly',
    expenses: [{ category: '', amount: '' }],
  });

  const { toast } = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();

  // SWR data hook with optimistic updates
  const {
    transactions,
    bills,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBill,
  } = useSWRData();

  // Refs for auto-focus
  const incomeRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const expenseRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Focus new income row
  React.useEffect(() => {
    if (incomeRefs.current.length && onboardingData.incomes.length > 1) {
      const lastIdx = onboardingData.incomes.length - 1;
      incomeRefs.current[lastIdx]?.focus();
    }
  }, [onboardingData.incomes.length]);

  // Focus new expense row
  React.useEffect(() => {
    if (expenseRefs.current.length && onboardingData.expenses.length > 1) {
      const lastIdx = onboardingData.expenses.length - 1;
      expenseRefs.current[lastIdx]?.focus();
    }
  }, [onboardingData.expenses.length]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!profileLoading && profile && !profile.onboardingComplete) {
      setShowOnboarding(true);
      setOnboardingData({
        displayName: profile.displayName || '',
        incomes: profile.budget?.incomes?.length
          ? profile.budget.incomes.map(i => ({ source: i.source, amount: i.amount.toString() }))
          : [{ source: '', amount: '' }],
        incomeFrequency: profile.budget?.incomeFrequency || 'monthly',
        expenses: profile.budget?.expenses?.length
          ? profile.budget.expenses.map(e => ({ category: e.category, amount: e.amount.toString() }))
          : [{ category: '', amount: '' }],
      });
    }
    // Listen for Adjust Budget event
    const handler = () => {
      setShowOnboarding(true);
      setOnboardingData({
        displayName: profile?.displayName || '',
        incomes: profile?.budget?.incomes?.length
          ? profile.budget.incomes.map(i => ({ source: i.source, amount: i.amount.toString() }))
          : [{ source: '', amount: '' }],
        incomeFrequency: profile?.budget?.incomeFrequency || 'monthly',
        expenses: profile?.budget?.expenses?.length
          ? profile.budget.expenses.map(e => ({ category: e.category, amount: e.amount.toString() }))
          : [{ category: '', amount: '' }],
      });
    };
    window.addEventListener('open-adjust-budget', handler);
    return () => window.removeEventListener('open-adjust-budget', handler);
  }, [profileLoading, profile]);

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
        });
      } else {
        await addTransaction(transaction);
      }
      setEditingTransaction(null);
      setIsFormOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditTransaction = (transaction: FirebaseTransaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };
  
  const handleDeleteTransaction = (transactionId: string) => {
    setTransactionToDelete(transactionId);
  };

  const confirmDeleteTransaction = async () => {
    if (transactionToDelete) {
      try {
        const deletedTransaction = transactions.find(t => t.id === transactionToDelete);
        await deleteTransaction(transactionToDelete);
        toast({ 
          title: "Transaction Deleted", 
          description: `"${deletedTransaction?.description || 'Transaction'}" has been deleted.`, 
          variant: "destructive" 
        });
        setTransactionToDelete(null);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleReset = async (type: 'income' | 'expense' | 'all') => {
    try {
      let deletedCount = 0;
      let typeLabel = '';

      if (type === 'all') {
        deletedCount = transactions.length;
        typeLabel = 'all transactions';
        // Delete all transactions
        for (const transaction of transactions as FirebaseTransaction[]) {
          await deleteTransaction(transaction.id);
        }
      } else {
        const filteredTransactions = transactions.filter(t => t.type === type);
        deletedCount = filteredTransactions.length;
        typeLabel = type === 'income' ? 'income transactions' : 'expense transactions';
        // Delete filtered transactions
        for (const transaction of filteredTransactions as FirebaseTransaction[]) {
          await deleteTransaction(transaction.id);
        }
      }

      toast({ 
        title: "Reset Complete", 
        description: `Deleted ${deletedCount} ${typeLabel}.`, 
        variant: "destructive" 
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out successfully", description: "You have been logged out." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to log out. Please try again.", variant: "destructive" });
    }
  };

  const handleUpdateBills = async (newBills: FirebaseBill[]) => {
    try {
      // For now, we'll just update the bills state
      // In a real implementation, you'd want to sync this with Firebase
      console.log('Bills updated:', newBills);
    } catch (error) {
      // Error handling
    }
  };

  const handleOnboardingChange = (field: string, value: any) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  const handleIncomeChange = (idx: number, field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      incomes: prev.incomes.map((inc, i) => i === idx ? { ...inc, [field]: value } : inc),
    }));
  };

  const addIncomeRow = () => {
    setOnboardingData(prev => ({ ...prev, incomes: [...prev.incomes, { source: '', amount: '' }] }));
  };

  const removeIncomeRow = (idx: number) => {
    setOnboardingData(prev => ({ ...prev, incomes: prev.incomes.filter((_, i) => i !== idx) }));
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: onboardingData.displayName,
      onboardingComplete: true,
      budget: {
        incomes: onboardingData.incomes
          .filter(i => i.source && i.amount)
          .map(i => ({ source: i.source, amount: Number(i.amount) })),
        incomeFrequency: onboardingData.incomeFrequency as 'monthly' | 'weekly' | 'random',
        expenses: onboardingData.expenses
          .filter(e => e.category && e.amount)
          .map(e => ({ category: e.category, amount: Number(e.amount) })),
      },
    });
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = async () => {
    await updateProfile({ onboardingComplete: true });
    setShowOnboarding(false);
  };

  // Totals
  const totalIncome = onboardingData.incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalExpenses = onboardingData.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const overBudget = totalIncome > 0 && totalExpenses > totalIncome;

  if (!isMounted || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-card-foreground">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  // Show skeleton while loading
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-card-foreground">
      <DashboardHeader />
      
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        setIsFormOpen(isOpen);
        if (!isOpen) setEditingTransaction(null);
      }}>
        <DialogContent className="sm:max-w-[480px] p-6 bg-card text-card-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline text-card-foreground">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingTransaction ? 'Update the details of your transaction.' : 'Enter details for your income or expense.'}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            onAddTransaction={handleAddTransaction} 
            existingTransaction={editingTransaction}
            onClose={() => {
              setIsFormOpen(false);
              setEditingTransaction(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <main className="flex-1 w-full max-w-none py-8 px-4 md:px-8 bg-background text-card-foreground">
        <div className="space-y-8">
          <div className="grid gap-6 mb-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardTransition index={0}>
                <Card className="bg-card border border-border">
                  <CardContent>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div>
                          <SummaryCards 
                            transactions={transactions}
                            onReset={handleReset} 
                            showOnly={[0]}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="bg-card text-card-foreground border border-border">More details about your balance and tips for improvement.</PopoverContent>
                    </Popover>
                  </CardContent>
                </Card>
              </CardTransition>
              <CardTransition index={1}>
                <Card className="bg-card border border-border">
                  <CardContent>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div>
                          <SummaryCards 
                            transactions={transactions}
                            onReset={handleReset} 
                            showOnly={[1]}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="bg-card text-card-foreground border border-border">View detailed income breakdown and trends.</PopoverContent>
                    </Popover>
                  </CardContent>
                </Card>
              </CardTransition>
              <CardTransition index={2}>
                <Card className="bg-card border border-border">
                  <CardContent>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div>
                          <SummaryCards 
                            transactions={transactions}
                            onReset={handleReset} 
                            showOnly={[2]}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="bg-card text-card-foreground border border-border">Analyze your spending patterns and identify areas for improvement.</PopoverContent>
                    </Popover>
                  </CardContent>
                </Card>
              </CardTransition>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CardTransition index={3}>
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <SpendingChart transactions={transactions} />
                </CardContent>
              </Card>
            </CardTransition>
            <CardTransition index={4}>
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <AiBudgetAdvisor transactions={transactions} />
                </CardContent>
              </Card>
            </CardTransition>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CardTransition index={5}>
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <FinancialTips transactions={transactions} />
                </CardContent>
              </Card>
            </CardTransition>
            <CardTransition index={6}>
              <Card className="bg-card border border-border">
                <CardContent className="p-6">
                  <UpcomingBillsCard bills={bills} onUpdateBills={handleUpdateBills} />
                </CardContent>
              </Card>
            </CardTransition>
          </div>

          <CardTransition index={7}>
            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <TransactionList 
                  transactions={transactions}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </CardTransition>
        </div>
      </main>

      {/* Floating Action Buttons with Tooltips (stacked bottom right) */}
      <TooltipProvider>
        {/* Add Transaction Button with Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <FloatingActionButton 
                onClick={() => {
                  setIsFormOpen(true);
                  setEditingTransaction(null);
                }}
                size="lg"
                className="right-6 bottom-24"
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" align="center">
            Add Transaction
          </TooltipContent>
        </Tooltip>
        {/* Chatbot Button with Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                className="fixed right-6 bottom-6 rounded-full shadow-lg p-0 w-14 h-14 flex items-center justify-center"
                variant="default"
                size="icon"
                aria-label="Open AI Chatbot"
                onClick={() => {
                  const event = new CustomEvent('open-lina-chatbot');
                  window.dispatchEvent(event);
                }}
              >
                <MessageCircle size={28} />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" align="center">
            Chat with Lina AI
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Lina AI Chatbot Dialog (global, listens for open-lina-chatbot event) */}
      <AiChatbot eventTrigger="open-lina-chatbot" />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent className="bg-card text-card-foreground border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-card text-card-foreground border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? Your data will be saved automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Onboarding Modal */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-[480px] p-6 bg-card text-card-foreground border border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Let's start with creating a budget for you</DialogTitle>
            <DialogDescription>
              To help you get the most out of GoldPlus, please tell us your name and set up your budget. You can skip this step if you prefer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOnboardingSubmit} className="space-y-4 pb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                className="input input-bordered w-full bg-card text-foreground border rounded px-3 py-2"
                value={onboardingData.displayName}
                onChange={e => handleOnboardingChange('displayName', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Income Sources</label>
              <div className="flex flex-col gap-2">
                {onboardingData.incomes.map((inc, idx) => {
                  const isLast = idx === onboardingData.incomes.length - 1;
                  const canAdd = inc.source && inc.amount;
                  return (
                    <div key={idx} className="flex gap-2 items-center bg-muted/30 rounded p-2">
                      <input
                        ref={el => { incomeRefs.current[idx] = el; }}
                        type="text"
                        className="input input-bordered flex-1 bg-card text-foreground border rounded px-3 py-2"
                        value={inc.source}
                        onChange={e => handleIncomeChange(idx, 'source', e.target.value)}
                        placeholder="Source (e.g. Salary, Freelance)"
                        autoComplete="off"
                      />
                      <input
                        type="number"
                        className="input input-bordered w-28 bg-card text-foreground border rounded px-3 py-2"
                        value={inc.amount}
                        onChange={e => handleIncomeChange(idx, 'amount', e.target.value)}
                        placeholder="Amount"
                        min="0"
                        autoComplete="off"
                      />
                      {onboardingData.incomes.length > 1 && (
                        <button type="button" className="text-destructive hover:bg-destructive/10 rounded p-1" onClick={() => removeIncomeRow(idx)} title="Remove income">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                      {isLast && (
                        <button
                          type="button"
                          className={`text-primary hover:bg-primary/10 rounded p-1 ml-1 ${!canAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={canAdd ? addIncomeRow : undefined}
                          title={canAdd ? 'Add income' : 'Fill in this row to add another'}
                          aria-label="Add income"
                          disabled={!canAdd}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Income Frequency</label>
              <select
                className="input input-bordered w-full bg-card text-foreground border rounded px-3 py-2"
                value={onboardingData.incomeFrequency}
                onChange={e => handleOnboardingChange('incomeFrequency', e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="random">Random</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usual Expenditure</label>
              <div className="flex flex-col gap-2">
                {onboardingData.expenses.map((exp, idx) => {
                  const isLast = idx === onboardingData.expenses.length - 1;
                  const canAdd = exp.category && exp.amount;
                  return (
                    <div key={idx} className="flex gap-2 items-center bg-muted/30 rounded p-2">
                      <input
                        ref={el => { expenseRefs.current[idx] = el; }}
                        type="text"
                        className="input input-bordered flex-1 bg-card text-foreground border rounded px-3 py-2"
                        value={exp.category}
                        onChange={e => handleOnboardingChange('expenses', (prev: { category: string; amount: string }[]) => prev.map((ex, i: number) => i === idx ? { ...ex, category: e.target.value } : ex))}
                        placeholder="Category (e.g. Rent, Food)"
                        autoComplete="off"
                      />
                      <input
                        type="number"
                        className="input input-bordered w-28 bg-card text-foreground border rounded px-3 py-2"
                        value={exp.amount}
                        onChange={e => handleOnboardingChange('expenses', (prev: { category: string; amount: string }[]) => prev.map((ex, i: number) => i === idx ? { ...ex, amount: e.target.value } : ex))}
                        placeholder="Amount"
                        min="0"
                        autoComplete="off"
                      />
                      {onboardingData.expenses.length > 1 && (
                        <button type="button" className="text-destructive hover:bg-destructive/10 rounded p-1" onClick={() => handleOnboardingChange('expenses', (prev: { category: string; amount: string }[], _idx: number = idx) => prev.filter((_, i: number) => i !== _idx))} title="Remove expense">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                      {isLast && (
                        <button
                          type="button"
                          className={`text-primary hover:bg-primary/10 rounded p-1 ml-1 ${!canAdd ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={canAdd ? () => handleOnboardingChange('expenses', (prev: { category: string; amount: string }[]) => [...prev, { category: '', amount: '' }]) : undefined}
                          title={canAdd ? 'Add expense' : 'Fill in this row to add another'}
                          aria-label="Add expense"
                          disabled={!canAdd}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Sticky Totals/Footer */}
            <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border mt-6 pt-4 pb-2 z-10 flex flex-col items-center gap-2">
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                <div className="font-bold text-lg text-primary">Total Income: KES {totalIncome.toLocaleString()}</div>
                <div className="font-bold text-lg text-destructive">Total Expenditure: KES {totalExpenses.toLocaleString()}</div>
              </div>
              {overBudget && (
                <div className="text-sm text-destructive font-semibold">Warning: Your expenses exceed your income!</div>
              )}
              <div className="flex gap-2 justify-center pt-2 w-full">
                <button type="button" className="btn btn-outline w-full max-w-[120px]" onClick={handleOnboardingSkip}>Skip</button>
                <button type="submit" className="btn btn-primary w-full max-w-[120px]">Save</button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <>
      <Script id="overview-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Overview | GoldPlus",
          "url": "http://goldplus-advisory.com/overview",
          "description": "See your financial overview, track spending, and get AI-powered insights with GoldPlus.",
        })}
      </Script>
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </>
  );
}
