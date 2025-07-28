import { FirebaseService } from './firebaseService';
import { dataCache, userCache, cacheUtils } from './cache';
import { FirebaseTransaction, FirebaseSavingsGoal, FirebaseBill, FirebaseExpenditure, FirebaseUserProfile } from './firebaseDataStructure';

export class CachedFirebaseService extends FirebaseService {
  constructor(userId: string) {
    super(userId);
  }

  // Override getTransactions with caching
  async getTransactions(): Promise<FirebaseTransaction[]> {
    const cacheKey = cacheUtils.generateDataKey('transactions', this.getUserId());
    const cached = dataCache.get<FirebaseTransaction[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const transactions = await super.getTransactions();
    dataCache.set(cacheKey, transactions, 5 * 60 * 1000); // 5 minutes cache
    return transactions;
  }

  // Override addTransaction to invalidate cache
  async addTransaction(transaction: Omit<FirebaseTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const result = await super.addTransaction(transaction);
    cacheUtils.invalidateDataType(this.getUserId(), 'transactions');
    return result;
  }

  // Override updateTransaction to invalidate cache
  async updateTransaction(id: string, updates: Partial<FirebaseTransaction>): Promise<void> {
    await super.updateTransaction(id, updates);
    cacheUtils.invalidateDataType(this.getUserId(), 'transactions');
  }

  // Override deleteTransaction to invalidate cache
  async deleteTransaction(id: string): Promise<void> {
    await super.deleteTransaction(id);
    cacheUtils.invalidateDataType(this.getUserId(), 'transactions');
  }

  // Override getSavingsGoals with caching
  async getSavingsGoals(): Promise<FirebaseSavingsGoal[]> {
    const cacheKey = cacheUtils.generateDataKey('savingsGoals', this.getUserId());
    const cached = dataCache.get<FirebaseSavingsGoal[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const goals = await super.getSavingsGoals();
    dataCache.set(cacheKey, goals, 10 * 60 * 1000); // 10 minutes cache
    return goals;
  }

  // Override addSavingsGoal to invalidate cache
  async addSavingsGoal(goal: Omit<FirebaseSavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const result = await super.addSavingsGoal(goal);
    cacheUtils.invalidateDataType(this.getUserId(), 'savingsGoals');
    return result;
  }

  // Override updateSavingsGoal to invalidate cache
  async updateSavingsGoal(id: string, updates: Partial<FirebaseSavingsGoal>): Promise<void> {
    await super.updateSavingsGoal(id, updates);
    cacheUtils.invalidateDataType(this.getUserId(), 'savingsGoals');
  }

  // Override deleteSavingsGoal to invalidate cache
  async deleteSavingsGoal(id: string): Promise<void> {
    await super.deleteSavingsGoal(id);
    cacheUtils.invalidateDataType(this.getUserId(), 'savingsGoals');
  }

  // Override getBills with caching
  async getBills(): Promise<FirebaseBill[]> {
    const cacheKey = cacheUtils.generateDataKey('bills', this.getUserId());
    const cached = dataCache.get<FirebaseBill[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const bills = await super.getBills();
    dataCache.set(cacheKey, bills, 10 * 60 * 1000); // 10 minutes cache
    return bills;
  }

  // Override addBill to invalidate cache
  async addBill(bill: Omit<FirebaseBill, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const result = await super.addBill(bill);
    cacheUtils.invalidateDataType(this.getUserId(), 'bills');
    return result;
  }

  // Override updateBill to invalidate cache
  async updateBill(id: string, updates: Partial<FirebaseBill>): Promise<void> {
    await super.updateBill(id, updates);
    cacheUtils.invalidateDataType(this.getUserId(), 'bills');
  }

  // Override deleteBill to invalidate cache
  async deleteBill(id: string): Promise<void> {
    await super.deleteBill(id);
    cacheUtils.invalidateDataType(this.getUserId(), 'bills');
  }

  // Override getExpenditure with caching
  async getExpenditure(): Promise<FirebaseExpenditure[]> {
    const cacheKey = cacheUtils.generateDataKey('expenditure', this.getUserId());
    const cached = dataCache.get<FirebaseExpenditure[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const expenditure = await super.getExpenditure();
    dataCache.set(cacheKey, expenditure, 5 * 60 * 1000); // 5 minutes cache
    return expenditure;
  }

  // Override addExpenditure to invalidate cache
  async addExpenditure(expenditure: Omit<FirebaseExpenditure, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const result = await super.addExpenditure(expenditure);
    cacheUtils.invalidateDataType(this.getUserId(), 'expenditure');
    return result;
  }

  // Override updateExpenditure to invalidate cache
  async updateExpenditure(id: string, updates: Partial<FirebaseExpenditure>): Promise<void> {
    await super.updateExpenditure(id, updates);
    cacheUtils.invalidateDataType(this.getUserId(), 'expenditure');
  }

  // Override deleteExpenditure to invalidate cache
  async deleteExpenditure(id: string): Promise<void> {
    await super.deleteExpenditure(id);
    cacheUtils.invalidateDataType(this.getUserId(), 'expenditure');
  }

  // Override getUserProfile with caching
  async getUserProfile(): Promise<FirebaseUserProfile | null> {
    const cacheKey = cacheUtils.generateUserKey(this.getUserId(), 'profile');
    const cached = userCache.get<FirebaseUserProfile>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const profile = await super.getUserProfile();
    if (profile) {
      userCache.set(cacheKey, profile, 30 * 60 * 1000); // 30 minutes cache
    }
    return profile;
  }

  // Override updateUserProfile to invalidate cache
  async updateUserProfile(updates: Partial<FirebaseUserProfile>): Promise<void> {
    await super.updateUserProfile(updates);
    const cacheKey = cacheUtils.generateUserKey(this.getUserId(), 'profile');
    userCache.delete(cacheKey);
  }

  // Method to clear all cached data for this user
  clearUserCache(): void {
    cacheUtils.invalidateUserCache(this.getUserId());
  }

  // Method to get cache statistics
  getCacheStats() {
    return {
      dataCacheSize: dataCache.size(),
      userCacheSize: userCache.size(),
    };
  }
}

export const createCachedFirebaseService = (userId: string) => new CachedFirebaseService(userId); 