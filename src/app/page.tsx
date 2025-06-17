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
import { PlusCircle, Coins } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
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

export default function DashboardPage() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('goldplus-transactions', []);
  const [isMounted, setIsMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
      // Edit existing transaction
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
      toast({ title: "Transaction Updated", description: `"${transaction.description}" has been updated.`, variant: "default" });
    } else {
      // Add new transaction
      setTransactions(prev => [...prev, transaction]);
      toast({ title: "Transaction Added", description: `"${transaction.description}" successfully added.`, variant: "default" });
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


  if (!isMounted) {
    // Optional: return a loading skeleton or null to prevent hydration mismatch issues.
    // This ensures localStorage access only happens client-side after mount.
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Coins className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Coins className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-primary font-headline">GoldPlus</h1>
          </div>
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) setEditingTransaction(null); // Reset editing state when dialog closes
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Transaction
              </Button>
            </DialogTrigger>
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
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="space-y-8">
          <SummaryCards transactions={transactions} />
          
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

      {/* Alert Dialog for Deletion Confirmation */}
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

    </div>
  );
}
