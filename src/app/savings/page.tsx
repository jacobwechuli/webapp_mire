"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import SavingsGoalCard from "@/components/savings/SavingsGoalCard";
import AddGoalModal from "@/components/savings/AddGoalModal";
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useRouter } from 'next/navigation';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { FirebaseSavingsGoal } from '@/lib/firebaseDataStructure';
// import { MigrationBanner } from '@/components/ui/MigrationBanner';

export default function SavingsPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const router = useRouter();

  // Firebase data hook
  const {
    savingsGoals,
    loading,
    addSavingsGoal,
    updateSavingsGoal,
  } = useFirebaseData();

  const handleAddGoal = async (goal: Omit<FirebaseSavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addSavingsGoal(goal);
      setAddModalOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUpdateGoal = async (updatedGoal: FirebaseSavingsGoal) => {
    try {
      await updateSavingsGoal(updatedGoal.id, {
        item: updatedGoal.item,
        amount: updatedGoal.amount,
        targetDate: updatedGoal.targetDate,
        saved: updatedGoal.saved,
        history: updatedGoal.history,
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-card-foreground">
        <DashboardHeader />
        <main className="container py-8 flex-1">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your savings goals...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

        {/* Migration Banner */}
        {/* <MigrationBanner /> */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold font-headline text-card-foreground">Savings Goals</h1>
          <Button onClick={() => setAddModalOpen(true)} variant="default" className="flex items-center gap-2 w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="h-5 w-5" /> Add Goal
          </Button>
        </div>

        {/* Savings Goals Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {savingsGoals.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No savings goals yet. Click "+ Add Goal" to get started!
            </div>
          ) : (
            savingsGoals.map((goal: FirebaseSavingsGoal) => (
              <SavingsGoalCard key={goal.id} goal={goal} onUpdate={handleUpdateGoal} />
            ))
          )}
        </div>

        <AddGoalModal open={addModalOpen} onOpenChange={setAddModalOpen} onAddGoal={handleAddGoal} />
      </main>
    </div>
  );
} 