import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { router } from 'expo-router';

type User = {
  id: number;
  email: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const database = useSQLiteContext();

  useEffect(() => {
    // Check if there's a logged in user
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const lastUser = await database.getFirstAsync<User>(
        'SELECT * FROM user LIMIT 1;'
      );
      if (lastUser) {
        setUser(lastUser);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
