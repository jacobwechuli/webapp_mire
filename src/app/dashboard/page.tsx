"use client";

import React, { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Transaction } from '@/lib/types';
import SummaryCards from '@/components/dashboard/SummaryCards';
import SpendingChart from '@/components/dashboard/SpendingChart';
import AiBudgetAdvisor from '@/components/dashboard/AiBudgetAdvisor';
import FinancialTips from '@/components/dashboard/FinancialTips';
import TransactionForm from '@/components/dashboard/TransactionForm';
import TransactionList from '@/components/dashboard/TransactionList';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Coins, LogOut, User } from 'lucide-react';
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
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/layout/DashboardHeader';
import UpcomingBillsCard from '@/components/dashboard/UpcomingBillsCard';

function DashboardContent() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('goldplus-transactions', []);
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { toast } = useToast();
  const { user, logout } = useAuth();
  const router = useRouter();

  // Bills state (localStorage-backed for now)
  const [bills, setBills] = useLocalStorage('bills', [
    // Example default bills
    {
      id: '1',
      name: 'Netflix',
      amount: 15.99,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Streaming subscription',
      frequency: 'Monthly',
    },
    {
      id: '2',
      name: 'Rent',
      amount: 1200,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Apartment rent',
      frequency: 'Monthly',
    },
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
      // Success toast removed as per guideline: "Use toast components for only displaying errors"
    } else {
      setTransactions(prev => [...prev, transaction]);
      // Success toast removed as per guideline
    }
    setEditingTransaction(null);
    setIsFormOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };
  
  const handleDeleteTransaction = (transactionId: string) => {
    setTransactionToDelete(transactionId);
  };

  const confirmDeleteTransaction = () => {
    if (transactionToDelete) {
      const deletedTransaction = transactions.find(t => t.id === transactionToDelete);
      setTransactions(prev => prev.filter(t => t.id !== transactionToDelete));
      toast({ title: "Transaction Deleted", description: `"${deletedTransaction?.description || 'Transaction'}" has been deleted.`, variant: "destructive" });
      setTransactionToDelete(null);
    }
  };

  const handleReset = (type: 'income' | 'expense' | 'all') => {
    let deletedCount = 0;
    let typeLabel = '';

    if (type === 'all') {
      deletedCount = transactions.length;
      typeLabel = 'all transactions';
      setTransactions([]);
    } else {
      const filteredTransactions = transactions.filter(t => t.type === type);
      deletedCount = filteredTransactions.length;
      typeLabel = type === 'income' ? 'income transactions' : 'expense transactions';
      setTransactions(prev => prev.filter(t => t.type !== type));
    }

    toast({ 
      title: "Reset Complete", 
      description: `Deleted ${deletedCount} ${typeLabel}.`, 
      variant: "destructive" 
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out successfully", description: "You have been logged out." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to log out. Please try again.", variant: "destructive" });
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Coins className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardHeader onAddTransaction={() => setIsFormOpen(true)} />

      <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
        setIsFormOpen(isOpen);
        if (!isOpen) setEditingTransaction(null);
      }}>
        <DialogContent className="sm:max-w-[480px] p-6 bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline text-primary">
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

      <main className="flex-1 w-full max-w-none py-8 px-4 md:px-8">
        <div className="space-y-8">
          <div className="grid gap-6 mb-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SummaryCards 
                transactions={transactions} 
                onReset={handleReset} 
                showOnly={[0, 1, 2]}
              />
            </div>
            <div>
              <UpcomingBillsCard bills={bills} setBills={setBills} />
            </div>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <SpendingChart transactions={transactions} />
            <AiBudgetAdvisor transactions={transactions} />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
             <FinancialTips transactions={transactions} />
             <div className="lg:col-span-2">
                <TransactionList 
                    transactions={transactions} 
                    onEditTransaction={handleEditTransaction}
                    onDeleteTransaction={handleDeleteTransaction}
                />
             </div>
          </div>
        </div>
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t bg-card">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-sm text-center text-muted-foreground md:text-left">
            © {new Date().getFullYear()} GoldPlus. All rights reserved.
          </p>
        </div>
      </footer>

      <AlertDialog open={!!transactionToDelete} onOpenChange={() => setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTransactionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
