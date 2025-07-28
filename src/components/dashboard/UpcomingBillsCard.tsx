import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { FirebaseBill } from '@/lib/firebaseDataStructure';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UpcomingBillsCardProps {
  bills: FirebaseBill[];
}

const UpcomingBillsCard: React.FC<UpcomingBillsCardProps> = ({ bills }) => {
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

  // Show only the next 3 upcoming bills
  const upcomingBills = sortedBills.slice(0, 3);

  return (
    <Card className="bg-background text-foreground shadow-lg" borderless>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold text-card-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Bills
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Your next few upcoming payments
          </CardDescription>
        </div>
        <Link href="/bills">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {upcomingBills.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming bills</p>
            <Link href="/bills">
              <Button variant="link" size="sm" className="text-primary p-0 h-auto">
                Add your first bill
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingBills.map((bill) => {
              const nextDue = getNextDueDate(bill);
              const days = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const dueSoon = days <= 5;
              return (
                <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg bg-accent">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-card-foreground text-sm truncate">{bill.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatDueDate(bill)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-card-foreground text-sm">KES {bill.amount.toFixed(2)}</p>
                    <p className={`text-xs ${dueSoon ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {days === 0 ? 'Due today' : 
                       days === 1 ? 'Due tomorrow' : 
                       `${days} days left`}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {sortedBills.length > 3 && (
              <div className="text-center pt-2">
                <Link href="/bills">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    View {sortedBills.length - 3} more bills
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBillsCard; 