import { useState, useEffect, useCallback } from 'react';
import { CachedFirebaseService } from '@/lib/cachedFirebaseService';
import { FirebaseTransaction, FirebaseSavingsGoal, FirebaseBill } from '@/lib/firebaseDataStructure';
import { Transaction } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export const useCachedFirebaseData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<FirebaseTransaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<FirebaseSavingsGoal[]>([]);
  const [bills, setBills] = useState<FirebaseBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseService, setFirebaseService] = useState<CachedFirebaseService | null>(null);

  // Initialize cached Firebase service when user is available
  useEffect(() => {
    if (user?.id) {
      const service = new CachedFirebaseService(user.id);
      setFirebaseService(service);
    }
  }, [user?.id]);

  // Set up real-time listeners with cache warming
  useEffect(() => {
    if (!firebaseService) return;

    // Warm up cache by fetching data once
    const warmCache = async () => {
      try {
        const [cachedTransactions, cachedGoals, cachedBills] = await Promise.all([
          firebaseService.getTransactions(),
          firebaseService.getSavingsGoals(),
          firebaseService.getBills(),
        ]);
        
        setTransactions(cachedTransactions);
        setSavingsGoals(cachedGoals);
        setBills(cachedBills);
      } catch (error) {
        console.error('Error warming cache:', error);
      }
    };

    warmCache();

    // Set up real-time listeners
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

  // Transaction operations with cache invalidation
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
      
      toast({
        title: "Success",
        description: "Transaction added successfully.",
      });
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
      
      toast({
        title: "Success",
        description: "Transaction updated successfully.",
      });
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
      
      toast({
        title: "Success",
        description: "Transaction deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  // Savings goals operations with cache invalidation
  const addSavingsGoal = useCallback(async (goal: Omit<FirebaseSavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseService) return;

    try {
      await firebaseService.addSavingsGoal(goal);
      
      toast({
        title: "Success",
        description: "Savings goal added successfully.",
      });
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
      
      toast({
        title: "Success",
        description: "Savings goal updated successfully.",
      });
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
      
      toast({
        title: "Success",
        description: "Savings goal deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete savings goal. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  // Bills operations with cache invalidation
  const addBill = useCallback(async (bill: Omit<FirebaseBill, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!firebaseService) return;

    try {
      await firebaseService.addBill(bill);
      
      toast({
        title: "Success",
        description: "Bill added successfully.",
      });
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
      
      toast({
        title: "Success",
        description: "Bill updated successfully.",
      });
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
      
      toast({
        title: "Success",
        description: "Bill deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [firebaseService, toast]);

  // Cache management functions
  const clearCache = useCallback(() => {
    if (firebaseService) {
      firebaseService.clearUserCache();
      toast({
        title: "Cache Cleared",
        description: "All cached data has been cleared.",
      });
    }
  }, [firebaseService, toast]);

  const getCacheStats = useCallback(() => {
    if (firebaseService) {
      return firebaseService.getCacheStats();
    }
    return null;
  }, [firebaseService]);

  return {
    // Data
    transactions,
    savingsGoals,
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
    
    // Bills operations
    addBill,
    updateBill,
    deleteBill,
    
    // Cache management
    clearCache,
    getCacheStats,
  };
}; 