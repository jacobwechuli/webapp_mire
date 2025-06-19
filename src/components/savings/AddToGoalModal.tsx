"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    const addAmount = Number(amount);
    if (!addAmount || addAmount <= 0) return;
    const updatedGoal = {
      ...goal,
      saved: goal.saved + addAmount,
      history: [
        ...goal.history,
        { date: new Date().toISOString(), amount: addAmount },
      ],
    };
    onUpdate(updatedGoal);
    setAmount("");
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Savings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount to Add</label>
            <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} required placeholder="$" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Savings"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddToGoalModal; 