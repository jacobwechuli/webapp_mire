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
import { PlusCircle, Coins, LogOut, User, Loader2 } from 'lucide-react';
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
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { FirebaseTransaction, FirebaseBill } from '@/lib/firebaseDataStructure';
import FloatingActionButton from '@/components/ui/floating-action-button';
import { useProfile } from '@/hooks/useProfile';

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
    income: '',
    incomeFrequency: 'monthly',
    expenses: [{ category: '', amount: '' }],
  });

  const { toast } = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Firebase data hook
  const {
    transactions,
    bills,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBill,
  } = useFirebaseData();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!profileLoading && profile && !profile.onboardingComplete) {
      setShowOnboarding(true);
      setOnboardingData({
        displayName: profile.displayName || '',
        income: profile.budget?.income?.toString() || '',
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
        income: profile?.budget?.income?.toString() || '',
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
        for (const transaction of transactions) {
          await deleteTransaction(transaction.id);
        }
      } else {
        const filteredTransactions = transactions.filter(t => t.type === type);
        deletedCount = filteredTransactions.length;
        typeLabel = type === 'income' ? 'income transactions' : 'expense transactions';
        // Delete filtered transactions
        for (const transaction of filteredTransactions) {
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

  const handleExpenseChange = (idx: number, field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      expenses: prev.expenses.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp),
    }));
  };

  const addExpenseRow = () => {
    setOnboardingData(prev => ({ ...prev, expenses: [...prev.expenses, { category: '', amount: '' }] }));
  };

  const removeExpenseRow = (idx: number) => {
    setOnboardingData(prev => ({ ...prev, expenses: prev.expenses.filter((_, i) => i !== idx) }));
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: onboardingData.displayName,
      onboardingComplete: true,
      budget: {
        income: Number(onboardingData.income) || undefined,
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
              <Card className="animate-fade-in bg-card border border-border">
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
              <Card className="animate-fade-in delay-100 bg-card border border-border">
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
              <Card className="animate-fade-in delay-200 bg-card border border-border">
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
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="animate-fade-in delay-300 bg-card border border-border">
              <CardContent className="p-6">
                <SpendingChart transactions={transactions} />
              </CardContent>
            </Card>
            <Card className="animate-fade-in delay-400 bg-card border border-border">
              <CardContent className="p-6">
                <AiBudgetAdvisor transactions={transactions} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="animate-fade-in delay-500 bg-card border border-border">
              <CardContent className="p-6">
                <FinancialTips transactions={transactions} />
              </CardContent>
            </Card>
            <Card className="animate-fade-in delay-600 bg-card border border-border">
              <CardContent className="p-6">
                <UpcomingBillsCard bills={bills} onUpdateBills={handleUpdateBills} />
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fade-in delay-700 bg-card border border-border">
            <CardContent className="p-6">
              <TransactionList 
                transactions={transactions}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Floating Action Button with Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <FloatingActionButton 
                onClick={() => {
                  setIsFormOpen(true);
                  setEditingTransaction(null);
                }}
                className="left-6 right-auto"
                size="lg"
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            Add Transaction
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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
      <Dialog open={showOnboarding}>
        <DialogContent className="max-w-lg w-full bg-background text-foreground border border-border">
          <DialogHeader>
            <DialogTitle>Let's start with creating a budget for you</DialogTitle>
            <DialogDescription>
              To help you get the most out of GoldPlus, please tell us your name and set up your budget. You can skip this step if you prefer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOnboardingSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium mb-1">Monthly/Weekly/Other Income</label>
              <input
                type="number"
                className="input input-bordered w-full bg-card text-foreground border rounded px-3 py-2"
                value={onboardingData.income}
                onChange={e => handleOnboardingChange('income', e.target.value)}
                placeholder="e.g. 50000"
                min="0"
              />
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
              {onboardingData.expenses.map((exp, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1 bg-card text-foreground border rounded px-3 py-2"
                    value={exp.category}
                    onChange={e => handleExpenseChange(idx, 'category', e.target.value)}
                    placeholder="Category (e.g. Rent, Food)"
                  />
                  <input
                    type="number"
                    className="input input-bordered w-32 bg-card text-foreground border rounded px-3 py-2"
                    value={exp.amount}
                    onChange={e => handleExpenseChange(idx, 'amount', e.target.value)}
                    placeholder="Amount"
                    min="0"
                  />
                  {onboardingData.expenses.length > 1 && (
                    <button type="button" className="text-red-500" onClick={() => removeExpenseRow(idx)}>&times;</button>
                  )}
                </div>
              ))}
              <button type="button" className="text-primary underline text-sm" onClick={addExpenseRow}>+ Add another</button>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button type="button" className="btn btn-outline" onClick={handleOnboardingSkip}>Skip</button>
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
