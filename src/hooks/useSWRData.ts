import useSWR, { mutate } from 'swr';
import { CachedFirebaseService } from '@/lib/cachedFirebaseService';
import { FirebaseTransaction, FirebaseSavingsGoal, FirebaseBill } from '@/lib/firebaseDataStructure';
import { Transaction } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

// SWR fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

// Firebase service fetchers
const createFirebaseFetcher = (service: CachedFirebaseService) => ({
  transactions: () => service.getTransactions(),
  savingsGoals: () => service.getSavingsGoals(),
  bills: () => service.getBills(),
  profile: () => service.getUserProfile(),
});

export const useSWRData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Create Firebase service when user is available
  const service = user?.id ? new CachedFirebaseService(user.id) : null;
  const fetchers = service ? createFirebaseFetcher(service) : null;

  // SWR keys
  const keys = {
    transactions: user?.id ? `transactions-${user.id}` : null,
    savingsGoals: user?.id ? `savingsGoals-${user.id}` : null,
    bills: user?.id ? `bills-${user.id}` : null,
    profile: user?.id ? `profile-${user.id}` : null,
  };

  // SWR hooks
  const {
    data: transactions = [],
    error: transactionsError,
    isLoading: transactionsLoading,
    mutate: mutateTransactions,
  } = useSWR(
    keys.transactions,
    fetchers?.transactions,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const {
    data: savingsGoals = [],
    error: savingsGoalsError,
    isLoading: savingsGoalsLoading,
    mutate: mutateSavingsGoals,
  } = useSWR(
    keys.savingsGoals,
    fetchers?.savingsGoals,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const {
    data: bills = [],
    error: billsError,
    isLoading: billsLoading,
    mutate: mutateBills,
  } = useSWR(
    keys.bills,
    fetchers?.bills,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const {
    data: profile,
    error: profileError,
    isLoading: profileLoading,
    mutate: mutateProfile,
  } = useSWR(
    keys.profile,
    fetchers?.profile,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Optimistic update helpers
  const optimisticUpdate = async <T>(
    key: string,
    optimisticData: T,
    updateFn: () => Promise<void>,
    rollbackFn?: () => void
  ) => {
    // Optimistically update the cache
    await mutate(key, optimisticData, false);

    try {
      // Perform the actual update
      await updateFn();
      // Revalidate to get the latest data
      await mutate(key);
    } catch (error) {
      // Rollback on error
      if (rollbackFn) {
        rollbackFn();
      }
      await mutate(key); // Revalidate to get correct data
      throw error;
    }
  };

  // Transaction operations with optimistic updates
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!service) return;

    const newTransaction: FirebaseTransaction = {
      id: `temp-${Date.now()}`, // Temporary ID
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const optimisticData = [newTransaction, ...transactions];

    await optimisticUpdate(
      keys.transactions!,
      optimisticData,
      async () => {
        await service.addTransaction({
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
        });
      },
      () => {
        // Rollback: remove the optimistic transaction
        mutateTransactions(transactions, false);
      }
    );

    toast({
      title: "Success",
      description: "Transaction added successfully.",
    });
  };

  const updateTransaction = async (id: string, updates: Partial<FirebaseTransaction>) => {
    if (!service) return;

    const optimisticData = transactions.map(t => 
      t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
    );

    await optimisticUpdate(
      keys.transactions!,
      optimisticData,
      async () => {
        await service.updateTransaction(id, updates);
      },
      () => {
        // Rollback: restore original transaction
        mutateTransactions(transactions, false);
      }
    );

    toast({
      title: "Success",
      description: "Transaction updated successfully.",
    });
  };

  const deleteTransaction = async (id: string) => {
    if (!service) return;

    const optimisticData = transactions.filter(t => t.id !== id);

    await optimisticUpdate(
      keys.transactions!,
      optimisticData,
      async () => {
        await service.deleteTransaction(id);
      },
      () => {
        // Rollback: restore deleted transaction
        mutateTransactions(transactions, false);
      }
    );

    toast({
      title: "Success",
      description: "Transaction deleted successfully.",
    });
  };

  // Savings goals operations with optimistic updates
  const addSavingsGoal = async (goal: Omit<FirebaseSavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!service) return;

    const newGoal: FirebaseSavingsGoal = {
      id: `temp-${Date.now()}`,
      ...goal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const optimisticData = [newGoal, ...savingsGoals];

    await optimisticUpdate(
      keys.savingsGoals!,
      optimisticData,
      async () => {
        await service.addSavingsGoal(goal);
      },
      () => {
        mutateSavingsGoals(savingsGoals, false);
      }
    );

    toast({
      title: "Success",
      description: "Savings goal added successfully.",
    });
  };

  const updateSavingsGoal = async (id: string, updates: Partial<FirebaseSavingsGoal>) => {
    if (!service) return;

    const optimisticData = savingsGoals.map(g => 
      g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
    );

    await optimisticUpdate(
      keys.savingsGoals!,
      optimisticData,
      async () => {
        await service.updateSavingsGoal(id, updates);
      },
      () => {
        mutateSavingsGoals(savingsGoals, false);
      }
    );

    toast({
      title: "Success",
      description: "Savings goal updated successfully.",
    });
  };

  const deleteSavingsGoal = async (id: string) => {
    if (!service) return;

    const optimisticData = savingsGoals.filter(g => g.id !== id);

    await optimisticUpdate(
      keys.savingsGoals!,
      optimisticData,
      async () => {
        await service.deleteSavingsGoal(id);
      },
      () => {
        mutateSavingsGoals(savingsGoals, false);
      }
    );

    toast({
      title: "Success",
      description: "Savings goal deleted successfully.",
    });
  };

  // Bills operations with optimistic updates
  const addBill = async (bill: Omit<FirebaseBill, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!service) return;

    const newBill: FirebaseBill = {
      id: `temp-${Date.now()}`,
      ...bill,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const optimisticData = [newBill, ...bills];

    await optimisticUpdate(
      keys.bills!,
      optimisticData,
      async () => {
        await service.addBill(bill);
      },
      () => {
        mutateBills(bills, false);
      }
    );

    toast({
      title: "Success",
      description: "Bill added successfully.",
    });
  };

  const updateBill = async (id: string, updates: Partial<FirebaseBill>) => {
    if (!service) return;

    const optimisticData = bills.map(b => 
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );

    await optimisticUpdate(
      keys.bills!,
      optimisticData,
      async () => {
        await service.updateBill(id, updates);
      },
      () => {
        mutateBills(bills, false);
      }
    );

    toast({
      title: "Success",
      description: "Bill updated successfully.",
    });
  };

  const deleteBill = async (id: string) => {
    if (!service) return;

    const optimisticData = bills.filter(b => b.id !== id);

    await optimisticUpdate(
      keys.bills!,
      optimisticData,
      async () => {
        await service.deleteBill(id);
      },
      () => {
        mutateBills(bills, false);
      }
    );

    toast({
      title: "Success",
      description: "Bill deleted successfully.",
    });
  };

  // Profile operations
  const updateProfile = async (updates: any) => {
    if (!service) return;

    const optimisticData = profile ? { ...profile, ...updates } : profile;

    await optimisticUpdate(
      keys.profile!,
      optimisticData,
      async () => {
        await service.updateUserProfile(updates);
      },
      () => {
        mutateProfile(profile, false);
      }
    );

    toast({
      title: "Success",
      description: "Profile updated successfully.",
    });
  };

  // Error handling
  const handleError = (error: any, operation: string) => {
    console.error(`${operation} error:`, error);
    toast({
      title: "Error",
      description: `Failed to ${operation}. Please try again.`,
      variant: "destructive",
    });
  };

  // Check for errors
  if (transactionsError) handleError(transactionsError, 'load transactions');
  if (savingsGoalsError) handleError(savingsGoalsError, 'load savings goals');
  if (billsError) handleError(billsError, 'load bills');
  if (profileError) handleError(profileError, 'load profile');

  return {
    // Data
    transactions: transactions as FirebaseTransaction[],
    savingsGoals: savingsGoals as FirebaseSavingsGoal[],
    bills: bills as FirebaseBill[],
    profile,
    
    // Loading states
    loading: transactionsLoading || savingsGoalsLoading || billsLoading || profileLoading,
    transactionsLoading,
    savingsGoalsLoading,
    billsLoading,
    profileLoading,
    
    // Operations
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addBill,
    updateBill,
    deleteBill,
    updateProfile,
    
    // Mutate functions
    mutateTransactions,
    mutateSavingsGoals,
    mutateBills,
    mutateProfile,
  };
}; 