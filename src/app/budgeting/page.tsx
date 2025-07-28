"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { createFirebaseService } from '@/lib/firebaseService';
import { Loader2, Trash2, Edit3, PlusCircle, Eye } from 'lucide-react';
import BudgetTemplateModal from '@/components/dashboard/BudgetTemplateModal';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface BudgetTemplate {
  id?: string;
  name: string;
  incomes: { source: string; amount: number }[];
  expenses: { category: string; amount: number }[];
  frequency: 'monthly' | 'weekly' | 'random';
  notes?: string;
  month?: string; // e.g. '2024-03' for March 2024
}

const defaultBudget: Omit<BudgetTemplate, 'id'> = {
  name: '',
  incomes: [{ source: '', amount: 0 }],
  expenses: [{ category: '', amount: 0 }],
  frequency: 'monthly',
  notes: '',
  month: '',
};

export default function BudgetingPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<BudgetTemplate, 'id'>>(defaultBudget);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, budget: null as BudgetTemplate | null });

  // Fetch budgets from Firestore
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    const fetchBudgets = async () => {
      try {
        const firebaseService = createFirebaseService(user.id);
        const userProfile = await firebaseService.getUserProfile();
        setBudgets(userProfile?.budgetTemplates || []);
      } catch (err) {
        setError('Failed to load budget templates.');
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, [user?.id]);

  // Save budgets to Firestore
  const saveBudgets = async (newBudgets: BudgetTemplate[]) => {
    if (!user?.id) return;
    setSaving(true);
    setError('');
    try {
      const firebaseService = createFirebaseService(user.id);
      await firebaseService.updateUserProfile({ budgetTemplates: newBudgets });
      setBudgets(newBudgets);
    } catch (err) {
      setError('Failed to save budget templates.');
    } finally {
      setSaving(false);
    }
  };

  // Generate a unique name if not provided
  const generateUniqueName = () => {
    const base = 'budget';
    let name = base;
    let i = 0;
    const names = budgets.map(b => b.name.toLowerCase());
    while (names.includes(name.toLowerCase())) {
      i += 1;
      name = base + i;
    }
    return name;
  };

  // Handle form changes
  const handleFormChange = (field: keyof BudgetTemplate, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle income/expense changes
  const handleIncomeChange = (idx: number, field: 'source' | 'amount', value: string | number) => {
    setForm(prev => ({
      ...prev,
      incomes: prev.incomes.map((inc, i) => i === idx ? { ...inc, [field]: field === 'amount' ? Number(value) : value } : inc),
    }));
  };
  const handleExpenseChange = (idx: number, field: 'category' | 'amount', value: string | number) => {
    setForm(prev => ({
      ...prev,
      expenses: prev.expenses.map((exp, i) => i === idx ? { ...exp, [field]: field === 'amount' ? Number(value) : value } : exp),
    }));
  };

  // Add/remove income/expense rows
  const addIncomeRow = () => setForm(prev => ({ ...prev, incomes: [...prev.incomes, { source: '', amount: 0 }] }));
  const removeIncomeRow = (idx: number) => setForm(prev => ({ ...prev, incomes: prev.incomes.filter((_, i) => i !== idx) }));
  const addExpenseRow = () => setForm(prev => ({ ...prev, expenses: [...prev.expenses, { category: '', amount: 0 }] }));
  const removeExpenseRow = (idx: number) => setForm(prev => ({ ...prev, expenses: prev.expenses.filter((_, i) => i !== idx) }));

  // Save or update a budget
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let name = form.name.trim();
    if (!name) name = generateUniqueName();
    if (budgets.some(b => b.name.toLowerCase() === name.toLowerCase() && b.id !== editingId)) {
      setError('Budget name must be unique.');
      return;
    }
    const newBudget: BudgetTemplate = {
      ...form,
      name,
      id: editingId || Date.now().toString(),
    };
    let newBudgets;
    if (editingId) {
      newBudgets = budgets.map(b => b.id === editingId ? newBudget : b);
    } else {
      newBudgets = [...budgets, newBudget];
    }
    await saveBudgets(newBudgets);
    setForm(defaultBudget);
    setEditingId(null);
  };

  // Edit a budget
  const handleEdit = (budget: BudgetTemplate) => {
    setForm({ ...budget });
    setEditingId(budget.id!);
  };

  // Delete a budget
  const handleDelete = async (id: string) => {
    const newBudgets = budgets.filter(b => b.id !== id);
    await saveBudgets(newBudgets);
    if (editingId === id) {
      setForm(defaultBudget);
      setEditingId(null);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setForm(defaultBudget);
    setEditingId(null);
    setError('');
  };

  // Open modal for viewing budget details
  const handleViewBudget = (budget: BudgetTemplate) => {
    setModalState({ isOpen: true, budget });
  };

  // Close modal
  const handleCloseModal = () => {
    setModalState({ isOpen: false, budget: null });
  };

  // Handle edit from modal
  const handleEditFromModal = (budget: BudgetTemplate) => {
    setForm({ ...budget });
    setEditingId(budget.id!);
    setModalState({ isOpen: false, budget: null });
  };

  // Playground calculations
  const totalIncome = form.incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  const totalExpenses = form.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const overBudget = totalIncome > 0 && totalExpenses > totalIncome;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Budget Templates</h1>
      <p className="mb-6 text-muted-foreground text-sm sm:text-base">Create, edit, and save different budget templates. You can play around with the numbers to see how your finances would look.</p>
      <Card borderless className="mb-8">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Budget Template' : 'Create a New Budget Template'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Budget Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Budget Name</label>
              <Input
                value={form.name}
                onChange={e => handleFormChange('name', e.target.value)}
                placeholder="e.g. My Monthly Budget"
                maxLength={32}
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">Give your budget a name(e.g. March Budget)</p>
            </div>
            {/* Month Dropdown */}
            <div>
              <label className="block text-sm font-medium mb-1">Budget Month</label>
              <Select value={form.month || ''} onValueChange={val => handleFormChange('month', val)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const now = new Date();
                    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
                    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const label = date.toLocaleString('default', { month: 'long' });
                    return (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Choose the month this budget applies to.</p>
            </div>
            {/* Incomes */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="block text-sm font-medium">Income Sources</span>
                <span className="text-xs text-muted-foreground">(Click the + button to add more income sources)</span>
              </div>
              {form.incomes.map((inc, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-3">
                  <Input
                    value={inc.source}
                    onChange={e => handleIncomeChange(idx, 'source', e.target.value)}
                    placeholder="Source (e.g. Salary, Freelance)"
                    className="flex-1 min-w-0"
                  />
                  <Input
                    type="number"
                    value={inc.amount}
                    onChange={e => handleIncomeChange(idx, 'amount', e.target.value)}
                    placeholder="Amount"
                    min={0}
                    className="w-full sm:w-32"
                  />
                  <div className="flex gap-1 self-end sm:self-center">
                    {form.incomes.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeIncomeRow(idx)} title="Remove income" className="h-10 w-10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {idx === form.incomes.length - 1 && (
                      <Button 
                        type="button" 
                        variant="default" 
                        size="icon" 
                        onClick={addIncomeRow} 
                        title="Add income source" 
                        className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Frequency */}
            {/* <div>
            {/* Expenses */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="block text-sm font-medium">Expenses</span>
                <span className="text-xs text-muted-foreground">(Click the + button to add more expense categories)</span>
              </div>
              {form.expenses.map((exp, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-3">
                  <Input
                    value={exp.category}
                    onChange={e => handleExpenseChange(idx, 'category', e.target.value)}
                    placeholder="Category (e.g. Rent, Food)"
                    className="flex-1 min-w-0"
                  />
                  <Input
                    type="number"
                    value={exp.amount}
                    onChange={e => handleExpenseChange(idx, 'amount', e.target.value)}
                    placeholder="Amount"
                    min={0}
                    className="w-full sm:w-32"
                  />
                  <div className="flex gap-1 self-end sm:self-center">
                    {form.expenses.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeExpenseRow(idx)} title="Remove expense" className="h-10 w-10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {idx === form.expenses.length - 1 && (
                      <Button 
                        type="button" 
                        variant="default" 
                        size="icon" 
                        onClick={addExpenseRow} 
                        title="Add expense category" 
                        className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="input input-bordered w-full bg-card text-foreground border rounded px-3 py-2 min-h-[60px]"
                value={form.notes}
                onChange={e => handleFormChange('notes', e.target.value)}
                placeholder="Add any notes or explanations for this budget template."
              />
              <p className="text-xs text-muted-foreground mt-1">Use this section to explain your budget or add reminders.</p>
            </div>
            {/* Playground Totals */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center items-center mt-6">
              <div className="font-bold text-base sm:text-lg text-primary text-center">Total Income: KES {totalIncome.toLocaleString()}</div>
              <div className="font-bold text-base sm:text-lg text-destructive text-center">Total Expenses: KES {totalExpenses.toLocaleString()}</div>
            </div>
            {overBudget && (
              <div className="text-sm text-destructive font-semibold text-center">Warning: Your expenses exceed your income!</div>
            )}
            {/* Save/Cancel */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-4 w-full">
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel} disabled={saving} className="w-full sm:w-auto">Cancel</Button>
              )}
              <Button type="submit" className="w-full sm:w-auto" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update Budget' : 'Save Budget'}</Button>
            </div>
            {error && <div className="text-red-500 text-center mt-2">{error}</div>}
          </form>
        </CardContent>
      </Card>
      {/* List of Saved Budgets */}
      <Card borderless>
        <CardHeader>
          <CardTitle>Saved Budget Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin h-6 w-6 mr-2" /> Loading...</div>
          ) : budgets.length === 0 ? (
            <div className="text-muted-foreground py-4">No budget templates saved yet.</div>
          ) : (
            <div className="space-y-4">
              {budgets.map(budget => (
                <div key={budget.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div 
                    className="flex-1 cursor-pointer hover:bg-muted/50 p-3 rounded-lg transition-colors"
                    onClick={() => handleViewBudget(budget)}
                  >
                    <div className="font-semibold text-card-foreground">{budget.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {budget.frequency} | {budget.incomes.length} incomes, {budget.expenses.length} expenses
                      {budget.month && ` | ${new Date(budget.month + '-01').toLocaleString('default', { month: 'long' })}`}
                    </div>
                    {budget.notes && <div className="text-xs text-muted-foreground mt-1">{budget.notes}</div>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleViewBudget(budget)} className="flex-1 sm:flex-none">
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(budget)} className="flex-1 sm:flex-none">
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(budget.id!)} className="flex-1 sm:flex-none">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Template Modal */}
      <BudgetTemplateModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        budget={modalState.budget}
        onEdit={handleEditFromModal}
      />
    </div>
  );
} 