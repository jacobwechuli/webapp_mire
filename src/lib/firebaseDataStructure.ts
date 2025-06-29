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
  dueDate: string;
  description: string;
  frequency: string;
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