import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, PlusCircle, Trash2, DollarSign } from 'lucide-react';
import { FirebaseBill } from '@/lib/firebaseDataStructure';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFirebaseData } from '@/hooks/useFirebaseData';

interface UpcomingBillsCardProps {
  bills: FirebaseBill[];
  onUpdateBills: (bills: FirebaseBill[]) => void;
}

const billFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
  description: z.string().optional(),
  frequency: z.string().optional(),
});

type BillFormValues = z.infer<typeof billFormSchema>;

const UpcomingBillsCard: React.FC<UpcomingBillsCardProps> = ({ bills, onUpdateBills }) => {
  const [showAdd, setShowAdd] = useState(false);
  const { addBill } = useFirebaseData();
  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
      dueDate: '',
      description: '',
      frequency: '',
    },
  });
  const [loading, setLoading] = useState(false);

  const sortedBills = [...bills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const now = new Date();

  const handleAdd = async (data: BillFormValues) => {
    setLoading(true);
    try {
      await addBill({
        name: data.name,
        amount: data.amount,
        dueDate: data.dueDate,
        description: data.description || '',
        frequency: data.frequency || '',
        isPaid: false,
      });
      setShowAdd(false);
      form.reset();
    } catch (e) {
      // error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    onUpdateBills(bills.filter(b => b.id !== id));
  };

  return (
    <Card className="bg-background text-foreground border border-border shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Bills & Subscriptions
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Track your upcoming payments and due dates
          </CardDescription>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button variant="default" title="Add Subscription">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bill</DialogTitle>
              <DialogDescription>Fill in the details to add a new bill or subscription.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
              <div>
                <Input placeholder="Name (e.g., Netflix)" {...form.register('name')} className="bg-background text-foreground border-border" />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Input placeholder="Amount" type="number" step="0.01" {...form.register('amount')} className="bg-background text-foreground border-border" />
                {form.formState.errors.amount && <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>}
              </div>
              <div>
                <Input placeholder="Due Date" type="date" {...form.register('dueDate')} className="bg-background text-foreground border-border" />
                {form.formState.errors.dueDate && <p className="text-sm text-destructive mt-1">{form.formState.errors.dueDate.message}</p>}
              </div>
              <div>
                <Input placeholder="Description (optional)" {...form.register('description')} className="bg-background text-foreground border-border" />
              </div>
              <div>
                <Input placeholder="Frequency (e.g., Monthly)" {...form.register('frequency')} className="bg-background text-foreground border-border" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="border-border text-foreground hover:bg-accent">Cancel</Button>
                <Button type="submit" variant="gold" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Bill'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {sortedBills.length === 0 && !showAdd && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No upcoming bills</p>
            <p className="text-sm">Add your recurring bills to track them here</p>
          </div>
        )}
        
        <div className="space-y-2">
          {sortedBills.map((bill) => {
            const due = new Date(bill.dueDate);
            const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const dueSoon = days <= 5;
            return (
              <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-accent border border-border">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{bill.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Due: {due.toLocaleDateString()}
                      {bill.frequency && ` • ${bill.frequency}`}
                      {bill.description && ` • ${bill.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="font-bold text-card-foreground">KES {bill.amount.toFixed(2)}</p>
                    <p className={`text-xs ${dueSoon ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {days === 0 ? 'Due today' : 
                       days === 1 ? 'Due tomorrow' : 
                       `${days} days left`}
                    </p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => handleRemove(bill.id)} title="Remove">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingBillsCard; 