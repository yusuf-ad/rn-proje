import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

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
  const database = useSQLiteContext();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const transactionResult = await database.getAllAsync<BudgetEntry>(
        'SELECT * FROM transactions;',
        []
      );

      setEntries(transactionResult);
    } catch (error) {
      console.error('Error loading entries from SQLite:', error);
    }
  };

  const addEntry = async (entry: Omit<BudgetEntry, 'id'>) => {
    try {
      // Veritabanına yeni kayıt ekle
      const result = await database.runAsync(
        `INSERT INTO transactions
           (amount, category, description, date, type)
         VALUES (?, ?, ?, ?, ?);`,
        [
          entry.amount,
          entry.category,
          entry.description,
          entry.date,
          entry.type,
        ]
      );

      // insertId ile oluşan otomatik id'yi alıp state'e ekleyelim
      const newEntry: BudgetEntry = {
        ...entry,
        id: result.lastInsertRowId.toString(),
      };

      setEntries((prev) => [...prev, newEntry]);
    } catch (error) {
      console.error('Error adding entry to SQLite:', error);
    }
  };

  const updateEntry = async (updatedEntry: BudgetEntry) => {
    try {
      await database.runAsync(
        `UPDATE transactions SET amount=?, category=?, description=?, date=?, type=? WHERE id=?;`,
        [
          updatedEntry.amount,
          updatedEntry.category,
          updatedEntry.description,
          updatedEntry.date,
          updatedEntry.type,
          updatedEntry.id,
        ]
      );
      const newEntries = entries.map((entry) =>
        entry.id === updatedEntry.id ? updatedEntry : entry
      );
      setEntries(newEntries);
    } catch (error) {
      console.error('Error updating entry in SQLite:', error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await database.runAsync(`DELETE FROM transactions WHERE id=?;`, [id]);
      const newEntries = entries.filter((entry) => entry.id !== id);
      setEntries(newEntries);
    } catch (error) {
      console.error('Error deleting entry from SQLite:', error);
    }
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
      }}
    >
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
