"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/goals/ThickProgressBar";
import { Calendar, PiggyBank, PlusCircle } from "lucide-react";
import AddToGoalModal from "@/components/goals/AddToGoalModal";
import { FirebaseSavingsGoal } from "@/lib/firebaseDataStructure";

interface SavingsGoalCardProps {
  goal: FirebaseSavingsGoal;
  onUpdate: (goal: FirebaseSavingsGoal) => void;
  totalIncome?: number;
  incomeFrequency?: string;
}

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({ goal, onUpdate, totalIncome, incomeFrequency }) => {
  const [addModalOpen, setAddModalOpen] = useState(false);

  const percent = Math.min(100, Math.round((goal.saved / goal.amount) * 100));

  // Classification logic
  const now = new Date();
  const target = new Date(goal.targetDate);
  const diffYears = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const classification = diffYears > 1 ? 'Long-term' : 'Short-term';

  // Savings calculation
  let periodLabel = '';
  let periods = 1;
  if (incomeFrequency === 'monthly') {
    periodLabel = 'month';
    const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    periods = Math.max(1, diffMonths);
  } else if (incomeFrequency === 'weekly') {
    periodLabel = 'week';
    const diffWeeks = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
    periods = Math.max(1, diffWeeks);
  } else {
    periodLabel = 'period';
    periods = 1;
  }
  const remaining = Math.max(0, goal.amount - goal.saved);
  const perPeriod = periods > 0 ? (remaining / periods) : remaining;

  return (
    <Card className="shadow-lg rounded-lg p-6 border-2 border-border bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2 text-card-foreground">
            <PiggyBank className="h-5 w-5 text-primary" />
            {goal.item}
          </CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            Target: {new Date(goal.targetDate).toLocaleDateString()}
          </div>
        </div>
        <Button size="icon" variant="default" onClick={() => setAddModalOpen(true)} title="Add to goals" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <PlusCircle className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-2xl font-bold text-card-foreground">${goal.saved.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">/ ${goal.amount.toLocaleString()}</span>
        </div>
        <div className="mb-2 cursor-pointer" onClick={() => setAddModalOpen(true)} title="Add to goals">
          <Progress value={percent} />
        </div>
        <div className="text-xs text-muted-foreground">{percent}% saved</div>
        <div className="mt-2 text-xs">
          <span className="font-semibold">{classification} goal</span>
          {incomeFrequency && (
            <>
              <span className="ml-2">Save <span className="font-semibold">KES {perPeriod.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span> per {periodLabel} to reach your goal.</span>
            </>
          )}
        </div>
      </CardContent>
      <AddToGoalModal open={addModalOpen} onOpenChange={setAddModalOpen} goal={goal} onUpdate={onUpdate} />
    </Card>
  );
};

export default SavingsGoalCard; 