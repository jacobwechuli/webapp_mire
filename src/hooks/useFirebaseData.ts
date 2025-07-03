import { useState, useEffect, useCallback } from 'react';
import { FirebaseService } from '@/lib/firebaseService';
import { FirebaseTransaction, FirebaseSavingsGoal, FirebaseBill } from '@/lib/firebaseDataStructure';
import { Transaction } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export const useFirebaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<FirebaseTransaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<FirebaseSavingsGoal[]>([]);
  const [bills, setBills] = useState<FirebaseBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseService, setFirebaseService] = useState<FirebaseService | null>(null);

  // Initialize Firebase service when user is available
  useEffect(() => {
    if (user?.id) {
      const service = new FirebaseService(user.id);
      setFirebaseService(service);
    }
  }, [user?.id]);

  // Set up real-time listeners
  useEffect(() => {
    if (!firebaseService) return;

    const unsubscribeTransactions = firebaseService.subscribeToTransactions((data) => {
      setTransactions(data);
    });

    const unsubscribeSavingsGoals = firebaseService.subscribeToSavingsGoals((data) => {
      setSavingsGoals(data);
    });

    const unsubscribeBills = firebaseService.subscribeToBills((data) => {
      setBills(data);
    });

    setLoading(false);

    return () => {
      unsubscribeTransactions();
      unsubscribeSavingsGoals();
      unsubscribeBills();
    };
  }, [firebaseService]);

  // Transaction operations
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    if (!firebaseService) return;

    try {
      const firebaseTransaction: Omit<FirebaseTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
      };

      await firebaseService.addTransaction(firebaseTransaction);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<FirebaseTransaction>) => {
    if (!firebaseService) return;

    try {
      await firebaseService.updateTransaction(id, updates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  const deleteTransaction = useCallback(async (id: string) => {
    if (!firebaseService) return;

    try {
      await firebaseService.deleteTransaction(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  // Savings goals operations
  const addSavingsGoal = useCallback(async (goal: Omit<FirebaseSavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseService) return;

    try {
      await firebaseService.addSavingsGoal(goal);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add savings goal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  const updateSavingsGoal = useCallback(async (id: string, updates: Partial<FirebaseSavingsGoal>) => {
    if (!firebaseService) return;

    try {
      await firebaseService.updateSavingsGoal(id, updates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update savings goal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  const deleteSavingsGoal = useCallback(async (id: string) => {
    if (!firebaseService) return;

    try {
      await firebaseService.deleteSavingsGoal(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete savings goal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  // Bills operations
  const addBill = useCallback(async (bill: Omit<FirebaseBill, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseService) return;

    try {
      await firebaseService.addBill(bill);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bill. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  const updateBill = useCallback(async (id: string, updates: Partial<FirebaseBill>) => {
    if (!firebaseService) return;

    try {
      await firebaseService.updateBill(id, updates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bill. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  const deleteBill = useCallback(async (id: string) => {
    if (!firebaseService) return;

    try {
      await firebaseService.deleteBill(id);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  return {
    // Data
    transactions,
    savingsGoals,
    goals: savingsGoals,
    bills,
    loading,
    
    // Transaction operations
    addTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Savings goals operations
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addGoal: addSavingsGoal,
    updateGoal: updateSavingsGoal,
    
    // Bills operations
    addBill,
    updateBill,
    deleteBill,
  };
}; 