export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // ISO string for Date
}

export const INCOME_CATEGORIES = ['Salary', 'Bonus', 'Freelance', 'Investment', 'Gift', 'Other Income'];
export const EXPENSE_CATEGORIES = [
  'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare', 
  'Entertainment', 'Education', 'Shopping', 'Personal Care', 
  'Debt Payment', 'Savings Contribution', 'Gifts/Donations', 'Other Expense'
];
