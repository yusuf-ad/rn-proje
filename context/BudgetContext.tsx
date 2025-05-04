import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BudgetEntry = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
};

type BudgetContextType = {
  entries: BudgetEntry[];
  addEntry: (entry: Omit<BudgetEntry, 'id'>) => Promise<void>;
  updateEntry: (entry: BudgetEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const categories = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Salary',
  'Investment',
  'Other',
];

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('budgetEntries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const saveEntries = async (newEntries: BudgetEntry[]) => {
    try {
      await AsyncStorage.setItem('budgetEntries', JSON.stringify(newEntries));
    } catch (error) {
      console.error('Error saving entries:', error);
    }
  };

  const addEntry = async (entry: Omit<BudgetEntry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    await saveEntries(newEntries);
  };

  const updateEntry = async (updatedEntry: BudgetEntry) => {
    const newEntries = entries.map((entry) =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setEntries(newEntries);
    await saveEntries(newEntries);
  };

  const deleteEntry = async (id: string) => {
    const newEntries = entries.filter((entry) => entry.id !== id);
    setEntries(newEntries);
    await saveEntries(newEntries);
  };

  const totalIncome = entries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = entries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <BudgetContext.Provider
      value={{
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        totalIncome,
        totalExpenses,
        balance,
      }}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}