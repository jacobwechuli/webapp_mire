"use client";

import React, { useState, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SpendingChart from '@/components/dashboard/SpendingChart';
import AiBudgetAdvisor from '@/components/dashboard/AiBudgetAdvisor';
import FinancialTips from '@/components/dashboard/FinancialTips';

import TransactionList from '@/components/dashboard/TransactionList';
import { Loader2 } from 'lucide-react';
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
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  // Remove onboarding modal state and logic

  const { toast } = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();

  // SWR data hook with optimistic updates
  const {
    transactions,
    bills,
    loading,
    deleteTransaction,
    updateBill,
  } = useSWRData();

  // Refs for auto-focus
  const incomeRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const expenseRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Focus new income row
  React.useEffect(() => {
    if (incomeRefs.current.length && profile?.budget?.incomes?.length && profile?.budget?.incomes?.length > 1) {
      const lastIdx = profile.budget.incomes.length - 1;
      incomeRefs.current[lastIdx]?.focus();
    }
  }, [profile?.budget?.incomes?.length]);

  // Focus new expense row
  React.useEffect(() => {
    if (expenseRefs.current.length && profile?.budget?.expenses?.length && profile?.budget?.expenses?.length > 1) {
      const lastIdx = profile.budget.expenses.length - 1;
      expenseRefs.current[lastIdx]?.focus();
    }
  }, [profile?.budget?.expenses?.length]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Remove onboarding modal effect
  useEffect(() => {
    if (!profileLoading && profile && !profile.onboardingComplete) {
      // setShowOnboarding(true); // This line is removed
      // setOnboardingData({ // This line is removed
      //   displayName: profile.displayName || '', // This line is removed
      //   incomes: profile.budget?.incomes?.length // This line is removed
      //     ? profile.budget.incomes.map(i => ({ source: i.source, amount: i.amount.toString() })) // This line is removed
      //     : [{ source: '', amount: '' }], // This line is removed
      //   incomeFrequency: profile.budget?.incomeFrequency || 'monthly', // This line is removed
      //   expenses: profile.budget?.expenses?.length // This line is removed
      //     ? profile.budget.expenses.map(e => ({ category: e.category, amount: e.amount.toString() })) // This line is removed
      //     : [{ category: '', amount: '' }], // This line is removed
      // }); // This line is removed
    }
    // Listen for Adjust Budget event
    const handler = () => {
      // setShowOnboarding(true); // This line is removed
      // setOnboardingData({ // This line is removed
      //   displayName: profile?.displayName || '', // This line is removed
      //   incomes: profile?.budget?.incomes?.length // This line is removed
      //     ? profile.budget.incomes.map(i => ({ source: i.source, amount: i.amount.toString() })) // This line is removed
      //     : [{ source: '', amount: '' }], // This line is removed
      //   incomeFrequency: profile?.budget?.incomeFrequency || 'monthly', // This line is removed
      //   expenses: profile?.budget?.expenses?.length // This line is removed
      //     ? profile.budget.expenses.map(e => ({ category: e.category, amount: e.amount.toString() })) // This line is removed
      //     : [{ category: '', amount: '' }], // This line is removed
      // }); // This line is removed
    };
    window.addEventListener('open-adjust-budget', handler);
    return () => window.removeEventListener('open-adjust-budget', handler);
  }, [profileLoading, profile]);


  
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



  // Remove onboarding modal handlers and calculations
  // Remove onboarding modal JSX

  // Totals
  const totalIncome = profile?.budget?.incomes?.reduce((sum, i) => sum + (Number(i.amount) || 0), 0) || 0;
  const totalExpenses = profile?.budget?.expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
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
                  <UpcomingBillsCard bills={bills} />
                </CardContent>
              </Card>
            </CardTransition>
          </div>

          <CardTransition index={7}>
            <Card className="bg-card border border-border">
              <CardContent className="p-6">
                <TransactionList 
                  transactions={transactions}
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
        {/* Chatbot Button with Tooltip */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <FloatingActionButton
                onClick={() => {
                  const event = new CustomEvent('open-lina-chatbot');
                  window.dispatchEvent(event);
                }}
                size="lg"
                className="right-6 bottom-6"
                icon={<img src="/images/sparkle.png" alt="AI" style={{ width: 32, height: 32 }} />}
                aria-label="Open AI Chatbot"
              />
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
      {/* This block is removed as per the edit hint */}
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
