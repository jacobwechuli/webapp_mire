"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import SavingsGoalCard from "@/components/goals/SavingsGoalCard";
import AddGoalModal from "@/components/goals/AddGoalModal";
import { useRouter } from 'next/navigation';
import { useFirebaseData } from '@/hooks/useFirebaseData';
import { FirebaseSavingsGoal } from '@/lib/firebaseDataStructure';
import { useProfile } from '@/hooks/useProfile';
import type { Metadata } from 'next';
import Script from 'next/script';
// import { MigrationBanner } from '@/components/ui/MigrationBanner';

export default function GoalsPage() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const router = useRouter();

  // Firebase data hook
  const {
    goals,
    loading,
    addGoal,
    updateGoal,
  } = useFirebaseData();

  const { profile } = useProfile();
  const totalIncome = profile?.budget?.incomes?.reduce((sum, inc) => sum + inc.amount, 0) || 0;
  const incomeFrequency = profile?.budget?.incomeFrequency;

  const tips = [
    "Long-term goals are those that are longer than one year.",
    "Short-term goals help you build momentum and confidence.",
    "Break big goals into smaller milestones for easier progress.",
    "Review your goals regularly and adjust as needed.",
    "Automate your savings to stay on track.",
    "Visualize your goals to stay motivated!",
    "Celebrate small wins along the way!"
  ];
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  const handleAddGoal = async (goal: Omit<FirebaseSavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addGoal(goal);
      setAddModalOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleUpdateGoal = async (updatedGoal: FirebaseSavingsGoal) => {
    try {
      await updateGoal(updatedGoal.id, {
        ...updatedGoal,
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your goals...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script id="goals-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Goals | GoldPlus",
          "url": "http://goldplus-advisory.com/goals",
          "description": "Set, track, and achieve your savings goals with GoldPlus.",
        })}
      </Script>
      <div className="w-full max-w-6xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.push('/overview')}
            >
              ← Back to Overview
            </Button>
          </div>

          {/* Tip Box */}
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 shadow-sm">
            <span className="font-semibold">Goal Tip:</span> {randomTip}
          </div>

          {/* Migration Banner */}
          {/* <MigrationBanner /> */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold font-headline text-card-foreground">Goals</h1>
            <Button onClick={() => setAddModalOpen(true)} variant="default" className="flex items-center gap-2 w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              <PlusCircle className="h-5 w-5" /> Add Goal
            </Button>
          </div>

          {/* Savings Goals Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {goals.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-12">
                No goals yet. Click "+ Add Goal" to get started!
              </div>
            ) : (
              goals.map((goal: FirebaseSavingsGoal) => (
                <SavingsGoalCard key={goal.id} goal={goal} onUpdate={handleUpdateGoal} totalIncome={totalIncome} incomeFrequency={incomeFrequency} />
              ))
            )}
          </div>

          <AddGoalModal open={addModalOpen} onOpenChange={setAddModalOpen} onAddGoal={handleAddGoal} />
      </div>
    </>
  );
} 