"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, PlusCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { Transaction, TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types';
import { FirebaseTransaction } from '@/lib/firebaseDataStructure';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  category: z.string().min(1, 'Category is required'),
  date: z.date({ required_error: 'Date is required' }),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  existingTransaction?: FirebaseTransaction | null; // For editing, optional
  onClose: () => void;
  preSelectedType?: 'income' | 'expense'; // For pre-selecting transaction type
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, existingTransaction, onClose, preSelectedType }) => {
  const [selectedType, setSelectedType] = useState<TransactionType>(existingTransaction?.type || preSelectedType || 'expense');

  const defaultValues = existingTransaction
    ? {
        description: existingTransaction.description,
        amount: Number(existingTransaction.amount),
        type: existingTransaction.type,
        category: existingTransaction.category,
        date: parseISO(existingTransaction.date),
      }
    : {
        description: '',
        amount: 0,
        type: (preSelectedType || 'expense') as TransactionType,
        category: '',
        date: new Date(),
      };
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const categories = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  React.useEffect(() => {
    if (existingTransaction) {
      setSelectedType(existingTransaction.type);
      form.reset({
        description: existingTransaction.description,
        amount: Number(existingTransaction.amount),
        type: existingTransaction.type,
        category: existingTransaction.category,
        date: parseISO(existingTransaction.date),
      });
    } else if (preSelectedType) {
      setSelectedType(preSelectedType);
      form.reset({
        description: '',
        amount: 0,
        type: preSelectedType,
        category: '',
        date: new Date(),
      });
    }
  }, [existingTransaction, preSelectedType, form]);


  const onSubmit = (data: TransactionFormValues) => {
    const newTransaction: Omit<Transaction, 'id'> = {
      description: data.description,
      amount: Number(data.amount),
      type: data.type,
      category: data.category,
      date: format(data.date, 'yyyy-MM-dd'), // Store date as ISO string
    };
    onAddTransaction(newTransaction);
    form.reset({ description: '', amount: 0, type: 'expense', category: '', date: new Date() });
    onClose();
  };

  return (
    <Card className="bg-background text-foreground shadow-lg border border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
          {existingTransaction ? 'Edit Transaction' : 'Add Revenue/Expenditure'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {existingTransaction ? 'Update your transaction details.' : 'Fill in the details to add a new revenue/expenditure.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
          <div>
            <Label htmlFor="description" className="text-card-foreground">Description</Label>
            <Input id="description" {...form.register('description')} placeholder="e.g., Groceries, Salary" className="bg-background text-foreground border-border" />
            {form.formState.errors.description && <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount" className="text-card-foreground">Amount</Label>
            <Input id="amount" type="number" step="0.01" {...form.register('amount')} placeholder="0.00" className="bg-background text-foreground border-border" />
            {form.formState.errors.amount && <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>}
          </div>

          <div>
            <Label htmlFor="type" className="text-card-foreground">Type</Label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value as TransactionType);
                    setSelectedType(value as TransactionType);
                    form.setValue('category', ''); // Reset category when type changes
                  }}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="type" className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground border-border">
                    <SelectItem value="income"><TrendingUp className="mr-2 h-4 w-4 inline-block" />Revenue</SelectItem>
                    <SelectItem value="expense"><TrendingDown className="mr-2 h-4 w-4 inline-block" />Expenditure</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.type && <p className="text-sm text-destructive mt-1">{form.formState.errors.type.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="category" className="text-card-foreground">Category</Label>
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <SelectTrigger id="category" className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background text-foreground border-border">
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.category && <p className="text-sm text-destructive mt-1">{form.formState.errors.category.message}</p>}
          </div>

          <div>
            <Label htmlFor="date" className="text-card-foreground">Date</Label>
            <Controller
              name="date"
              control={form.control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background text-foreground border-border",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background text-foreground border-border">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {form.formState.errors.date && <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground hover:bg-accent">Cancel</Button>
            <Button type="submit" variant="gold" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> {existingTransaction ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
