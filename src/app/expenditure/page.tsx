"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { createFirebaseService } from '@/lib/firebaseService';
import { FirebaseExpenditure } from '@/lib/firebaseDataStructure';
import { Loader2, Trash2, Edit3, PlusCircle, Eye } from 'lucide-react';
import TransactionForm from '@/components/dashboard/TransactionForm';
import { Transaction } from '@/lib/types';
import { format, parseISO } from 'date-fns';

export default function ExpenditurePage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [expenditures, setExpenditures] = useState<FirebaseExpenditure[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpenditure, setEditingExpenditure] = useState<FirebaseExpenditure | null>(null);
  const [error, setError] = useState('');
  const [preSelectedType, setPreSelectedType] = useState<'income' | 'expense' | undefined>(undefined);

  // Handle URL parameters for pre-selecting transaction type
  useEffect(() => {
    if (!searchParams) return;
    const typeParam = searchParams.get('type');
    if (typeParam === 'income' || typeParam === 'expense') {
      setPreSelectedType(typeParam);
      setShowForm(true);
      // Clear the URL parameter to avoid showing form on refresh
      router.replace('/expenditure');
    }
  }, [searchParams, router]);

  // Fetch expenditures from Firebase
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchExpenditures = async () => {
      setLoading(true);
      try {
        const firebaseService = createFirebaseService(user.id);
        const data = await firebaseService.getExpenditure();
        setExpenditures(data);
      } catch (err) {
        console.error('Error fetching expenditures:', err);
        setError('Failed to load expenditures.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenditures();
  }, [user?.id]);

  // Handle adding new expenditure
  const handleAddExpenditure = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user?.id) {
      setError('User not authenticated.');
      return;
    }

    try {
      const firebaseService = createFirebaseService(user.id);
      await firebaseService.addExpenditure({
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
        notes: '', // Transaction form doesn't have notes field
      });
      
      // Refresh expenditures list
      const updatedExpenditures = await firebaseService.getExpenditure();
      setExpenditures(updatedExpenditures);
      setShowForm(false);
      setError('');
    } catch (err) {
      console.error('Error adding expenditure:', err);
      setError('Failed to add expenditure.');
    }
  };

  // Handle updating expenditure
  const handleUpdateExpenditure = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user?.id || !editingExpenditure) {
      setError('User not authenticated or no expenditure selected.');
      return;
    }

    try {
      const firebaseService = createFirebaseService(user.id);
      await firebaseService.updateExpenditure(editingExpenditure.id, {
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
      });
      
      // Refresh expenditures list
      const updatedExpenditures = await firebaseService.getExpenditure();
      setExpenditures(updatedExpenditures);
      setEditingExpenditure(null);
      setShowForm(false);
      setError('');
    } catch (err) {
      console.error('Error updating expenditure:', err);
      setError('Failed to update expenditure.');
    }
  };

  // Handle deleting expenditure
  const handleDeleteExpenditure = async (id: string) => {
    if (!user?.id) {
      setError('User not authenticated.');
      return;
    }

    try {
      const firebaseService = createFirebaseService(user.id);
      await firebaseService.deleteExpenditure(id);
      
      // Refresh expenditures list
      const updatedExpenditures = await firebaseService.getExpenditure();
      setExpenditures(updatedExpenditures);
      setError('');
    } catch (err) {
      console.error('Error deleting expenditure:', err);
      setError('Failed to delete expenditure.');
    }
  };

  // Handle edit click
  const handleEdit = (expenditure: FirebaseExpenditure) => {
    setEditingExpenditure(expenditure);
    setShowForm(true);
  };

  // Handle form close
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExpenditure(null);
    setPreSelectedType(undefined);
    setError('');
  };

  // Calculate totals
  const totalExpenditure = expenditures.reduce((sum, exp) => sum + exp.amount, 0);
  const thisMonthExpenditure = expenditures
    .filter(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Expenditure Tracking</h1>
          <p className="text-muted-foreground">
            Track your manual expenses and expenditures. This is separate from your M-Pesa transactions.
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Expenditure
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card borderless>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">KES {totalExpenditure.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Expenditure</div>
          </CardContent>
        </Card>
        <Card borderless>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-destructive">KES {thisMonthExpenditure.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <TransactionForm
              onAddTransaction={editingExpenditure ? handleUpdateExpenditure : handleAddExpenditure}
              existingTransaction={editingExpenditure ? {
                id: editingExpenditure.id,
                description: editingExpenditure.description,
                amount: editingExpenditure.amount,
                type: 'expense',
                category: editingExpenditure.category,
                date: editingExpenditure.date,
                createdAt: editingExpenditure.createdAt,
                updatedAt: editingExpenditure.updatedAt,
              } : null}
              onClose={handleCloseForm}
              preSelectedType={preSelectedType}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card borderless className="mb-6 bg-destructive/10 border-destructive/20">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Expenditures List */}
      <Card borderless>
        <CardHeader>
          <CardTitle>Recent Expenditures</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading...
            </div>
          ) : expenditures.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <p>No expenditures recorded yet.</p>
              <p className="text-sm mt-2">Click "Add Expenditure" to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenditures.map(expenditure => (
                <div key={expenditure.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-card-foreground">{expenditure.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {expenditure.category} • {format(parseISO(expenditure.date), 'MMM d, yyyy')}
                    </div>
                    {expenditure.notes && (
                      <div className="text-xs text-muted-foreground mt-1">{expenditure.notes}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-semibold text-destructive">KES {expenditure.amount.toLocaleString()}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(expenditure)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteExpenditure(expenditure.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 