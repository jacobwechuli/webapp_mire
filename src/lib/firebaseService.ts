import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  FirebaseTransaction, 
  FirebaseSavingsGoal, 
  FirebaseBill,
  FirebaseExpenditure,
  FirebaseUserProfile,
  FIREBASE_COLLECTIONS,
  getFirebasePaths 
} from './firebaseDataStructure';
import { Transaction } from './types';

export class FirebaseService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  protected getUserId(): string {
    return this.userId;
  }

  private getPaths() {
    return getFirebasePaths(this.userId);
  }

  // ===== TRANSACTIONS =====
  async getTransactions(): Promise<FirebaseTransaction[]> {
    try {
      const transactionsRef = collection(db, this.getPaths().transactions);
      const q = query(transactionsRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseTransaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async addTransaction(transaction: Omit<FirebaseTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const transactionsRef = collection(db, this.getPaths().transactions);
      const docRef = await addDoc(transactionsRef, {
        ...transaction,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id: string, updates: Partial<FirebaseTransaction>): Promise<void> {
    try {
      const transactionRef = doc(db, this.getPaths().transactions, id);
      await updateDoc(transactionRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      const transactionRef = doc(db, this.getPaths().transactions, id);
      await deleteDoc(transactionRef);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Real-time transactions listener
  subscribeToTransactions(callback: (transactions: FirebaseTransaction[]) => void) {
    const transactionsRef = collection(db, this.getPaths().transactions);
    const q = query(transactionsRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseTransaction[];
      callback(transactions);
    });
  }

  // ===== SAVINGS GOALS =====
  async getSavingsGoals(): Promise<FirebaseSavingsGoal[]> {
    try {
      const goalsRef = collection(db, this.getPaths().savingsGoals);
      const q = query(goalsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseSavingsGoal[];
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      throw error;
    }
  }

  async addSavingsGoal(goal: Omit<FirebaseSavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const goalsRef = collection(db, this.getPaths().savingsGoals);
      const docRef = await addDoc(goalsRef, {
        ...goal,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding savings goal:', error);
      throw error;
    }
  }

  async updateSavingsGoal(id: string, updates: Partial<FirebaseSavingsGoal>): Promise<void> {
    try {
      const goalRef = doc(db, this.getPaths().savingsGoals, id);
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    try {
      const goalRef = doc(db, this.getPaths().savingsGoals, id);
      await deleteDoc(goalRef);
    } catch (error) {
      console.error('Error deleting savings goal:', error);
      throw error;
    }
  }

  // Real-time savings goals listener
  subscribeToSavingsGoals(callback: (goals: FirebaseSavingsGoal[]) => void) {
    const goalsRef = collection(db, this.getPaths().savingsGoals);
    const q = query(goalsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const goals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseSavingsGoal[];
      callback(goals);
    });
  }

  // ===== BILLS =====
  async getBills(): Promise<FirebaseBill[]> {
    try {
      const billsRef = collection(db, this.getPaths().bills);
      const q = query(billsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseBill[];
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }

  async addBill(bill: Omit<FirebaseBill, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('Adding bill to Firebase with data:', bill);
      
      // Validate the bill data
      if (!bill.name || !bill.amount || !bill.frequency) {
        throw new Error('Missing required bill fields');
      }
      
      const billsRef = collection(db, this.getPaths().bills);
      const billData = {
        ...bill,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('Saving bill data:', billData);
      const docRef = await addDoc(billsRef, billData);
      console.log('Bill added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding bill:', error);
      throw error;
    }
  }

  async updateBill(id: string, updates: Partial<FirebaseBill>): Promise<void> {
    try {
      const billRef = doc(db, this.getPaths().bills, id);
      await updateDoc(billRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
  }

  async deleteBill(id: string): Promise<void> {
    try {
      const billRef = doc(db, this.getPaths().bills, id);
      await deleteDoc(billRef);
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  }

  // Real-time bills listener
  subscribeToBills(callback: (bills: FirebaseBill[]) => void) {
    const billsRef = collection(db, this.getPaths().bills);
    // Order by createdAt instead of dueDate since not all bills have dueDate
    const q = query(billsRef, orderBy('createdAt', 'desc'));
    
    console.log('Setting up bills subscription for path:', this.getPaths().bills);
    
    return onSnapshot(q, (querySnapshot) => {
      console.log('Bills subscription triggered, docs count:', querySnapshot.docs.length);
      const bills = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Bill doc:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      }) as FirebaseBill[];
      console.log('Processed bills:', bills);
      callback(bills);
    }, (error) => {
      console.error('Bills subscription error:', error);
    });
  }

  // ===== EXPENDITURE =====
  async getExpenditure(): Promise<FirebaseExpenditure[]> {
    try {
      const expenditureRef = collection(db, this.getPaths().expenditure);
      const q = query(expenditureRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseExpenditure[];
    } catch (error) {
      console.error('Error fetching expenditure:', error);
      throw error;
    }
  }

  async addExpenditure(expenditure: Omit<FirebaseExpenditure, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const expenditureRef = collection(db, this.getPaths().expenditure);
      const docRef = await addDoc(expenditureRef, {
        ...expenditure,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding expenditure:', error);
      throw error;
    }
  }

  async updateExpenditure(id: string, updates: Partial<FirebaseExpenditure>): Promise<void> {
    try {
      const expenditureRef = doc(db, this.getPaths().expenditure, id);
      await updateDoc(expenditureRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating expenditure:', error);
      throw error;
    }
  }

  async deleteExpenditure(id: string): Promise<void> {
    try {
      const expenditureRef = doc(db, this.getPaths().expenditure, id);
      await deleteDoc(expenditureRef);
    } catch (error) {
      console.error('Error deleting expenditure:', error);
      throw error;
    }
  }

  // Real-time expenditure listener
  subscribeToExpenditure(callback: (expenditure: FirebaseExpenditure[]) => void) {
    const expenditureRef = collection(db, this.getPaths().expenditure);
    const q = query(expenditureRef, orderBy('date', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const expenditure = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseExpenditure[];
      callback(expenditure);
    });
  }

  // ===== USER PROFILE =====
  async getUserProfile(): Promise<FirebaseUserProfile | null> {
    try {
      const userRef = doc(db, this.getPaths().userProfile);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as FirebaseUserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(updates: Partial<FirebaseUserProfile>): Promise<void> {
    try {
      const userRef = doc(db, this.getPaths().userProfile);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // ===== ONBOARDING =====
  async saveOnboardingData(data: { goal: string; income: string; setupType: 'simple' | 'advanced' }): Promise<void> {
    try {
      await this.updateUserProfile({
        goal: data.goal,
        income: data.income,
        setupType: data.setupType,
      });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      throw error;
    }
  }

  // ===== BATCH OPERATIONS =====
  async batchUpdateTransactions(transactions: FirebaseTransaction[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      transactions.forEach(transaction => {
        const transactionRef = doc(db, this.getPaths().transactions, transaction.id);
        batch.set(transactionRef, {
          ...transaction,
          updatedAt: serverTimestamp(),
        });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error batch updating transactions:', error);
      throw error;
    }
  }

  // ===== UTILITY METHODS =====
  async clearAllData(): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Clear transactions
      const transactionsSnapshot = await getDocs(collection(db, this.getPaths().transactions));
      transactionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Clear savings goals
      const goalsSnapshot = await getDocs(collection(db, this.getPaths().savingsGoals));
      goalsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Clear bills
      const billsSnapshot = await getDocs(collection(db, this.getPaths().bills));
      billsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

// Export a factory function to create Firebase service instances
export const createFirebaseService = (userId: string) => new FirebaseService(userId); 