import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import { login as loginAPI, register as registerAPI } from '../api/auth';
import { getMe } from '../api/user';
import { RegisterData } from '@/types/auth';

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  loading: true,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Na inicialização, tenta carregar token e user do AsyncStorage
  useEffect(() => {
    const loadStorage = async () => {
      const storagedToken = await AsyncStorage.getItem('@vittaaqui:token');
      if (storagedToken) {
        setToken(storagedToken);
        try {
          const userData = await getMe();
          setUser(userData);
        } catch {
          // token inválido / expirado
          setToken(null);
          await AsyncStorage.removeItem('@vittaaqui:token');
        }
      }
      setLoading(false);
    };
    loadStorage();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { token: jwt, user: userData } = await loginAPI({ email, password });
    await AsyncStorage.setItem('@vittaaqui:token', jwt);
    setToken(jwt);
    setUser(userData);
    setLoading(false);
  };

  const signUp = async (data: RegisterData) => {
    setLoading(true);
    const { token: jwt, user: userData } = await registerAPI(data);
    await AsyncStorage.setItem('@vittaaqui:token', jwt);
    setToken(jwt);
    setUser(userData);
    setLoading(false);
  };

  const signOut = async () => {
    setLoading(true);
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('@vittaaqui:token');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

