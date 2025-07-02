import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import { login as loginAPI, register as registerAPI } from '../api/auth';
import { getMe } from '../api/user';
import { RegisterData } from '@/types/auth';

interface AuthContextProps {
  user: User | null;
  token: string | null;
  initializing: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  initializing: true,
  loading: false,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { }
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadStorage = async () => {
      const storagedToken = await AsyncStorage.getItem('@vittaaqui:token');
      if (storagedToken) {
        setToken(storagedToken);
        try {
          const userData = await getMe();
          setUser(userData);
        } catch {
          await AsyncStorage.removeItem('@vittaaqui:token');
          setToken(null);
        }
      }
      setInitializing(false);
    };
    loadStorage();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token: jwt, user: userData } = await loginAPI({ email, password });
      await AsyncStorage.setItem('@vittaaqui:token', jwt);
      setToken(jwt);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: RegisterData) => {
    setLoading(true);
    try {
      const { token: jwt, user: userData } = await registerAPI(data);
      await AsyncStorage.setItem('@vittaaqui:token', jwt);
      setToken(jwt);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeItem('@vittaaqui:token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, initializing, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
