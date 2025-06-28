export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string for Date
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO string
  description?: string;
  frequency?: string; // e.g., 'Monthly', 'Yearly'
}

export interface Profile {
  id: string;
  display_name: string | null;
  email: string | null;
  date_of_birth: string | null; // ISO date string
  phone: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export const INCOME_CATEGORIES = ['Salary', 'Bonus', 'Freelance', 'Investment', 'Gift', 'Other Income'];
export const EXPENSE_CATEGORIES = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare', 
  'Entertainment', 'Education', 'Shopping', 'Personal Care', 
  'Debt Payment', 'Savings Contribution', 'Gifts/Donations', 'Other Expense'
];
