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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface UpcomingBillsCardProps {
  bills: FirebaseBill[];
  onUpdateBills: (bills: FirebaseBill[]) => void;
}

const billFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  frequency: z.enum(['one-time', 'monthly', 'weekly']),
  dueDate: z.string().optional(),
  monthlyDay: z.coerce.number().min(1).max(31).optional(),
  weeklyDay: z.coerce.number().min(0).max(6).optional(),
  weeklyTime: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => {
  if (data.frequency === 'one-time') {
    return data.dueDate && data.dueDate.length > 0;
  }
  if (data.frequency === 'monthly') {
    return data.monthlyDay && data.monthlyDay >= 1 && data.monthlyDay <= 31;
  }
  if (data.frequency === 'weekly') {
    return data.weeklyDay !== undefined && data.weeklyDay >= 0 && data.weeklyDay <= 6;
  }
  return true;
}, {
  message: "Please fill in the required date information for the selected frequency"
});

type BillFormValues = z.infer<typeof billFormSchema>;

const UpcomingBillsCard: React.FC<UpcomingBillsCardProps> = ({ bills, onUpdateBills }) => {
  const [showAdd, setShowAdd] = useState(false);
  const { addBill, deleteBill } = useFirebaseData();
  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: '',
      amount: 0,
      frequency: 'one-time',
      dueDate: '',
      monthlyDay: undefined,
      weeklyDay: undefined,
      weeklyTime: '',
      description: '',
    },
  });
  const [loading, setLoading] = useState(false);

  const watchFrequency = form.watch('frequency');

  const sortedBills = [...bills].sort((a, b) => {
    const getNextDueDate = (bill: FirebaseBill) => {
      const now = new Date();
      if (bill.frequency === 'one-time' && bill.dueDate) {
        return new Date(bill.dueDate);
      }
      if (bill.frequency === 'monthly' && bill.monthlyDay) {
        const nextDate = new Date(now.getFullYear(), now.getMonth(), bill.monthlyDay);
        if (nextDate < now) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        return nextDate;
      }
      if (bill.frequency === 'weekly' && bill.weeklyDay !== undefined) {
        const daysUntilNext = (bill.weeklyDay - now.getDay() + 7) % 7;
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + daysUntilNext);
        return nextDate;
      }
      return new Date();
    };
    
    return getNextDueDate(a).getTime() - getNextDueDate(b).getTime();
  });

  const now = new Date();

  const handleAdd = async (data: BillFormValues) => {
    setLoading(true);
    try {
      console.log('Adding bill with data:', data);
      
      const billData: Partial<FirebaseBill> = {
        name: data.name,
        amount: data.amount,
        frequency: data.frequency,
        description: data.description || '',
        isPaid: false,
      };

      if (data.frequency === 'one-time' && data.dueDate) {
        billData.dueDate = data.dueDate;
      } else if (data.frequency === 'monthly' && data.monthlyDay) {
        billData.monthlyDay = data.monthlyDay;
      } else if (data.frequency === 'weekly' && data.weeklyDay !== undefined) {
        billData.weeklyDay = data.weeklyDay;
        if (data.weeklyTime) {
          billData.weeklyTime = data.weeklyTime;
        }
      }

      console.log('Processed bill data:', billData);
      await addBill(billData as FirebaseBill);
      console.log('Bill added successfully');
      setShowAdd(false);
      form.reset();
    } catch (e) {
      console.error('Error adding bill:', e);
      // error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await deleteBill(id);
      // The bills will be automatically updated through the real-time listener
    } catch (e) {
      // error handled in hook
    }
  };

  const getNextDueDate = (bill: FirebaseBill) => {
    if (bill.frequency === 'one-time' && bill.dueDate) {
      return new Date(bill.dueDate);
    }
    if (bill.frequency === 'monthly' && bill.monthlyDay) {
      const nextDate = new Date(now.getFullYear(), now.getMonth(), bill.monthlyDay);
      if (nextDate < now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      return nextDate;
    }
    if (bill.frequency === 'weekly' && bill.weeklyDay !== undefined) {
      const daysUntilNext = (bill.weeklyDay - now.getDay() + 7) % 7;
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + daysUntilNext);
      return nextDate;
    }
    return new Date();
  };

  const formatDueDate = (bill: FirebaseBill) => {
    if (bill.frequency === 'one-time' && bill.dueDate) {
      return new Date(bill.dueDate).toLocaleDateString();
    }
    if (bill.frequency === 'monthly' && bill.monthlyDay) {
      return `Every ${bill.monthlyDay}${getOrdinalSuffix(bill.monthlyDay)} of the month`;
    }
    if (bill.frequency === 'weekly' && bill.weeklyDay !== undefined) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const timeText = bill.weeklyTime ? ` at ${bill.weeklyTime}` : '';
      return `Every ${days[bill.weeklyDay]}${timeText}`;
    }
    return 'Unknown';
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <Card className="bg-background text-foreground shadow-lg" borderless>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Bill</DialogTitle>
              <DialogDescription>Fill in the details to add a new bill or subscription.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleAdd)} className="space-y-4">
              <div>
                <Label htmlFor="name">Bill Name</Label>
                <Input 
                  id="name"
                  placeholder="Name (e.g., Netflix)" 
                  {...form.register('name')} 
                  className="bg-background text-foreground border-border" 
                />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input 
                  id="amount"
                  placeholder="Amount" 
                  type="number" 
                  step="0.01" 
                  {...form.register('amount')} 
                  className="bg-background text-foreground border-border" 
                />
                {form.formState.errors.amount && <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>}
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={watchFrequency} onValueChange={(value) => form.setValue('frequency', value as 'one-time' | 'monthly' | 'weekly')}>
                  <SelectTrigger className="bg-background text-foreground border-border">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.frequency && <p className="text-sm text-destructive mt-1">{form.formState.errors.frequency.message}</p>}
              </div>

              {watchFrequency === 'one-time' && (
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input 
                    id="dueDate"
                    placeholder="Due Date" 
                    type="date" 
                    {...form.register('dueDate')} 
                    className="bg-background text-foreground border-border" 
                  />
                  {form.formState.errors.dueDate && <p className="text-sm text-destructive mt-1">{form.formState.errors.dueDate.message}</p>}
                </div>
              )}

              {watchFrequency === 'monthly' && (
                <div>
                  <Label htmlFor="monthlyDay">Day of Month</Label>
                  <Input 
                    id="monthlyDay"
                    placeholder="Day (1-31)" 
                    type="number" 
                    min="1" 
                    max="31" 
                    {...form.register('monthlyDay')} 
                    className="bg-background text-foreground border-border" 
                  />
                  {form.formState.errors.monthlyDay && <p className="text-sm text-destructive mt-1">{form.formState.errors.monthlyDay.message}</p>}
                </div>
              )}

              {watchFrequency === 'weekly' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="weeklyDay">Day of Week</Label>
                    <Select value={form.watch('weeklyDay')?.toString()} onValueChange={(value) => form.setValue('weeklyDay', parseInt(value))}>
                      <SelectTrigger className="bg-background text-foreground border-border">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.weeklyDay && <p className="text-sm text-destructive mt-1">{form.formState.errors.weeklyDay.message}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="weeklyTime">Time (Optional)</Label>
                    <Input 
                      id="weeklyTime"
                      placeholder="Time (HH:MM)" 
                      type="time" 
                      {...form.register('weeklyTime')} 
                      className="bg-background text-foreground border-border" 
                    />
                    {form.formState.errors.weeklyTime && <p className="text-sm text-destructive mt-1">{form.formState.errors.weeklyTime.message}</p>}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description"
                  placeholder="Description" 
                  {...form.register('description')} 
                  className="bg-background text-foreground border-border" 
                />
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
            const nextDue = getNextDueDate(bill);
            const days = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const dueSoon = days <= 5;
            return (
              <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-accent">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-card-foreground">{bill.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDueDate(bill)}
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