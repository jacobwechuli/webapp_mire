"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, PlusCircle, TrendingDown, TrendingUp, Wallet, Building2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { Transaction, TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/types';
import { FirebaseTransaction } from '@/lib/firebaseDataStructure';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const KENYAN_BANKS = [
  'Equity Bank',
  'KCB Bank',
  'Cooperative Bank',
  'NCBA Bank',
  'Absa Bank',
  'Standard Chartered',
  'Barclays Bank',
  'Diamond Trust Bank',
  'I&M Bank',
  'Stanbic Bank',
  'Family Bank',
  'National Bank',
  'Bank of Africa',
  'Sidian Bank',
  'Prime Bank',
  'Other Bank'
];

const formSchema = z.object({
  senderRecipient: z.string().min(1, 'Sender/Recipient is required'),
  amount: z.string().min(1, 'Amount is required').refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Please enter a valid amount'),
  type: z.enum(['income', 'expense'], { required_error: 'Type is required' }),
  transactionSource: z.enum(['cash', 'bank'], { required_error: 'Transaction source is required' }),
  selectedBank: z.string().optional(),
  date: z.date({ required_error: 'Date is required' }),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  existingTransaction?: FirebaseTransaction | null;
  onClose: () => void;
  preSelectedType?: 'income' | 'expense';
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, existingTransaction, onClose, preSelectedType }) => {
  const [selectedType, setSelectedType] = useState<TransactionType>(existingTransaction?.type || preSelectedType || 'expense');
  const [transactionSource, setTransactionSource] = useState<'cash' | 'bank'>(existingTransaction?.source || 'cash');
  const [selectedBank, setSelectedBank] = useState(existingTransaction?.recipient || '');

  const defaultValues = existingTransaction
    ? {
        senderRecipient: existingTransaction.description,
        amount: existingTransaction.amount.toString(),
        type: existingTransaction.type,
        transactionSource: existingTransaction.source || 'cash',
        selectedBank: existingTransaction.recipient || '',
        date: parseISO(existingTransaction.date),
      }
    : {
        senderRecipient: '',
        amount: '',
        type: (preSelectedType || 'expense') as TransactionType,
        transactionSource: 'cash',
        selectedBank: '',
        date: new Date(),
      };
  
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  React.useEffect(() => {
    if (existingTransaction) {
      setSelectedType(existingTransaction.type);
      setTransactionSource(existingTransaction.source || 'cash');
      setSelectedBank(existingTransaction.recipient || '');
      form.reset({
        senderRecipient: existingTransaction.description,
        amount: existingTransaction.amount.toString(),
        type: existingTransaction.type,
        transactionSource: existingTransaction.source || 'cash',
        selectedBank: existingTransaction.recipient || '',
        date: parseISO(existingTransaction.date),
      });
    } else if (preSelectedType) {
      setSelectedType(preSelectedType);
      form.reset({
        senderRecipient: '',
        amount: '',
        type: preSelectedType,
        transactionSource: 'cash',
        selectedBank: '',
        date: new Date(),
      });
    }
  }, [existingTransaction, preSelectedType, form]);

  const onSubmit = (data: TransactionFormValues) => {
    const newTransaction: Omit<Transaction, 'id'> = {
      description: data.senderRecipient,
      amount: parseFloat(data.amount),
      type: data.type,
      category: data.type === 'income' ? 'Other Income' : 'Other Expense',
      date: format(data.date, 'yyyy-MM-dd'),
      source: data.transactionSource,
      recipient: data.transactionSource === 'bank' ? data.selectedBank : undefined,
    };
    onAddTransaction(newTransaction);
    form.reset({ 
      senderRecipient: '', 
      amount: '', 
      type: 'expense', 
      transactionSource: 'cash',
      selectedBank: '',
      date: new Date() 
    });
    onClose();
  };

  return (
    <Card className="bg-background text-foreground shadow-lg border border-border">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
          {existingTransaction ? 'Edit Cash & Bank Transaction' : 'Add Cash & Bank Transaction'}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {existingTransaction ? 'Update your transaction details.' : 'Track your cash and bank transactions to get a complete picture of your finances.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
          {/* Transaction Type Selector */}
          <div>
            <Label className="text-card-foreground mb-3 block">Transaction Type</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={selectedType === 'expense' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType('expense');
                  form.setValue('type', 'expense');
                }}
                className="flex-1"
              >
                <TrendingDown className="mr-2 h-4 w-4" />
                Cash & Bank Expense
              </Button>
              <Button
                type="button"
                variant={selectedType === 'income' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType('income');
                  form.setValue('type', 'income');
                }}
                className="flex-1"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Cash & Bank Income
              </Button>
            </div>
          </div>

          {/* Transaction Source Selector */}
          <div>
            <Label className="text-card-foreground mb-3 block">Transaction Source</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={transactionSource === 'cash' ? 'secondary' : 'outline'}
                onClick={() => {
                  setTransactionSource('cash');
                  setSelectedBank('');
                  form.setValue('transactionSource', 'cash');
                  form.setValue('selectedBank', '');
                }}
                className="flex-1"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Cash
              </Button>
              <Button
                type="button"
                variant={transactionSource === 'bank' ? 'secondary' : 'outline'}
                onClick={() => {
                  setTransactionSource('bank');
                  form.setValue('transactionSource', 'bank');
                }}
                className="flex-1"
              >
                <Building2 className="mr-2 h-4 w-4" />
                Bank
              </Button>
            </div>
          </div>

          {/* Bank Selection */}
          {transactionSource === 'bank' && (
            <div>
              <Label className="text-card-foreground mb-3 block">Select Bank</Label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {KENYAN_BANKS.map((bank) => (
                  <Badge
                    key={bank}
                    variant={selectedBank === bank ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => {
                      setSelectedBank(bank);
                      form.setValue('selectedBank', bank);
                    }}
                  >
                    {bank}
                  </Badge>
                ))}
              </div>
              {form.formState.errors.selectedBank && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.selectedBank.message}</p>
              )}
            </div>
          )}

          {/* Sender/Recipient Field */}
          <div>
            <Label htmlFor="senderRecipient" className="text-card-foreground">
              {selectedType === 'income' ? 'Sender' : 'Recipient'}
            </Label>
            <Input 
              id="senderRecipient" 
              {...form.register('senderRecipient')} 
              placeholder={selectedType === 'income' ? 'e.g., John Doe, Company Name' : 'e.g., Shop Name, Person Name'} 
              className="bg-background text-foreground border-border" 
            />
            {form.formState.errors.senderRecipient && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.senderRecipient.message}</p>
            )}
          </div>

          {/* Amount Field - Fixed to not have default 0 */}
          <div>
            <Label htmlFor="amount" className="text-card-foreground">Amount (KES)</Label>
            <Input 
              id="amount" 
              type="text"
              {...form.register('amount')} 
              placeholder="0.00" 
              className="bg-background text-foreground border-border" 
            />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Date Field */}
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
            {form.formState.errors.date && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground hover:bg-accent">
              Cancel
            </Button>
            <Button type="submit" variant="gold" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> 
              {existingTransaction ? 'Save Changes' : `Add ${transactionSource === 'cash' ? 'Cash' : 'Bank'} Transaction`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
