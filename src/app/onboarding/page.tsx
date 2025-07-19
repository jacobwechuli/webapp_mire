'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createFirebaseService } from '@/lib/firebaseService';
import WelcomePopup from '@/components/onboarding/WelcomePopup';

const steps = [
  {
    label: 'What is your main reason for using this app?',
    key: 'mainReason',
    type: 'select',
    options: [
      'Budget better and plan my money',
      'Track where my money goes',
      'Get out of debt',
      'Save for something important',
      'Build wealth over time',
    ],
  },
  {
    label: 'What’s one short-term financial goal you want to achieve (1–3 months)?',
    key: 'shortTermGoal',
    type: 'selectOrText',
    options: [
      'Save for rent',
      'Pay off a loan',
      'Reduce daily spending',
      'Build emergency savings',
    ],
  },
  {
    label: 'What’s one long-term goal you’re working toward?',
    key: 'longTermGoal',
    type: 'selectOrText',
    options: [
      'Build a house',
      'Start a business',
      'Save for my kids',
      'Travel or buy something big',
      'Be financially stress-free',
    ],
  },
  {
    label: 'What usually challenges your budget the most?',
    key: 'budgetChallenge',
    type: 'select',
    options: [
      'Impulse buying',
      'Loans or debt',
      'Low or inconsistent income',
      'Supporting family and friends',
      'I don’t know where my money goes',
    ],
  },
  {
    label: 'How do you usually receive your income?',
    key: 'incomeSource',
    type: 'select',
    options: [
      'Bank',
      'M-Pesa',
      'Cash',
      'Mixed',
    ],
  },
  {
    label: 'How often do you receive income?',
    key: 'incomeFrequency',
    type: 'select',
    options: [
      'Monthly',
      'Weekly',
      'Daily',
      'Irregularly',
    ],
  },
];

const initialAnswers = {
  mainReason: '',
  shortTermGoal: '',
  shortTermGoalOther: '',
  longTermGoal: '',
  longTermGoalOther: '',
  budgetChallenge: [] as string[],
  incomeSource: '',
  incomeFrequency: '',
};

