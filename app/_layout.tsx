import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { BudgetProvider } from '@/context/BudgetContext';
import { SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';

const createDbIfNeeded = async (db: SQLiteDatabase) => {
  console.log('Creating database');
  try {
    // Create a table
    console.log('Creating transactions table');
    // Use the BudgetEntry type to define columns
    await db.execAsync(
      'CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, amount INTEGER, category TEXT, description TEXT, date TEXT, type TEXT);'
    );

    console.log('Creating users table');
    await db.execAsync(
      'CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, password TEXT);'
    );
  } catch (error) {
    console.error('Error creating database:', error);
  }
};

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SQLiteProvider databaseName="test.db" onInit={createDbIfNeeded}>
      <BudgetProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </BudgetProvider>
    </SQLiteProvider>
  );
}
