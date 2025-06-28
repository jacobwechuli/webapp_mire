"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import SavingsGoalCard from "@/components/savings/SavingsGoalCard";
import AddGoalModal from "@/components/savings/AddGoalModal";
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const STORAGE_KEY = "goldplus-savings-goals";

export default function SavingsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setGoals(JSON.parse(stored));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = (goal: any) => {
    setGoals(prev => [...prev, goal]);
  };

  const handleUpdateGoal = (updatedGoal: any) => {
    setGoals(prev => prev.map((g: any) => g.id === updatedGoal.id ? updatedGoal : g));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-card-foreground">
      <DashboardHeader />
      <main className="container py-8 flex-1">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/overview')}
          >
            ← Back to Overview
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold font-headline text-card-foreground">Savings Goals</h1>
          <Button onClick={() => setAddModalOpen(true)} variant="default" className="flex items-center gap-2 w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="h-5 w-5" /> Add Goal
          </Button>
        </div>

        {/* Savings Goals Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {goals.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No savings goals yet. Click "+ Add Goal" to get started!
            </div>
          ) : (
            goals.map((goal: any) => (
              <SavingsGoalCard key={goal.id} goal={goal} onUpdate={handleUpdateGoal} />
            ))
          )}
        </div>

        <AddGoalModal open={addModalOpen} onOpenChange={setAddModalOpen} onAddGoal={handleAddGoal} />
      </main>
    </div>
  );
} 