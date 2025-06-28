"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGoal: (goal: any) => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ open, onOpenChange, onAddGoal }) => {
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onAddGoal({
      id: Date.now().toString(),
      item,
      amount: Number(amount),
      targetDate,
      saved: 0,
      history: [],
    });
    setLoading(false);
    setItem("");
    setAmount("");
    setTargetDate("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-card-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Add Savings Goal</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new savings goal to track your progress
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item" className="text-card-foreground">Goal Item</Label>
            <Input 
              id="item"
              value={item} 
              onChange={e => setItem(e.target.value)} 
              required 
              placeholder="e.g. New Laptop" 
              className="bg-background text-foreground border-border" 
            />
          </div>
          <div>
            <Label htmlFor="amount" className="text-card-foreground">Target Amount</Label>
            <Input 
              id="amount"
              type="number" 
              min={1} 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              required 
              placeholder="KES" 
              className="bg-background text-foreground border-border" 
            />
          </div>
          <div>
            <Label htmlFor="targetDate" className="text-card-foreground">Target Date</Label>
            <Input 
              id="targetDate"
              type="date" 
              value={targetDate} 
              onChange={e => setTargetDate(e.target.value)} 
              required 
              className="bg-background text-foreground border-border" 
            />
          </div>
          <Button type="submit" variant="default" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {loading ? "Adding..." : "Add Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalModal; 