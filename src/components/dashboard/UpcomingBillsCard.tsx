import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, PlusCircle, Trash2 } from 'lucide-react';
import { Bill } from '@/lib/types';

interface UpcomingBillsCardProps {
  bills: Bill[];
  setBills: (bills: Bill[]) => void;
}

const UpcomingBillsCard: React.FC<UpcomingBillsCardProps> = ({ bills, setBills }) => {
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
    setBills([
      ...bills,
      {
        id: Date.now().toString(),
        name: form.name,
        amount: parseFloat(form.amount),
        dueDate: form.dueDate,
        description: form.description || '',
        frequency: form.frequency || '',
      },
    ]);
    setForm({ name: '', amount: '', dueDate: '', description: '', frequency: '' });
    setShowAdd(false);
  };

  const handleRemove = (id: string) => {
    setBills(bills.filter(b => b.id !== id));
  };

  return (
    <Card className="shadow-lg rounded-lg p-6 border-2 border-gold">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-gold">
          <Calendar className="h-5 w-5 text-gold" />
          Upcoming Bills & Subscriptions
        </CardTitle>
        <Button variant="gold" onClick={() => setShowAdd(v => !v)} title="Add Subscription">
          Add Subscription/Bill
        </Button>
      </CardHeader>
      <CardContent>
        {showAdd && (
          <div className="mb-4 flex flex-col gap-2 bg-muted/50 p-4 rounded-lg">
            <Input
              placeholder="Name (e.g., Netflix)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <Input
              placeholder="Amount"
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            />
            <Input
              placeholder="Due Date"
              type="date"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            />
            <Input
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <Input
              placeholder="Frequency (e.g., Monthly)"
              value={form.frequency}
              onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
            />
            <div className="flex gap-2 mt-2">
              <Button variant="gold" onClick={handleAdd}>Add</Button>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </div>
        )}
        {sortedBills.length === 0 && !showAdd && (
          <div className="text-muted-foreground text-sm">No upcoming bills. Add one to get started!</div>
        )}
        <ul className="divide-y divide-border">
          {sortedBills.map(bill => {
            const due = new Date(bill.dueDate);
            const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const dueSoon = days <= 5;
            return (
              <li key={bill.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${dueSoon ? 'text-gold' : 'text-foreground'}`}>{bill.name}</span>
                    <span className="text-xs text-muted-foreground">{bill.frequency}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Due: <span className={dueSoon ? 'text-gold font-semibold' : ''}>{due.toLocaleDateString()}</span>
                    {bill.description && <span> &mdash; {bill.description}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">${bill.amount.toFixed(2)}</span>
                  <Button size="icon" variant="ghost" onClick={() => handleRemove(bill.id)} title="Remove">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};

export default UpcomingBillsCard; 