export default function OnboardingPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<typeof initialAnswers>(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // Handle get started from welcome popup
  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  // Helper to get the answer value for the current step
  const getCurrentValue = () => {
    if (step === 1) {
      return answers.shortTermGoal === 'Other' ? answers.shortTermGoalOther : answers.shortTermGoal;
    }
    if (step === 2) {
      return answers.longTermGoal === 'Other' ? answers.longTermGoalOther : answers.longTermGoal;
    }
    if (step === 3) {
      return answers.budgetChallenge;
    }
    return answers[steps[step].key as keyof typeof answers];
  };

  // Save answer to Firebase after each step
  const saveAnswer = async (updatedAnswers: typeof answers) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const firebaseService = createFirebaseService(user.id);
      await firebaseService.updateUserProfile({
        mainReason: updatedAnswers.mainReason,
        shortTermGoal: updatedAnswers.shortTermGoal === 'Other' ? updatedAnswers.shortTermGoalOther : updatedAnswers.shortTermGoal,
        longTermGoal: updatedAnswers.longTermGoal === 'Other' ? updatedAnswers.longTermGoalOther : updatedAnswers.longTermGoal,
        budgetChallenge: updatedAnswers.budgetChallenge,
        incomeSource: updatedAnswers.incomeSource,
        incomeFrequency: updatedAnswers.incomeFrequency,
      });
    } catch (err: any) {
      setError('Failed to save your answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle next step
  const handleNext = async () => {
    const updatedAnswers = { ...answers };
    // Save after each step
    await saveAnswer(updatedAnswers);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  // Handle back
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // Handle skip
  const handleSkip = async () => {
    const updatedAnswers = { ...answers };
    // Save after each step (with blank answer)
    await saveAnswer(updatedAnswers);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  // Handle select
  const handleSelect = (value: string) => {
    if (step === 1) {
      setAnswers((a) => ({ ...a, shortTermGoal: value, shortTermGoalOther: '' }));
    } else if (step === 2) {
      setAnswers((a) => ({ ...a, longTermGoal: value, longTermGoalOther: '' }));
    } else if (step === 3) {
      setAnswers((a) => {
        const current = Array.isArray(a.budgetChallenge) ? a.budgetChallenge : [];
        if (current.includes(value)) {
          return { ...a, budgetChallenge: current.filter((v) => v !== value) };
        } else {
          return { ...a, budgetChallenge: [...current, value] };
        }
      });
    } else {
      setAnswers((a) => ({ ...a, [steps[step].key]: value }));
    }
  };

  // Handle text input for 'Other'
  const handleOtherInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (step === 1) {
      setAnswers((a) => ({ ...a, shortTermGoal: 'Other', shortTermGoalOther: e.target.value }));
    } else if (step === 2) {
      setAnswers((a) => ({ ...a, longTermGoal: 'Other', longTermGoalOther: e.target.value }));
    }
  };

  // Get user's first name for completion message
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  // Progress bar percent
  const progress = Math.round(((step + (completed ? 1 : 0)) / (steps.length + 1)) * 100);

  // Show welcome popup first
  if (showWelcome) {
    return <WelcomePopup isOpen={showWelcome} onGetStarted={handleGetStarted} />;
  }

  if (completed) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="mb-6 text-3xl font-bold">You’re all set, {firstName}! 🎉</div>
        <div className="mb-4 text-lg">We’ve personalized your dashboard based on your goals and income habits.<br />You can complete your profile later to unlock deeper money insights.</div>
        <button
          className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold mt-6"
          onClick={() => router.push('/overview')}
        >
          Continue to Dashboard
        </button>
        {/* Optional: Start My Budget CTA can go here */}
        <div className="mt-8 text-sm text-gray-500">We use your answers to help you plan better. Your data is secure and never shared.</div>
      </div>
    );
  }

  const currentStep = steps[step];
  const currentValue = getCurrentValue();

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-yellow-700">Step {step + 1} of {steps.length}</span>
          <span className="text-xs text-gray-500">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-yellow-400 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      {/* Question */}
      <div className="mb-6 text-xl font-semibold text-gray-800">{currentStep.label}</div>
      {/* Options */}
      {currentStep.type === 'select' && step !== 3 && (
        <div className="flex flex-col gap-3 mb-6">
          {currentStep.options.map((option) => (
            <button
              key={option}
              className={`w-full px-6 py-4 rounded-lg border text-left ${currentValue === option ? 'bg-yellow-100 border-yellow-500' : 'bg-white border-gray-300'}`}
              onClick={() => handleSelect(option)}
              disabled={loading}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {/* Multi-select for Step 4 */}
      {step === 3 && (
        <div className="flex flex-col gap-3 mb-6">
          {currentStep.options.map((option) => (
            <button
              key={option}
              className={`w-full px-6 py-4 rounded-lg border text-left ${currentValue.includes(option) ? 'bg-yellow-100 border-yellow-500' : 'bg-white border-gray-300'}`}
              onClick={() => handleSelect(option)}
              disabled={loading}
            >
              <span className="flex items-center">
                <span className={`inline-block w-5 h-5 mr-2 border rounded ${currentValue.includes(option) ? 'bg-yellow-400 border-yellow-600' : 'bg-white border-gray-300'}`}></span>
                {option}
              </span>
            </button>
          ))}
        </div>
      )}
      {currentStep.type === 'selectOrText' && (
        <div className="flex flex-col gap-3 mb-6">
          {currentStep.options.map((option) => (
            <button
              key={option}
              className={`w-full px-6 py-4 rounded-lg border text-left ${currentValue === option ? 'bg-yellow-100 border-yellow-500' : 'bg-white border-gray-300'}`}
              onClick={() => handleSelect(option)}
              disabled={loading}
            >
              {option}
            </button>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Other: Type your answer"
              value={step === 1 ? answers.shortTermGoalOther : answers.longTermGoalOther}
              onChange={handleOtherInput}
              disabled={loading}
            />
          </div>
        </div>
      )}
      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-4">
        <button className="text-gray-500" onClick={handleBack} disabled={step === 0 || loading}>Back</button>
        <div className="flex gap-2">
          <button
            className="text-gray-500"
            onClick={handleSkip}
            disabled={loading}
          >
            Skip for now
          </button>
          <button
            className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold"
            onClick={handleNext}
            disabled={loading || (step === 3 ? currentValue.length === 0 : !currentValue)}
          >
            {step === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
      <div className="mt-8 text-sm text-gray-500 text-center">We use your answers to help you plan better. Your data is secure and never shared.</div>
    </div>
  );
} 