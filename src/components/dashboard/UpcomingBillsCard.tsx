import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, PlusCircle, Trash2, DollarSign } from 'lucide-react';
import { FirebaseBill } from '@/lib/firebaseDataStructure';

interface UpcomingBillsCardProps {
  bills: FirebaseBill[];
  onUpdateBills: (bills: FirebaseBill[]) => void;
}

const UpcomingBillsCard: React.FC<UpcomingBillsCardProps> = ({ bills, onUpdateBills }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    dueDate: '',
    description: '',
    frequency: '',
  });

  const sortedBills = [...bills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const now = new Date();

  const handleAdd = () => {
    if (!form.name || !form.amount || !form.dueDate) return;
    const newBill: Omit<FirebaseBill, 'id' | 'createdAt' | 'updatedAt'> = {
      name: form.name,
      amount: parseFloat(form.amount),
      dueDate: form.dueDate,
      description: form.description || '',
      frequency: form.frequency || '',
      isPaid: false,
    };
    // Note: The actual bill creation will be handled by the parent component
    // This is just for UI state management
    setForm({ name: '', amount: '', dueDate: '', description: '', frequency: '' });
    setShowAdd(false);
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
        <Button variant="default" onClick={() => setShowAdd(v => !v)} title="Add Subscription">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Bill
        </Button>
      </CardHeader>
      <CardContent>
        {showAdd && (
          <div className="mb-4 flex flex-col gap-2 bg-accent p-4 rounded-lg border border-border">
            <Input
              placeholder="Name (e.g., Netflix)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="bg-background text-foreground border-border"
            />
            <Input
              placeholder="Amount"
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="bg-background text-foreground border-border"
            />
            <Input
              placeholder="Due Date"
              type="date"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="bg-background text-foreground border-border"
            />
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="bg-background text-foreground border-border"
            />
            <Input
              placeholder="Frequency (e.g., Monthly)"
              value={form.frequency}
              onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
              className="bg-background text-foreground border-border"
            />
            <div className="flex gap-2 mt-2">
              <Button variant="default" onClick={handleAdd}>Add</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)} className="border-border text-foreground hover:bg-accent">Cancel</Button>
            </div>
          </div>
        )}
        
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
                    <p className="font-bold text-card-foreground">${bill.amount.toFixed(2)}</p>
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