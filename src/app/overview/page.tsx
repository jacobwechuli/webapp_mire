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
import { PlusCircle, Trash2, Coins, LogOut, User, Loader2, TrendingUp, TrendingDown, Flag, BarChart3, Calculator } from 'lucide-react';
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
  const [showMpesaDialog, setShowMpesaDialog] = useState(false);
  const { profile, loading: profileLoading, updateProfile } = useProfile();

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserFirstName = () => {
    if (profile?.displayName) {
      return profile.displayName.split(' ')[0];
    }
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  // Calculate today's transactions (last 24 hours)
  const getTodayTransactions = () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= twentyFourHoursAgo;
    });
  };

  const todayTransactions = getTodayTransactions();
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const todayExpense = todayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  // Get recent transactions (last 3)
  const recentTransactions = transactions.slice(0, 3);

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

      <main className="flex-1 w-full py-8 px-4 md:px-8 bg-background text-foreground">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* Header - Personal Greeting */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {getGreeting()}, {getUserFirstName()}
              </h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors cursor-pointer">
                  <span className="text-primary-foreground font-bold text-lg">
                    {getUserFirstName().charAt(0).toUpperCase()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border border-border text-card-foreground min-w-[160px]">
                <DropdownMenuItem onClick={() => router.push('/profile')} className="text-base py-2">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="text-base py-2">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/theme')} className="text-base py-2">
                  Theme
                </DropdownMenuItem>
                <DropdownMenuItem className="text-base py-2 text-primary cursor-pointer">
                  Upgrade Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-base py-2 text-destructive cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Today's Snapshot Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Today's Snapshot</h2>
            
            {/* Money In and Money Out Cards - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Money In Card */}
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Money In</p>
                <p className="text-xl font-bold text-foreground">
                  KES {todayIncome.toLocaleString()}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    M-Pesa: KES {todayIncome.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cash & Bank: KES 0
                  </p>
                </div>
              </div>

              {/* Money Out Card */}
              <div className="bg-card border border-border rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingDown className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Money Out</p>
                <p className="text-xl font-bold text-foreground">
                  KES {todayExpense.toLocaleString()}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    M-Pesa: KES {todayExpense.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cash & Bank: KES 0
                  </p>
                </div>
              </div>
            </div>

            {/* Goal Card - Below Money In/Out */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <Flag className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">No Goals Set</p>
                  <p className="text-sm text-muted-foreground">Set your first goal</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-full bg-border rounded-full h-2 mb-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-sm font-semibold text-foreground">0%</p>
              </div>
            </div>
          </div>

          {/* AI Budget Advisor Banner */}
          <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black">AI Budget Advisor</h2>
                  <p className="text-black/80">Get personalized tips to optimize your savings and spending</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const event = new CustomEvent('open-lina-chatbot');
                  window.dispatchEvent(event);
                }}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 shadow-md"
              >
                Get Tips
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
              <button 
                onClick={() => router.push('/expenditure')}
                className="text-primary font-medium hover:underline"
              >
                View All {'>'}
              </button>
            </div>
            
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-card border border-border rounded-xl p-4 flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-muted">
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4 text-secondary" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                  </div>
                  <p className={`font-semibold ${transaction.type === 'income' ? 'text-secondary' : 'text-primary'}`}>
                    {transaction.type === 'income' ? '+' : '-'} KES {transaction.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* M-Pesa Statistics */}
              <button 
                onClick={() => setShowMpesaDialog(true)}
                className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">View your M-Pesa</p>
                <p className="font-semibold text-foreground">Statistics</p>
              </button>

              {/* Personal Goals */}
              <button 
                onClick={() => router.push('/goals')}
                className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Flag className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm text-muted-foreground">Add personal</p>
                <p className="font-semibold text-foreground">Goals</p>
              </button>

              {/* Budget Playground */}
              <button 
                onClick={() => router.push('/budgeting')}
                className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calculator className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-sm text-muted-foreground">Create your</p>
                <p className="font-semibold text-foreground">Budget</p>
              </button>
            </div>
          </div>

          {/* Web Dashboard */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">GoldPlus Web Dashboard</h2>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/bills')}
                className="bg-card border border-border rounded-xl p-4 w-full text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="w-6 h-6 text-primary mr-3 mt-1">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Bills & Subscriptions</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter your timely bills and subscriptions to avoid getting caught unprepared
                    </p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => router.push('/stats')}
                className="bg-card border border-border rounded-xl p-4 w-full text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="w-6 h-6 text-secondary mr-3 mt-1">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Monthly Stats</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Compare your logged transactions to your budget
                    </p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => router.push('/budgeting')}
                className="bg-card border border-border rounded-xl p-4 w-full text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="w-6 h-6 text-blue-500 mr-3 mt-1">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Budget</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your budget, play around with figures and get a budget document
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
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

      {/* M-Pesa Statistics Dialog */}
      <AlertDialog open={showMpesaDialog} onOpenChange={setShowMpesaDialog}>
        <AlertDialogContent className="bg-card text-card-foreground border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Install Our Mobile App</AlertDialogTitle>
            <AlertDialogDescription>
              To view your M-Pesa statistics and import transactions, you need to install our mobile app. The app provides real-time M-Pesa transaction tracking and detailed analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/api/download-apk';
                link.download = 'goldplus-advisory-v1.apk';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setShowMpesaDialog(false);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Download App
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


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
