import { Transaction } from './types';

// Firebase Data Structure Types
export interface FirebaseUserProfile {
  displayName: string;
  email: string;
  dateOfBirth?: string;
  phone?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
  // Onboarding fields
  goal?: string;
  income?: string;
  setupType?: 'simple' | 'advanced';
  mainReason?: string;
  shortTermGoal?: string;
  longTermGoal?: string;
  budgetChallenge?: string[];
  incomeSource?: string;
  incomeFrequency?: string;
  // Budget templates
  budgetTemplates?: {
    id?: string;
    name: string;
    incomes: { source: string; amount: number }[];
    expenses: { category: string; amount: number }[];
    frequency: 'monthly' | 'weekly' | 'random';
    notes?: string;
    month?: string; // e.g. '2024-03' for March 2024
  }[];
}

export interface FirebaseTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseSavingsGoal {
  id: string;
  item: string;
  amount: number;
  targetDate: string;
  saved: number;
  history: {
    date: string;
    amount: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseBill {
  id: string;
  name: string;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'weekly';
  // For one-time bills: specific date
  dueDate?: string; // ISO date string for one-time bills
  // For monthly bills: day of month (1-31)
  monthlyDay?: number;
  // For weekly bills: day of week (0-6, Sunday = 0)
  weeklyDay?: number;
  // For weekly bills: time (optional)
  weeklyTime?: string; // HH:MM format
  description: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

// Firebase Collection Paths
export const FIREBASE_COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  SAVINGS_GOALS: 'savingsGoals',
  BILLS: 'bills',
} as const;

// Firebase Document Paths
export const getFirebasePaths = (userId: string) => ({
  userProfile: `${FIREBASE_COLLECTIONS.USERS}/${userId}`,
  transactions: `${FIREBASE_COLLECTIONS.USERS}/${userId}/${FIREBASE_COLLECTIONS.TRANSACTIONS}`,
  savingsGoals: `${FIREBASE_COLLECTIONS.USERS}/${userId}/${FIREBASE_COLLECTIONS.SAVINGS_GOALS}`,
  bills: `${FIREBASE_COLLECTIONS.USERS}/${userId}/${FIREBASE_COLLECTIONS.BILLS}`,
});

// Data Structure Overview:
/*
users/{userId}/
├── displayName: string
├── email: string
├── dateOfBirth: string (optional)
├── phone: string (optional)
├── country: string (optional)
├── createdAt: timestamp
└── updatedAt: timestamp

users/{userId}/transactions/{transactionId}/
├── description: string
├── amount: number
├── type: 'income' | 'expense'
├── category: string
├── date: string (ISO)
├── createdAt: timestamp
└── updatedAt: timestamp

users/{userId}/savingsGoals/{goalId}/
├── item: string
├── amount: number
├── targetDate: string (ISO)
├── saved: number
├── history: array
│   ├── date: string (ISO)
│   └── amount: number
├── createdAt: timestamp
└── updatedAt: timestamp

users/{userId}/bills/{billId}/
├── name: string
├── amount: number
├── dueDate: string (ISO)
├── description: string
├── frequency: string
├── isPaid: boolean
├── createdAt: timestamp
└── updatedAt: timestamp
*/ 