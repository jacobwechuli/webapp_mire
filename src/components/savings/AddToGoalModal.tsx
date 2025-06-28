"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SavingsGoal {
  id: string;
  item: string;
  amount: number;
  targetDate: string;
  saved: number;
  history: { date: string; amount: number }[];
}

interface AddToGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal;
  onUpdate: (goal: SavingsGoal) => void;
}

const AddToGoalModal: React.FC<AddToGoalModalProps> = ({ open, onOpenChange, goal, onUpdate }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const newAmount = Number(amount);
    const updatedGoal = {
      ...goal,
      saved: goal.saved + newAmount,
      history: [
        ...goal.history,
        {
          date: new Date().toISOString(),
          amount: newAmount,
        },
      ],
    };
    
    onUpdate(updatedGoal);
    setLoading(false);
    setAmount("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Add to {goal.item}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add money to your savings goal
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="text-card-foreground">Amount to Add</Label>
            <Input 
              id="amount"
              type="number" 
              min={0.01} 
              step={0.01}
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required 
              placeholder="0.00" 
              className="bg-background text-foreground border-border" 
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Current progress: ${goal.saved.toLocaleString()} / ${goal.amount.toLocaleString()}
          </div>
          <Button type="submit" variant="default" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {loading ? "Adding..." : "Add to Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToGoalModal; 