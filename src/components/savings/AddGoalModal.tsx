"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Savings Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Goal Item</label>
            <Input value={item} onChange={e => setItem(e.target.value)} required placeholder="e.g. New Laptop" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Amount</label>
            <Input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)} required placeholder="$" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Date</label>
            <Input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddGoalModal; 